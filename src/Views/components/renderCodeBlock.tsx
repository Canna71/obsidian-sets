
import { render } from "solid-js/web";
import { Clause, IntrinsicAttributeKey, SortField } from "src/Data/Query";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { Scope, VaultDB, VaultScope } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import CodeBlock, { ViewMode } from "./CodeBlock";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { AppProvider } from "./AppProvider";
import { BlockProvider } from "./BlockProvider";
import { saveDataIntoBlock } from "src/Utils/saveDataIntoBlock";
import { getSetsSettings } from "src/main";

// export interface FieldDefinition {
//     key: string;
    
// }

export type FieldDefinition = string;

// export interface BlockContext {
//     state: SetDefinition,
//     update: (def:SetDefinition) => void;
// }

export interface SetDefinition {
    scope?: Scope;
    // type?: string;
    // collection?: string;
    filter?: Clause[];
    fields?: FieldDefinition[];
    sortby?: SortField[];
    transientState?: any;
    grid?: {
        columnWidths?: Record<string,string>;
    }
}

const stateMap = new Map<string, any>();



const renderCodeBlock = (app: App, db: VaultDB, definition: SetDefinition, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const clauses = definition.filter || [];

    const context = db.getDataContext(ctx.sourcePath);
    const sortby = definition.sortby || [];
    const scope = definition.scope || VaultScope;
    const [scopeType,what] : Scope = scope;

    let query;
    db.fromClauses(scope, clauses, sortby, context);
    // switch(scope) {
    //     case "vault":  
    //         query = db.fromClauses(definition.scope, clauses, sortby, context); 
    //     break;
    //     case "type":
    //         query = db.fromClausesSet(what!, clauses, sortby, context);
    //         break;
    //     case "collection":
    //         query = db.fromClausesCollection(what!, clauses, sortby, context);
    //         break;
    //     case "folder":
    //         // query = db.fromClausesFolder(what!, clauses, sortby, context);
    //         break;
    // }
    



    const initialdata = db.execute(query);

    const [data, setData] = createStore(initialdata);

    const [viewMode, setViewMode] = createSignal<ViewMode>("grid" as ViewMode);

    const onDataChanged = () => {
        const newData = db.execute(query);
        
        setData(newData);
    }

    db.on("metadata-changed", onDataChanged);

    onCleanup(() => {
        db.off("metadata-changed", onDataChanged);
    })

    let fieldDefinitions = definition.fields;
    if (!fieldDefinitions) {
        if (scopeType == "type") {
            if (getSetsSettings().inferSetFieldsByDefault) {
                fieldDefinitions = db.inferFields(initialdata)
            } else {
                fieldDefinitions = db.getTypeAttributes(what!)
            }
        } else if (scopeType == "collection") {
            if (getSetsSettings().inferCollectionFieldsByDefault) {
                fieldDefinitions = db.inferFields(initialdata)
            } 
        }

        
        fieldDefinitions = [IntrinsicAttributeKey.FileName , ...(fieldDefinitions||[])]
        if(scopeType==="type" && !getSetsSettings().inferSetFieldsByDefault) {
            definition = {...definition, fields: fieldDefinitions}
        }
    }


    const attributes: AttributeDefinition[] =
        fieldDefinitions.map(key => db.getAttributeDefinition(key));


    const stateKey = ctx.sourcePath;
    // Saves current scroll position into the state map and deletes it from the definition
    const updateDefinition = (def: SetDefinition) => {
        const scrollLeft = el.querySelector(".sets-gridview-scroller")?.scrollLeft;
        // def.scroll = scrollLeft;
        stateMap.set(stateKey, { scroll: scrollLeft });
        delete def.transientState;
        saveDataIntoBlock<SetDefinition>(def, ctx)
    }

    definition.transientState = stateMap.get(stateKey);
    stateMap.delete(stateKey);


    render(() =>
        <AppProvider app={{app, db}}>
            <BlockProvider setDefinition={definition} updateDefinition={updateDefinition} >
                <CodeBlock queryResult={data} attributes={attributes} viewMode={{
                    viewMode, setViewMode
                }} />
            </BlockProvider>

        </AppProvider>, el);
}

export default renderCodeBlock;

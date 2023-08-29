
import { render } from "solid-js/web";
import { Clause, IntrinsicAttributeKey, SortField } from "src/Data/Query";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { VaultDB } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import CodeBlock, { ViewMode } from "./CodeBlock";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { AppProvider } from "./AppProvider";
import { BlockProvider } from "./BlockProvider";
import { saveDataIntoBlock } from "src/Utils/saveDataIntoBlock";
import { getSetsSettings } from "src/main";

export interface FieldDefinition {
    key: string;
    width?: string;
}

export interface SetDefinition {
    type?: string;
    collection?: string;
    filter?: Clause[];
    fields?: FieldDefinition[];
    sortby?: SortField[];
    transientState?: any;
}

const stateMap = new Map<string, any>();



const renderCodeBlock = (app: App, db: VaultDB, definition: SetDefinition, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const clauses = definition.filter || [];

    const context = db.getDataContext(ctx.sourcePath);
    const sortby = definition.sortby || [];

    let query;
    if (definition.type) {
        query = db.fromClausesSet(definition.type, clauses, sortby, context);
    } else if (definition.collection) {
        query = db.fromClausesCollection(definition.collection, clauses, sortby, context);
    } else {
        query = db.fromClauses(clauses, sortby, context);
    }



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
        if (definition.type) {
            if (getSetsSettings().inferSetFieldsByDefault) {
                fieldDefinitions = db.inferFields(initialdata).map(key => ({ key }))
            } else {
                fieldDefinitions = db.getTypeAttributes(definition.type)?.map(key => ({ key }))
                
                
            }
        } else if (definition.collection) {
            if (getSetsSettings().inferCollectionFieldsByDefault) {
                fieldDefinitions = db.inferFields(initialdata).map(key => ({ key }))
            }
        }

        
        fieldDefinitions = [{ key: IntrinsicAttributeKey.FileName, width: undefined }, ...(fieldDefinitions||[])]
        if(definition.type && !getSetsSettings().inferSetFieldsByDefault) {
            definition = {...definition, fields: fieldDefinitions}
        }
    }

    
            


    const attributes: AttributeDefinition[] =
        fieldDefinitions.map(fd => fd.key)
            .map(key => db.getAttributeDefinition(key));

    // if (attributes.length === 0) {
    //     attributes.push(db.getAttributeDefinition(IntrinsicAttributeKey.FileName))
    // }

    const updateDefinition = (def: SetDefinition) => {
        const scrollLeft = el.querySelector(".sets-gridview-scroller")?.scrollLeft;
        // def.scroll = scrollLeft;
        stateMap.set("TODO", { scroll: scrollLeft });
        delete def.transientState;
        saveDataIntoBlock<SetDefinition>(def, ctx)
    }

    console.log(`scroll from map:`, stateMap.get("TODO"))
    definition.transientState = stateMap.get("TODO");
    stateMap.delete("TODO");
    render(() =>
        <AppProvider app={app}>
            <BlockProvider setDefinition={definition} updateDefinition={updateDefinition} >
                <CodeBlock queryResult={data} attributes={attributes} viewMode={{
                    viewMode, setViewMode
                }} />
            </BlockProvider>

        </AppProvider>, el);
}

export default renderCodeBlock;

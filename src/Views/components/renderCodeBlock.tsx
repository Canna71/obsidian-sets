
import { render } from "solid-js/web";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { QueryResult, VaultDB, limitResults } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup, onMount } from "solid-js";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { AppProvider } from "./AppProvider";
import { SetProvider } from "./SetProvider";
import { saveDataIntoBlock } from "src/Utils/saveDataIntoBlock";
import { getSetsSettings } from "src/main";
import { IntrinsicAttributeKey, Scope, SetDefinition, VaultScope } from "./SetDefinition";
import CodeBlock from "./CodeBlock";



const stateMap = new Map<string, any>();



const renderCodeBlock = (app: App, db: VaultDB, definition: SetDefinition, el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const clauses = definition.filter || [];

    const context = db.getDataContext(ctx.sourcePath);
    const sortby = definition.sortby || [];
    const scope = definition.scope || VaultScope;
    // desctructure the scope using Object.entries
    const [scopeType, what] = scope;
    

    // const {scopeType,what} : Scope = scope;

    // let query;
    const query = db.fromClauses(scope, clauses, sortby, context);
    
    const initialdata = db.execute(query);

    const [data, setData] = createStore(initialdata);

    // const [viewMode, setViewMode] = createSignal<ViewMode>("grid" as ViewMode);
    // we measur when the component was last rendered
    const lastRendered = Date.now();

    const refresh = () => {
        const newData = db.execute(query);
        setData(newData);
    }

    const onDataChanged =() => {
        // cech id this codeblock is still mounted
        if (!el.isConnected) {
            // db.off("metadata-changed", onDataChanged);
            return;
        }

        // we refresh the data only if component was last rendered more than 100ms ago
        if (Date.now() - lastRendered < 100) return;
        refresh();
    };



    onMount(() => {
        setTimeout(() => {
            db.on("metadata-changed", onDataChanged);
        },110);
    })

    

    onCleanup(() => {
        db.off("metadata-changed", onDataChanged);
    })

   // Infer fields
    let attributes: AttributeDefinition[];
    ({ attributes, definition } = inferAttributes(definition, db, initialdata));


    const stateKey = ctx.sourcePath;
    // Saves current scroll position into the state map and deletes it from the definition
    const updateDefinition = (def: SetDefinition) => {
        const scrollLeft = el.querySelector(".sets-view-scroller")?.scrollLeft;
        // def.scroll = scrollLeft;
        stateMap.set(stateKey, { scroll: scrollLeft });
        delete def.transientState;
        db.off("metadata-changed", onDataChanged);
        saveDataIntoBlock<SetDefinition>(def, ctx);
    }

    definition.transientState = stateMap.get(stateKey);
    stateMap.delete(stateKey);


    render(() =>
        <AppProvider app={{app, db}}>
            <SetProvider setDefinition={definition} 
            refresh={refresh}
            updateDefinition={updateDefinition} >
                <CodeBlock queryResult={data} attributes={attributes}  />
            </SetProvider>

        </AppProvider>, el);
}

export default renderCodeBlock;

export function inferAttributes(definition: SetDefinition, db: VaultDB, data: QueryResult) {
    const [scopeType, what] = definition.scope || VaultScope;
    
    let fieldDefinitions = definition.fields;
    if (!fieldDefinitions || fieldDefinitions.length == 0) {
        if (scopeType == "type") {
            if (getSetsSettings().inferSetFieldsByDefault) {
                fieldDefinitions = db.inferFields(data);
            } else {
                fieldDefinitions = db.getTypeAttributes(what!);
            }
        } else if (scopeType == "collection") {
            if (getSetsSettings().inferCollectionFieldsByDefault) {
                fieldDefinitions = db.inferFields(data);
            }
        }

        fieldDefinitions = [IntrinsicAttributeKey.FileName, ...(fieldDefinitions || [])];
        if (scopeType === "type" && !getSetsSettings().inferSetFieldsByDefault) {
            definition = { ...definition, fields: fieldDefinitions };
        }
    }


    const attributes: AttributeDefinition[] = fieldDefinitions.map(key => db.getAttributeDefinition(key));
    return { attributes, definition };
}


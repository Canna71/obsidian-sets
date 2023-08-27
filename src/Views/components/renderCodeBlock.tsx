
import { render } from "solid-js/web";
import {  Clause } from "src/Data/Query";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { VaultDB } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import CodeBlock, { ViewMode } from "./CodeBlock";
import { App, MarkdownPostProcessorContext } from "obsidian";
import { AppProvider } from "./AppProvider";
import { BlockProvider } from "./BlockProvider";
import { saveDataIntoBlock } from "src/Utils/saveDataIntoBlock";

export interface FieldDefinition {
    key: string;
    width?: string;
}

export interface SetDefinition {
    filter? : Clause[];
    fields?: FieldDefinition[];
    transientState?: any;
}

const stateMap = new Map<string,any>();



const renderCodeBlock =  (app:App, db:VaultDB, definition:SetDefinition, el:HTMLElement, ctx: MarkdownPostProcessorContext) => {
    const clauses = definition.filter || [];
    // TODO: get file context from ctx.sourcePath
    const context = db.getDataContext(ctx.sourcePath);
    const query = db.fromClauses(clauses, context);
    const initialdata = db.execute(query);

    const [data, setData] = createStore(initialdata);

    const [viewMode, setViewMode] = createSignal<ViewMode>("grid" as ViewMode);

    const onDataChanged = () => {
        const newData = db.execute(query);
        setData(newData);
    }

    db.on("metadata-changed", onDataChanged);

    onCleanup(()=>{
        db.off("metadata-changed", onDataChanged);
    })

    const fieldDefinitions = definition.fields || [{"key": "__bname"}];
    const attributes : AttributeDefinition[] =  
        fieldDefinitions.map(fd=>fd.key)
        .map(key=>db.getAttributeDefinition(key));
    
    // if (attributes.length === 0) {
    //     attributes.push(db.getAttributeDefinition(IntrinsicAttributeKey.FileName))
    // }

    const updateDefinition = (def: SetDefinition) => {
        const scrollLeft = el.querySelector(".sets-gridview-scroller")?.scrollLeft;
        // def.scroll = scrollLeft;
        stateMap.set("TODO",{scroll: scrollLeft});
        delete def.transientState;
        saveDataIntoBlock<SetDefinition>(def,ctx)
    } 

    console.log(`scroll from map:`, stateMap.get("TODO"))
    definition.transientState = stateMap.get("TODO");
    stateMap.delete("TODO");
    render(()=>
    <AppProvider app={app}>
        <BlockProvider setDefinition={definition} updateDefinition={updateDefinition} >
            <CodeBlock queryResult={data} attributes={attributes}  viewMode={{
                viewMode,setViewMode
            }} />
        </BlockProvider>
        
    </AppProvider>, el);
}

export default renderCodeBlock;

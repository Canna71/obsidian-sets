
import { render } from "solid-js/web";
import {  Clause, Query } from "src/Data/Query";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { VaultDB } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import CodeBlock, { ViewMode } from "./CodeBlock";
import { App } from "obsidian";
import { AppProvider } from "./AppProvider";

export interface FieldDefinition {
    key: string;
    width?: string;
}

export interface SetDefinition {
    filter? : Clause[];
    fields?: FieldDefinition[];
}

const renderCodeBlock =  (app:App, db:VaultDB, definition:SetDefinition, el:HTMLElement) => {
    const clauses = definition.filter || [];
    
    const query = Query.fromClauses(clauses);
    const initialdata = db.query(query);

    const [data, setData] = createStore(initialdata);

    const [viewMode, setViewMode] = createSignal<ViewMode>("grid" as ViewMode);

    const onDataChanged = () => {
        const newData = db.query(query);
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

    render(()=>
    <AppProvider app={app}>
        <CodeBlock queryResult={data} attributes={attributes} fields={fieldDefinitions} viewMode={{
            viewMode,setViewMode
        }} />
    </AppProvider>, el);
}

export default renderCodeBlock;

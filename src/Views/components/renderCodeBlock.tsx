
import { render } from "solid-js/web";
import {  Query } from "src/Data/Query";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { VaultDB } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import CodeBlock, { ViewMode } from "./CodeBlock";
import { App } from "obsidian";
import { AppProvider } from "./AppProvider";
import { getSetsSettings } from "src/main";

const renderCodeBlock =  (app:App, db:VaultDB,query:Query, el:HTMLElement) => {
    const initialdata = db.query(query);
    console.log(`data: `, initialdata);

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

    // TODO: rework since most attributes will be dynamic
    const attributes : AttributeDefinition[] = [
        // {  displayName:()=> "Name", getValue: (data)=>getAttribute(data,
        //         {"cl":"int","key":"Name"}
        //     ) } ,
        db.getAttributeDefinition("FileName"),
        // {  displayName:()=> "Type", getValue: (data)=>getAttribute(data,
        //     {"tag":"md","key":"type"}
        // ) }new MetadataAttributeDefinition("type")
        db.getAttributeDefinition("FileCreationDate"),
        db.getAttributeDefinition(getSetsSettings().typeAttributeKey),

    ]

    render(()=>
    <AppProvider app={app}>
        <CodeBlock queryResult={data} attributes={attributes} viewMode={{
            viewMode,setViewMode
        }} />
    </AppProvider>, el);
}

export default renderCodeBlock;

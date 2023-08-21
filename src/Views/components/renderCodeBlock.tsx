
import { render } from "solid-js/web";
import {  AttributeDefinition, MetadataAttributeDefinition, Query, getAttribute } from "src/Data/Query";
import { VaultDB } from "src/Data/VaultDB";
import { createStore } from "solid-js/store";
import { createSignal, onCleanup } from "solid-js";
import CodeBlock, { ViewMode } from "./CodeBlock";

const renderCodeBlock =  (db:VaultDB,query:Query, el:HTMLElement) => {
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
        {  displayName:()=> "Name", getValue: (data)=>getAttribute(data,
                {"tag":"file","key":"Name"}
            ) },
        // {  displayName:()=> "Type", getValue: (data)=>getAttribute(data,
        //     {"tag":"md","key":"type"}
        // ) }
        new MetadataAttributeDefinition("type")
    ]

    render(()=><CodeBlock queryResult={data} attributes={attributes} viewMode={{
        viewMode,setViewMode
    }} />, el);
}

export default renderCodeBlock;

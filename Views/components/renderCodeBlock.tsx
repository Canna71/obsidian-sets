
import { render } from "solid-js/web";
import { Attribute, Query } from "src/Query";
import { VaultDB } from "src/VaultDB";
import  GridView  from "Views/components/GridView";
import { createStore } from "solid-js/store";
import { onCleanup } from "solid-js";

const renderCodeBlock =  (db:VaultDB,query:Query, el:HTMLElement) => {
    const initialdata = db.query(query);
    console.log(`data: `, initialdata);

    const [data, setData] = createStore(initialdata);

    const onDataChanged = () => {
        const newData = db.query(query);
        setData(newData);
    }

    db.on("metadata-changed", onDataChanged);

    onCleanup(()=>{
        db.off("metadata-changed", onDataChanged);
    })

    const attributes : Attribute[] = [
        { tag: "file", attribute: "Name" },
        { tag: "metadata", attribute: "type", displayName: "Type" }
    ]

    render(()=><GridView data={data} attributes={attributes} />, el);
}

export default renderCodeBlock;

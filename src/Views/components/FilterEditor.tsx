import { Component } from "solid-js";
import { useApp } from "./AppProvider";
import { AttributeModal } from "./AttributeModal";

export const FilterEditor: Component = (props) => {

    const app = useApp();
    // app.metadataTypeManager.properties
    const addClause = (e: MouseEvent) => {
        const am = new AttributeModal(app!);
        am.open();
    };

    return (
        <div>
            <h3>Filter Editor</h3>

            <div><button onClick={addClause}>Add Clause</button></div>
        </div>
    );
};

import { Accessor, Component, Show, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ViewMode } from "./CodeBlock";
import { QueryResult } from "src/Data/VaultDB";
import { setIcon } from "obsidian";
import { QueryEditorModal } from "../QueryEditorModal";
import { useBlock } from "./BlockProvider";
import { useApp } from "./AppProvider";
import { SetDefinition } from "./renderCodeBlock";

const BlockToolbar: Component<{ queryResult: QueryResult, attributes: AttributeDefinition[], viewMode: { viewMode: Accessor<ViewMode>, setViewMode: (vm: ViewMode) => void } }> = (props) => {

    let filterBtn: HTMLDivElement;
    const {app, db} = useApp()!;

    const { definition, save, setDefinition } = useBlock()!;

    const onAdd = async () => {
        //TODO: move elsewhere

        // TODO: find the right path
        // const db = props.queryResult.db;
        db.addToSet(props.queryResult);
    }

    const canAdd = () => {
        return props.queryResult.db.canAdd(props.queryResult);
    }

    const update = (def: SetDefinition) => {
        setDefinition(def);
        save();
    }

    const onFilter = () => {
        const filterModal = new QueryEditorModal(app, props.queryResult.db, definition(), update);
        filterModal.open();
    }

    onMount(() => {
        filterBtn && setIcon(filterBtn, "filter")
    })

    return <div class="sets-codeblock-toolbar">
        <Show when={canAdd()}>
            <button class="sets-toolbar-addbutton mod-cta" onClick={onAdd}>Add</button>

        </Show>
        <div ref={filterBtn!} class="clickable-icon"
            onClick={onFilter}
        ></div>
    </div>
}

export default BlockToolbar;

import { Accessor, Component, Show, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ViewMode } from "./CodeBlock";
import { QueryResult } from "src/Data/VaultDB";
import { setIcon } from "obsidian";
import { FilterEditorModal } from "../FilterEditorModal";
import { useBlock } from "./BlockProvider";
import { useApp } from "./AppProvider";
import { SetDefinition } from "./renderCodeBlock";
import { FieldSelectModal } from "../FieldSelectModal";
import SortingEditorModal from "../SortingEditorModal";

const BlockToolbar: Component<{ queryResult: QueryResult, attributes: AttributeDefinition[], viewMode: { viewMode: Accessor<ViewMode>, setViewMode: (vm: ViewMode) => void } }> = (props) => {

    let filterBtn: HTMLDivElement;
    let fieldsBtn: HTMLDivElement;
    let sortBtn: HTMLDivElement;

    const {app, db} = useApp()!;

    const { definition, save, setDefinition, setNewFile } = useBlock()!;

    const onAdd = async () => {
        const newFile = await db.addToSet(props.queryResult, definition().fields || []);
        // props.queryResult.query.newFile = newFile?.path;
        setNewFile(newFile?.path || "");
    }

    const canAdd = () => {
        return props.queryResult.db.canAdd(props.queryResult);
    }

    const update = (def: SetDefinition) => {
        setDefinition(def);
        save();
    }

    const onFilter = () => {
        const filterModal = new FilterEditorModal(app, props.queryResult.db, definition(), update);
        filterModal.open();
    }

    const onFieldsSelect = () => {
        const fieldsModal = new FieldSelectModal(app, props.queryResult.db, definition(), update);
        fieldsModal.open();
    }

    const onSorting = () => {
        const fieldsModal = new SortingEditorModal(app, props.queryResult.db, definition(), update);
        fieldsModal.open();
    }

    onMount(() => {
        filterBtn && setIcon(filterBtn, "filter")
        fieldsBtn && setIcon(fieldsBtn, "list")
        fieldsBtn && setIcon(sortBtn, "arrow-up-down")

    })

    return <div class="sets-codeblock-toolbar">
        
        <div ref={sortBtn!} class="clickable-icon"
            onClick={onSorting}
        ></div>
        <div ref={fieldsBtn!} class="clickable-icon"
            onClick={onFieldsSelect}
        ></div>
        <div ref={filterBtn!} class="clickable-icon"
            onClick={onFilter}
        ></div>
        <Show when={canAdd()}>
            <button class="sets-toolbar-addbutton mod-cta" onClick={onAdd}>Add</button>

        </Show>
    </div>
}

export default BlockToolbar;

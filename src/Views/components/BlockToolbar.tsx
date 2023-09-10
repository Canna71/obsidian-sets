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
import { ScopeEditorModal } from "../ScopeEditorModal";

const BlockToolbar: Component<{ queryResult: QueryResult, attributes: AttributeDefinition[], viewMode: { viewMode: Accessor<ViewMode>, setViewMode: (vm: ViewMode) => void } }> = (props) => {

    let filterBtn: HTMLDivElement;
    let fieldsBtn: HTMLDivElement;
    let sortBtn: HTMLDivElement;
    let refreshBtn: HTMLDivElement;

    const { app, db } = useApp()!;
    // const view = app.workspace.getActiveViewOfType(MarkdownView);

    // const isEditMode = view?.getMode() === "source";

    const { definition, save, setDefinition, setNewFile,refresh } = useBlock()!;

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
        const filterModal = new FilterEditorModal(app, db, definition(), update);
        filterModal.open();
    }

    const onFieldsSelect = () => {
        const fieldsModal = new FieldSelectModal(app, db, definition(), update);
        fieldsModal.open();
    }

    const onSorting = () => {
        const fieldsModal = new SortingEditorModal(app, db, definition(), update);
        fieldsModal.open();
    }

    const onRefresh = () => {
        refresh();
    }

    const onScope = () => {
        const fieldsModal = new ScopeEditorModal(app, db, definition(), update);
        fieldsModal.open();
    }

    onMount(() => {
        filterBtn && setIcon(filterBtn, "filter")
        fieldsBtn && setIcon(fieldsBtn, "list")
        fieldsBtn && setIcon(sortBtn, "arrow-up-down")
        fieldsBtn && setIcon(refreshBtn, "refresh-cw")
    })

    return (
    
        <div class="sets-codeblock-toolbar">
            <div  class="clickable-icon editmode-only"
                onClick={onScope}
                title="Change scope"
            >Scope</div>

            <div ref={sortBtn!} class="clickable-icon editmode-only"
                onClick={onSorting}
                title="Set Sorting properties"
            ></div>
            <div ref={fieldsBtn!} class="clickable-icon editmode-only"
                onClick={onFieldsSelect}
                title="Select fields to display"
            ></div>
            <div ref={filterBtn!} class="clickable-icon editmode-only"
                onClick={onFilter}
                title="Set filters"
            ></div>
            <div ref={refreshBtn!} class="clickable-icon editmode-only"
                onClick={onRefresh}
                title="Refresh data"
            ></div>
            <Show when={canAdd()}>
                <button class="sets-toolbar-addbutton mod-cta" 
                title="Add new item"
                onClick={onAdd}>Add</button>

            </Show>
        </div>
    
    )
}

export default BlockToolbar;

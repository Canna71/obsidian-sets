import { Accessor, Component, For, Show, createSignal, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { QueryResult } from "src/Data/VaultDB";
import { setIcon } from "obsidian";
import { FilterEditorModal } from "../FilterEditorModal";
import { useSet } from "./SetProvider";
import { useApp } from "./AppProvider";
import { SetDefinition } from "./SetDefinition";
import { FieldSelectModal } from "../FieldSelectModal";
import SortingEditorModal from "../SortingEditorModal";
import { ScopeEditorModal } from "../ScopeEditorModal";
import { generateCodeblock } from "src/Utils/generateCodeblock";
import ViewMode from "./ViewMode";
import { AttributeModal } from "./AttributeModal";
import { PropertyData } from "src/Data/PropertyData";
import { GalleryPropsModal } from "../GalleryPropsModal";
import { getSetsSettings } from "src/main";

const BlockToolbar: Component<{ queryResult: QueryResult, attributes: AttributeDefinition[] }> = (props) => {

    let filterBtn: HTMLDivElement;
    let fieldsBtn: HTMLDivElement;
    let sortBtn: HTMLDivElement;
    let refreshBtn: HTMLDivElement;
    let copyBtn: HTMLDivElement;
    let galleryProps: HTMLDivElement;
    let addItemBtn: HTMLDivElement;

    const { app, db } = useApp()!;
    // const view = app.workspace.getActiveViewOfType(MarkdownView);

    // const isEditMode = view?.getMode() === "source";

    const { definition, save, setDefinition, setNewFile, refresh } = useSet()!;
    const [isTooltipVisible, setIsTooltipVisible] = createSignal(false);

    const onAdd = async () => {
        const newFile = await db.addToSet(props.queryResult.query, definition().fields || []);
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
        const filterModal = new FilterEditorModal(app, db, 
            definition(), 
            getSetsSettings().topResults || 100,
            update);
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
        // refresh();
        save();
    }

    const onScope = () => {
        const fieldsModal = new ScopeEditorModal(app, db, definition(), update);
        fieldsModal.open();
    }

    const onCopy = () => {
        const newDef = { ...definition() };
        const sontent = generateCodeblock(newDef);
        navigator.clipboard.writeText(sontent);
    }

    const scope = () => {
        return definition().scope;
    }


    const scopeDetails = () => {
        const [scopeType] = scope() || [];
        if (scopeType === "collection") {
            return `Collection`;
        }
        if (scopeType === "type") {
            return `Type`;
        }
        if (scopeType === "folder") {
            return `Folder`;
        }
        if (scopeType === "vault") {
            return `Vault`;
        }
        return "Select scope"
    }

    onMount(() => {
        filterBtn && setIcon(filterBtn, "filter")
        fieldsBtn && setIcon(fieldsBtn, "list-plus")
        fieldsBtn && setIcon(sortBtn, "arrow-up-down")
        fieldsBtn && setIcon(refreshBtn, "refresh-cw")
        fieldsBtn && setIcon(copyBtn, "copy")
        fieldsBtn && galleryProps && setIcon(galleryProps, "settings-2")
        fieldsBtn && addItemBtn && setIcon(addItemBtn, "plus-square")
    })

    const viewMode = () => {
        return definition().viewMode;
    }

    const groupingDetails = () => {
        const groupField = definition().board?.groupField;
        // get the attribute definition
        if (groupField) {
            const attribute = db.getAttributeDefinition(groupField);
            return `${attribute.displayName()}`;
        }
        return "Select.."
    }

    const onGrouping = () => {
        const am = new AttributeModal(app!, (pd: PropertyData) => {
            const key = pd.key;
            setDefinition({ ...definition(), board: { ...definition().board, groupField: key } });
            save();
        },
            (pd: PropertyData) => {
                // filters only property with type text
                return pd.typeKey === "text";
            }
        );
        am.open();

    }

    const transcludingDetails = () => {
        const transcludeField = definition().gallery?.transclude;
        // get the attribute definition
        if (transcludeField) {
            const attributes = transcludeField.map(field => db.getAttributeDefinition(field))
                .map(attribute => attribute.displayName())
                .join(", ");
            ;
            return attributes;
        }
        return "Select.."
    }

    const onTransclude = (e: MouseEvent) => {
        // opens a popup using float-ui/dom
        // open GalleryPropsModal
        const galleryPropsModal = new GalleryPropsModal(app, db, definition(),props.attributes, update);
        galleryPropsModal.open();

    }


    return (

        <div class="sets-codeblock-toolbar">
            <div
                class="clickable-icon editmode-only sets-scope"
                onClick={onScope}
                title="Change scope"
            >{scopeDetails()}

            </div>

            <Show when={scope()}>
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

                <div ref={copyBtn!} class="clickable-icon editmode-only"
                    onClick={onCopy}
                    title="Copy block"
                ></div>
                <ViewMode />

                <Show when={viewMode() === "board"}>
                    <div
                        class="clickable-icon editmode-only sets-grouping"
                        onClick={onGrouping}
                        title="Grouping property"
                    >{groupingDetails()}

                    </div>
                </Show>

                <Show when={viewMode() === "gallery"}>
                    <div
                        ref={galleryProps!}
                        class="clickable-icon editmode-only"
                        onClick={onTransclude}
                        title="Gallery settings"
                    >

                    </div>

                </Show>

                <Show when={canAdd()}>
                    <div ref={addItemBtn!} class="sets-toolbar-addbutton clickable-icon"
                        title="Add new item"
                        onClick={onAdd}></div>

                </Show>
            </Show>
        </div>

    )
}

export default BlockToolbar;

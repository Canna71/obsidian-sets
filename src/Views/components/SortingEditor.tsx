import { useApp } from "./AppProvider";
import { useSet } from "./SetProvider";
import { Component, For, createSignal, onMount } from "solid-js";
import { PropertyData, getPropertyData, getPropertyDataById } from "src/Data/PropertyData";
import { Property } from "./Property";
import { setIcon } from "obsidian";
import { DragDropProvider, DragDropSensors, SortableProvider, closestCenter, createSortable } from "@thisbeyond/solid-dnd";


export interface SortingEditorProps {
    // selected: FieldDefinition[];
    exit: () => void;
}

interface SortingPropertyProps {
    key: string,
    descending: boolean
}



export const SortingProperty: Component<SortingPropertyProps> = (props) => {
    const { removeSort, setSortDirection } = useSet()!;
    const { app } = useApp()!;
    let icon: HTMLDivElement;
    // const [state] = useDragDropContext();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const sortable = createSortable(props.key);

    const propertyDate = () => {
        const pd = getPropertyDataById(app, props.key);
        return pd;
    }

    // const onRemove = (e:PropertyData) => {
    //     removeSort(e.key);
    // }

    const onIconClick = (e: MouseEvent) => {
        removeSort(props.key);
    }

    onMount(() => {
        setIcon(icon, "x");

    })

    const onDirectionChange = (event: InputEvent) => {
        const inputElement = event.target as HTMLInputElement;
        const val = inputElement.value === "desc";
        setSortDirection(props.key, val);
    }

    return (
        <div class="sets-sorting-property" use: sortable >

            <Property {...propertyDate()!} />

            <select class="sets-sort-direction"
                oninput={onDirectionChange}
                value={props.descending ? "desc" : "asc"}
            >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>

            </select>
            <div ref={icon!}
                onClick={onIconClick}
                class="sets-field-property-toggle clickable-icon" ></div>
        </div>
    )
}

const SortingEditor: Component<SortingEditorProps> = (props) => {
    const { definition, save, addSort, reorderSort } = useSet()!;
    // https://docs.solidjs.com/references/api-reference/stores/using-stores
    // const [state] = createStore(definition() || []);
    const { app } = useApp()!;
    const [keyword, setKeyword] = createSignal("");
    const onSave = () => {
        save();
        props.exit();
    };

    // const update = () => {

    // };

    const sortFields = () => {
        return definition().sortby || [];
    }

    const available = () => {
        const pd = getPropertyData(app);
        return pd
            // .filter(pd => definition().fields?.length ? definition().fields!.includes(pd.key) : true) // selected in this view
            .filter(pd => !sortFields().map(([field]) => field).includes(pd.key)) // not already in sorting fields
            .filter(pd => pd.name.toLowerCase().includes(keyword().toLowerCase())); // that matches query
    };

    const addToSort = (e: PropertyData) => {
        addSort(e.key, false);
    }

    const onDragStart = ({ draggable }) => {

       
    }

    const onDragEnd = ({ draggable, droppable }) => {
        if (draggable && droppable) {
            if (draggable.id !== droppable.id) {
                reorderSort(draggable.id, droppable.id);
            }
        }

        // setActiveItem(null);
    };

    const ids = () => {

        return sortFields().map(sf => sf[0]);
    }

    return (<div class="sets-sorting-editor">
        <h4>Sort by:</h4>
        <DragDropProvider
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            collisionDetector={closestCenter}
        >
            <DragDropSensors />
            {/* <div class="sets-sorting-fields">
            <For each={sortFields()}>
                {(sortField)=><SortingProperty  key={sortField[0]} descending={sortField[1]} />}
            </For>
        </div> */}

            <div class="sets-sorting-fields">
                <SortableProvider ids={ids()}>
                    <For each={sortFields()}>
                        {(sortField) => <SortingProperty key={sortField[0]} descending={sortField[1]} />}
                    </For>
                </SortableProvider>
                {/* <For each={sortFields()}>
                {(sortField) => <SortingProperty key={sortField[0]} descending={sortField[1]} />}
            </For> */}
            </div>
            <input class="sets-field-search"
                value={keyword()}
                type="search"
                placeholder="Search for a property"
                onInput={(e) => {
                    setKeyword(e.target.value)
                }}></input>
            <div class="sets-fields-label">Available:</div>
            <div class="sets-fields-list selected-props">
                <For each={available()}>{(pd) => <Property {...pd} icon="arrow-up-down" onItemClick={addToSort} />}</For>
            </div>

            <div class="sets-button-bar">
                <button class="mod-cta" onClick={onSave}>Save</button>
                <button class="" onClick={props.exit}>Cancel</button>
            </div>

        </DragDropProvider>
    </div>);
};

export default SortingEditor;

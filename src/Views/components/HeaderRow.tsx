import { Component, For, createSignal } from "solid-js";
import { Header } from "./Header";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { DragDropProvider, DragDropSensors, DragOverlay,SortableProvider,closestCenter
 } from "@thisbeyond/solid-dnd";


const HeaderRow:Component<{colSizes: string, attributes: AttributeDefinition[]}> = (props) => {
    const [activeItem, setActiveItem] = createSignal(null);

    const onDragStart = ({ draggable }) => {

        // console.log(`dragStart`, draggable);
        setActiveItem(draggable.id);
    }

    const onDragEnd = ({ draggable, droppable }) => {
        if (draggable && droppable) {
        const currentItems = props.attributes;
        const fromIndex = currentItems.indexOf(draggable.id);
        const toIndex = currentItems.indexOf(droppable.id);
        console.log(`reorder`,draggable, droppable);
        if (fromIndex !== toIndex) {
            // const updatedItems = currentItems.slice();
            // updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
            // setItems(updatedItems);
        }
        }
        setActiveItem(null);
    };

    const activeHeader = () => {
        const activeKey = activeItem();
        const attr = props.attributes.find(attr => attr.key === activeKey);
        return attr?.displayName()
    }

    const ids = () => props.attributes.map(at => at.key)

    return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetector={closestCenter}
    >
      <DragDropSensors />
        <div class="sets-headers-row" style={{ "grid-template-columns": props.colSizes }}>
            <SortableProvider ids={ids()}>
                <For each={props.attributes}>{(attribute, i) => <Header name={attribute.displayName()} key={attribute.key} />}
                </For>
            </SortableProvider>
            <DragOverlay>
            {/* <Header name={"TODO"} key={activeItem()||""} /> */}
            {/* <div class="sortable">{activeItem()}</div> */}
            <div class="sets-header-draggable">
                
                    <div class="sets-cell-content">{activeHeader()}</div>
            </div>
        </DragOverlay>
        </div>
       
    </DragDropProvider>
    );
}

export default HeaderRow;
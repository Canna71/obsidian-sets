import { Accessor, Component, For, createSignal } from "solid-js";
import { Header } from "./Header";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import {
    DragDropProvider, DragDropSensors, DragOverlay, SortableProvider, closestCenter
} from "@thisbeyond/solid-dnd";
import { useBlock } from "./BlockProvider";

export interface ResizeEvent {
    action: "resize" | "done" | "reset",
    index: number,
    // key: string,
    size: number
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function headerResize(el: Element, onResize: Accessor<(ev:ResizeEvent) => void>) {
    const state: {
        resizing?: Element,
        index: number,
        originalSize?: number,
        mousex?: number
    } = {
        resizing: undefined,
        index: -1,
        mousex: undefined,
        originalSize: undefined
    }

    const onMouseMove = (e: MouseEvent) => {

        if (state.resizing) {
            const delta = e.clientX - state.mousex!;
            console.log(`delta:`, delta)
            const newSize = Math.max(0, state.originalSize! + delta);
            onResize()?.({ action: "resize", size: newSize, index: state.index });
        }

    }

    const onMouseUp = (e: MouseEvent) => {
        console.log('mouseup ');
        if (state.resizing) {
            state.resizing = undefined;
            onResize()?.({ action: "done", size: -1, index: state.index });
            state.index = -1;
        }
        // state.mousex = e.clientX;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
    }

    const getResizing = (e:MouseEvent):Element|undefined => {
        const resizer = (e.target as HTMLDivElement);
        if (resizer.classList.contains("sets-column-resizer")) {
            return resizer!.closest(".sets-header-cell")!;
        }
    } 

    el.addEventListener("mousedown", (e: MouseEvent) => {

        const resizing = getResizing(e);
        if (resizing) { 
            state.resizing = resizing;
            // $0.parentElement.indexOf($0)
            // state.resizing = resizer!.closest(".sets-header-cell")!;
            // const gridRow = state.resizing.closest(".sets-headers-row");
            state.index = state.resizing.parentElement!.indexOf(state.resizing);
            state.originalSize = state.resizing.clientWidth;
            state.mousex = e.clientX;

            window.addEventListener("mousemove", onMouseMove, true)
            window.addEventListener("mouseup", onMouseUp)

        }

    })

    el.addEventListener("dblclick", (e:MouseEvent)=>{
        const resizing = getResizing(e);
        if(resizing){
            const index = resizing.parentElement!.indexOf(resizing);
            
            onResize()?.({ action: "reset", size: -1, index });
        }
    })

    // el.addEventListener("dblclick")

    // TODO: cleanup
}


const HeaderRow: Component<{ attributes: AttributeDefinition[] }> = (props) => {
    const [activeItem, setActiveItem] = createSignal(null);
    const { updateSize } = useBlock()!;
    const block = useBlock()!;

    const onDragStart = ({ draggable }) => {

        // console.log(`dragStart`, draggable);
        setActiveItem(draggable.id);
    }

    const onDragEnd = ({ draggable, droppable }) => {
        if (draggable && droppable) {
            // const currentItems = props.attributes.map(attr => attr.key);
            // const fromIndex = currentItems.indexOf(draggable.id);
            // const toIndex = currentItems.indexOf(droppable.id);
            // console.log(`reorder`,draggable, droppable);
            if (draggable.id !== droppable.id) {
                // const updatedItems = currentItems.slice();
                // updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
                // setItems(updatedItems);
                block.reorder(draggable.id, droppable.id);
            }
        }
        setActiveItem(null);
    };

    const activeHeader = () => {
        const activeKey = activeItem();
        const attr = props.attributes.find(attr => attr.key === activeKey);
        return attr?.displayName()
    }

    const onResize = (ev: ResizeEvent) => {

        switch(ev.action){
            case "resize":
                if (Number.isNumber(ev.size)) {
                    const key = ids()[ev.index];
                    updateSize(key,`${ev.size}px`);
                }
            break;
            case "done":
                block.save();
            break;
            case "reset":
                {
                const key = ids()[ev.index];
                updateSize(key,undefined);
                block.save();
                }
            break;
        }
        

    }

    const ids = () => props.attributes.map(at => at.key)

    return (
        <DragDropProvider
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            collisionDetector={closestCenter}
        >
            <DragDropSensors />
            <div class="sets-gridview-head">
                <div class="sets-headers-row"


                    use: headerResize={onResize}
                >
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
                </div></div>

        </DragDropProvider>
    );
}

export default HeaderRow;

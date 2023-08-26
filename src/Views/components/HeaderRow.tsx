import { Accessor, Component, For, createSignal } from "solid-js";
import { Header } from "./Header";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { DragDropProvider, DragDropSensors, DragOverlay,SortableProvider,closestCenter
 } from "@thisbeyond/solid-dnd";
import { useBlock } from "./BlockProvider";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function headerResize(el:Element, onResize:Accessor<(size:number|string, index:number)=>void>) {
    const state:{
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
    el.addEventListener("mousedown",(e:MouseEvent)=>{
        const resizer = (e.target as HTMLDivElement);
        if(resizer.classList.contains("sets-column-resizer")){
            // $0.parentElement.indexOf($0)
            state.resizing = resizer!.closest(".sets-header-cell")!;
            // const gridRow = state.resizing.closest(".sets-headers-row");
            state.index = state.resizing.parentElement!.indexOf(state.resizing);
            state.originalSize = state.resizing.clientWidth;
            console.log(`resizing`, state.resizing)
            state.mousex = e.clientX;
        }
        
    })
    el.addEventListener("mousemove", (e:MouseEvent)=>{
        
        if(state.resizing){
            const delta = e.clientX-state.mousex!;
            console.log(`delta:`, delta)
            const newSize = Math.max(0,  state.originalSize!+delta);
            onResize()?.(newSize, state.index);
        }
        
    }, true)
    el.addEventListener("mouseup", (e:MouseEvent)=>{
        if(state.resizing){
            console.log(`mouse up`)
            state.resizing = undefined;
            onResize()?.("done",state.index);
            state.index = -1;
        }
        // state.mousex = e.clientX;
    })

}


const HeaderRow:Component<{colSizes: string, attributes: AttributeDefinition[]}> = (props) => {
    const [activeItem, setActiveItem] = createSignal(null);
    const {definition, updateFields} = useBlock()!;
    const block = useBlock()!;

    const onDragStart = ({ draggable }) => {

        // console.log(`dragStart`, draggable);
        setActiveItem(draggable.id);
    }

    const onDragEnd = ({ draggable, droppable }) => {
        if (draggable && droppable) {
        const currentItems = props.attributes.map(attr => attr.key);
        const fromIndex = currentItems.indexOf(draggable.id);
        const toIndex = currentItems.indexOf(droppable.id);
        // console.log(`reorder`,draggable, droppable);
        if (fromIndex !== toIndex) {
            // const updatedItems = currentItems.slice();
            // updatedItems.splice(toIndex, 0, ...updatedItems.splice(fromIndex, 1));
            // setItems(updatedItems);
            block.reorder(fromIndex, toIndex);
        }
        }
        setActiveItem(null);
    };

    const activeHeader = () => {
        const activeKey = activeItem();
        const attr = props.attributes.find(attr => attr.key === activeKey);
        return attr?.displayName()
    }

    const onResize = (size:number|string, index:number) => {
        if(Number.isNumber(size)){
            const fields = definition().fields!;
            // const field = fields[index];
            // TODO: initial sizes should be better handled
            console.log(size, index);
            const newFields = fields.map((f,i)=>{
                return i !== index ? f :
                ({...f, width: `${size}px`})
            })
            updateFields(newFields);
        }
        // console.log(`todo`, size);

    }

    const ids = () => props.attributes.map(at => at.key)

    return (
    <DragDropProvider
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      collisionDetector={closestCenter}
    >
      <DragDropSensors />
        <div class="sets-headers-row" 
        
        style={{ "grid-template-columns": props.colSizes }}
        use:headerResize={onResize}
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
        </div>
       
    </DragDropProvider>
    );
}

export default HeaderRow;

import { Component, For, createMemo, createSignal, onMount } from "solid-js";
import { SetViewProps } from "./GridView";
import { useBlock } from "./SetProvider";
import { groupBy } from "src/Utils/groupBy";
import { useApp } from "./AppProvider";
import AttributeView, { AttributeViewProps } from "./AttributeView";
import { DragDropProvider, DragDropSensors, DragEventHandler, Droppable } from "@thisbeyond/solid-dnd";
import { classList } from "solid-js/web";
import { setIcon } from "obsidian";
import { LaneView } from "./LaneView";

export type Lane = {
    name: string;
    value: string;
    index: number;
}

const BoardView: Component<SetViewProps> = (props) => {
    const { definition } = useBlock()!;
    // get db
    const { app, db } = useApp()!;

    const groupField = definition().board?.groupField;
    let addLaneBtn: HTMLDivElement | null = null;
    let scroller: HTMLDivElement;

    if(!groupField) {
        return <div class="sets-codeblock-empty">Please select grouping property</div>
    }

    onMount(() => {
        if (addLaneBtn) {
            setIcon(addLaneBtn, "plus-square");
        }
        requestAnimationFrame(() => { scroller.scroll(definition()?.transientState?.scroll || 0, 0); })

    })

    const groupFieldAttribute = db.getAttributeDefinition(groupField);

    const [values, setValues] = createSignal(definition().board?.lanes || []);

    
    
    const lanes = (): Lane[] => [
        {
            name: "No " + groupFieldAttribute.displayName(),
            value: "__NOVALUE__",
            index: 0,
        },
        ...values().map((v,i) => ({
            name: v,
            value: v,
            index: i+1
        }))
    ]
 
    const fields = () => definition().fields || props.attributes.map(at => (at.key));
    const attributeDefinition = db.getAttributeDefinition(groupField);
    const [dragging, setDragging] = createSignal<any>(null);

    const groupedData = createMemo(() => {
        const grouped = groupBy(props.data,
            (item) => {
                return attributeDefinition.getValue(item) || "__NOVALUE__";
            }
        );
        // group props.data by group
        console.log(`groupedData`, grouped);
        return grouped;
    })

    const onDragEnd: DragEventHandler = ({ droppable, draggable }) => {
        console.log("drop",draggable,droppable)
        if (droppable && draggable) {
            app.fileManager.processFrontMatter(draggable.data.file, (fm) => {
                fm["status"] = droppable.data.lane;
            });
        } 
        setDragging(null);
    };

    const onDragStart: DragEventHandler = ({ draggable }) => {
        console.log("drag",draggable)
        if (draggable) {
            setDragging(draggable.data);
        }
    }

    const addLane = () => {
        setValues([...values(), ""]);
    }

    return (<div class="sets-board-view">
        <div class="sets-board-lanes-scroller sets-view-scroller"  ref={scroller!}>
            <div class="sets-board-lanes-wrapper"
                classList={{
                    
                    "dragging": !!dragging()
                }}
            >
                <DragDropProvider 
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                >
                    <DragDropSensors />
                    <For each={lanes()}>{(lane, i) =>
                        <LaneView attributes={props.attributes} data={groupedData()[lane.value]} lane={lane} attribute={groupFieldAttribute} />
                    }</For>
                </DragDropProvider>
                <div ref={addLaneBtn!} 
                onClick={addLane}
                class="sets-board-add-lane clickable-icon"></div>
            </div>
        </div>
    </div>);
}

export default BoardView;

import { Component, For, Show, createMemo, createSignal, onMount } from "solid-js";
import { SetViewProps } from "./GridView";
import { useBlock } from "./SetProvider";
import { groupBy } from "src/Utils/groupBy";
import { useApp } from "./AppProvider";
import AttributeView, { AttributeViewProps } from "./AttributeView";
import { EditProp } from "./EditProp";
import FileName from "./FileName";
import { ObjectData } from "src/Data/ObjectData";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { DragDropProvider, DragDropSensors, DragEventHandler, Droppable, createDraggable } from "@thisbeyond/solid-dnd";
import { classList } from "solid-js/web";
import { setIcon } from "obsidian";
import { LaneView } from "./LaneView";

type BoardItemProps = {
    attributes: AttributeDefinition[];
    data: ObjectData;
}

export const BoardItem: Component<BoardItemProps> = (props) => {
    const draggable = createDraggable(props.data.file.path, props.data);
    const { data } = props;

    return (
        <div class="sets-board-item" use: draggable>
            <For each={props.attributes}>{(attribute, i) =>
                <div class="sets-board-item-field" title={attribute.displayName()}>
                    {/* <AttributeView attribute={attribute} data={item} /> */}
                    <Show when={attribute.readonly}>
                        <div class="sets-cell-read">{attribute.format(data)}</div>
                    </Show>
                    <Show when={!attribute.isIntrinsic}>

                        <div class="sets-view-field">
                            <EditProp data={data} attribute={attribute} />
                        </div>
                    </Show>
                    <Show when={attribute.isIntrinsic && !attribute.readonly}>
                        <div class="sets-view-field">
                            <FileName data={data} attribute={attribute} />
                        </div>
                    </Show>
                </div>
            }</For>
        </div>
    )
}

type Lane = {
    name: string;
    value: string;
    index: number;
}

export type LaneViewProps = {
    attributes: AttributeDefinition[];
    data: ObjectData[];
    attribute: AttributeDefinition;
    lane: Lane; 
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

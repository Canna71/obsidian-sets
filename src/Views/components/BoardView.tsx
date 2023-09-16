import { Component, For, Show, createMemo, createSignal } from "solid-js";
import { SetViewProps } from "./GridView";
import { useBlock } from "./SetProvider";
import { groupBy } from "src/Utils/groupBy";
import { useApp } from "./AppProvider";
import AttributeView, { AttributeViewProps } from "./AttributeView";
import { EditProp } from "./EditProp";
import FileName from "./FileName";
import { ObjectData } from "src/Data/ObjectData";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { DragDropProvider, DragDropSensors, DragEventHandler, Droppable, createDraggable, createDroppable } from "@thisbeyond/solid-dnd";
import { classList } from "solid-js/web";

type BoardItemProps = {
    attributes: AttributeDefinition[];
    data: ObjectData;
}

const BoardItem: Component<BoardItemProps> = (props) => {
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

type LaneViewProps = {
    attributes: AttributeDefinition[];
    data: ObjectData[];
    lane: string; //temporarily
}

const LaneView: Component<LaneViewProps> = (props) => {

    const droppable = createDroppable(props.lane, props);

    return (
        <div class="sets-board-lane" use: droppable 
            classList={{
                "accept-drop": droppable.isActiveDroppable
            }}
        >

            <div class="sets-board-lane-header">
                {props.lane}
            </div>

            <For each={props.data}>{(data, i) =>
                <BoardItem attributes={props.attributes} data={data} />
            }</For>

        </div>
    );
}

const BoardView: Component<SetViewProps> = (props) => {
    const { definition } = useBlock()!;
    // get db
    const { app, db } = useApp()!;


    const lanes = ["null", "On Hold", "Canceled", "To Do", "In Progress", "Done"];
    const group = "status";
    const fields = () => definition().fields || props.attributes.map(at => (at.key));
    const attributeDefinition = db.getAttributeDefinition(group);
    const [dragging, setDragging] = createSignal<any>(null);

    const groupedData = createMemo(() => {
        const grouped = groupBy(props.data,
            (item) => {
                return attributeDefinition.getValue(item);
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

    return (<div class="sets-board-view">
        <div class="sets-board-lanes-container">
            <div class="sets-board-lanes-scroller"
                classList={{
                    
                    "dragging": !!dragging()
                }}
            >
                <DragDropProvider 
                    onDragEnd={onDragEnd}
                    onDragStart={onDragStart}
                >
                    <DragDropSensors />
                    <For each={lanes}>{(lane, i) =>
                        // <div class="sets-board-lane" >

                        //     <div class="sets-board-lane-header">
                        //         {lane}
                        //     </div>

                        //     <For each={groupedData()[lane]}>{(data, i) =>
                        //         <BoardItem attributes={props.attributes} data={data} />
                        //     }</For>

                        // </div>
                        <LaneView attributes={props.attributes} data={groupedData()[lane]} lane={lane} />
                    }</For>
                </DragDropProvider>
            </div>
        </div>
    </div>);
}

export default BoardView;

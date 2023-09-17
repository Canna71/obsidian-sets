import { Component, For, Show, createSignal, onMount } from "solid-js";
import { useSet } from "./SetProvider";
import { EditProBase } from "./EditProp";
import { createDroppable } from "@thisbeyond/solid-dnd";
import { BoardItem } from "./BoardItem";
import { Lane } from "./BoardView";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { setIcon } from "obsidian";

export const LaneView: Component<LaneViewProps> = (props) => {

    const { definition, setDefinition, save } = useSet()!;
    const [isEdit, setIsEdit] = createSignal(false);
    let deleteBtn: HTMLDivElement | null = null;
    const droppable = createDroppable(props.lane.value, props);

    const onValueChange = (val: string) => {
        // adds the value to the lanes at the right index
        const newLanes = [...definition().board?.lanes || []];
        newLanes[props.lane.index - 1] = val;
        setDefinition({ ...definition(), board: { ...definition().board, lanes: newLanes } });
        save();
    };

    const onDelete = () => {
        const newLanes = [...definition().board?.lanes || []];
        newLanes.splice(props.lane.index - 1, 1);
        setDefinition({ ...definition(), board: { ...definition().board, lanes: newLanes } });
        save();
    };

    onMount(() => {
        setIcon(deleteBtn!, "minus");
    });

    return (
        <div class="sets-board-lane" use: droppable
            classList={{
                "accept-drop": droppable.isActiveDroppable
            }}
        >

            <div class="sets-board-lane-header">
                <Show when={!props.lane.value || isEdit()}>
                    <EditProBase attribute={props.attribute} onChange={onValueChange} value={props.lane.value} />
                </Show>
                <Show when={props.lane.value && !isEdit()}>
                    <div onClick={() => setIsEdit(true)}>{props.lane.name}</div>
                </Show>
                <Show when={!isEdit()}>
                    <div class="sets-board-lane-delete clickable-icon" ref={deleteBtn!} onClick={onDelete}></div>
                </Show>
            </div>

            <For each={props.data}>{(data, i) => <BoardItem attributes={props.attributes} data={data} />}</For>

        </div>
    );
};export type LaneViewProps = {
    attributes: AttributeDefinition[];
    data: ObjectData[];
    attribute: AttributeDefinition;
    lane: Lane;
};


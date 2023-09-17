import { Component, For, Show } from "solid-js";
import { useBlock } from "./SetProvider";
import { EditProBase } from "./EditProp";
import { createDroppable } from "@thisbeyond/solid-dnd";
import { LaneViewProps, BoardItem } from "./BoardView";

export const LaneView: Component<LaneViewProps> = (props) => {

    const { definition, setDefinition, save } = useBlock()!;

    const droppable = createDroppable(props.lane.value, props);

    const onValueChange = (val: string) => {
        // adds the value to the lanes at the right index
        const newLanes = [...definition().board?.lanes || []];
        newLanes[props.lane.index - 1] = val;
        setDefinition({ ...definition(), board: { ...definition().board, lanes: newLanes } });
        save();
    };

    return (
        <div class="sets-board-lane" use: droppable
            classList={{
                "accept-drop": droppable.isActiveDroppable
            }}
        >

            <div class="sets-board-lane-header">
                <Show when={!props.lane.value}>
                    <EditProBase attribute={props.attribute} onChange={onValueChange} />
                </Show>
                {props.lane.name}
            </div>

            <For each={props.data}>{(data, i) => <BoardItem attributes={props.attributes} data={data} />}</For>

        </div>
    );
};

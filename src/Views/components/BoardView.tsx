import { Component, For, Show, createMemo } from "solid-js";
import { SetViewProps } from "./GridView";
import { useBlock } from "./SetProvider";
import { groupBy } from "src/Utils/groupBy";
import { useApp } from "./AppProvider";
import AttributeView from "./AttributeView";
import { EditProp } from "./EditProp";
import FileName from "./FileName";

const BoardView: Component<SetViewProps> = (props) => {
    const { definition } = useBlock()!;
    // get db
    const { db } = useApp()!;


    const lanes = ["null", "On Hold", "Canceled", "To Do", "In Progress", "Done"];
    const group = "status";
    const fields = () => definition().fields || props.attributes.map(at => (at.key));
    const attributeDefinition = db.getAttributeDefinition(group);

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

    return (<div class="sets-board-view">
        <div class="sets-board-lanes-container">
            <div class="sets-board-lanes-scroller">
                <For each={lanes}>{(lane, i) =>
                    <div class="sets-board-lane">
                        <div class="sets-board-lane-header">
                            {lane}
                        </div>

                        <For each={groupedData()[lane]}>{(data, i) =>
                            <div class="sets-board-item">
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
                        }</For>
                    </div>
                }</For>
            </div>
        </div>
    </div>);
}

export default BoardView;

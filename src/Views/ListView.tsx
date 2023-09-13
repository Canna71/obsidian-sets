
// implements a ListView COmponents that renders objects in
// a list format instead of a grid format

import { Component, For, Show } from "solid-js";
import { SetViewProps } from "./components/GridView";
import { IntrinsicAttributeKey } from "src/Data/Query";
import FileName from "./components/FileName";

const ListView: Component<SetViewProps> = (props) => {

    return (
        <div class="sets-listview">
            <div class="sets-listview-body">
                <For each={props.data}>{(item, i) =>
                    <div class="sets-listview-item">
                        <For each={props.attributes}>{
                            (attribute, i) => <>
                                <Show when={!attribute.isIntrinsic || attribute.key !== IntrinsicAttributeKey.FileName}>
                                    <div class="sets-listview-field">
                                        {
                                            attribute.format(item)
                                        }
                                    </div>
                                </Show>
                                <Show when={attribute.isIntrinsic && attribute.key === IntrinsicAttributeKey.FileName}>
                                    <div class="sets-listview-field">
                                        <FileName data={item} attribute={attribute} editable={false} />
                                    </div>
                                </Show>
                            </>
                        }
                        </For>

                    </div>
                }
                </For>

            </div>
        </div>);
}

export default ListView;


// implements a ListView COmponents that renders objects in
// a list format instead of a grid format

import { Component, For, Show, createMemo } from "solid-js";
import { SetViewProps } from "./components/GridView";
import FileName from "./components/FileName";
import { IntrinsicAttributeKey } from "./components/SetDefinition";
import { EditProp } from "./components/EditProp";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { MarkdownView } from "obsidian";
import MarkdownText from "./MarkdownText";

const ListView: Component<SetViewProps> = (props) => {

    const displayAsText = (attribute: AttributeDefinition) => {
        if (attribute.getPropertyInfo().type === "checkbox") return false;
        if (attribute.isIntrinsic && attribute.key === IntrinsicAttributeKey.FileName) return false;
        return true
    }

    const reorderedAttributes = createMemo(() => {
        // reorder attributes tu put chackboxes first
        const ret = [...props.attributes];
        ret.sort((a, b) => {
            if (a.getPropertyInfo().type === "checkbox") return -1;
            if (b.getPropertyInfo().type === "checkbox") return 1;
            return 0;
        }
        );
        return ret;
    });


    return (
        <div class="sets-listview">
            <div class="sets-listview-body">
                <For each={props.data}>{(item, i) =>
                    <div class="sets-listview-item">
                        <For each={reorderedAttributes()}>{
                            (attribute, i) => <>
                                <Show when={displayAsText(attribute)}>
                                    <div class="sets-listview-field">
                                        {/* {
                                            attribute.format(item)
                                        } */}
                                        <MarkdownText markdown={attribute.format(item)} />
                                    </div>
                                </Show>
                                <Show when={attribute.isIntrinsic && attribute.key === IntrinsicAttributeKey.FileName}>
                                    <div class="sets-listview-field">
                                        <FileName data={item} attribute={attribute} editable={false} />
                                    </div>
                                </Show>
                                <Show when={attribute.getPropertyInfo().type === "checkbox"}>
                                    <div class="sets-listview-field">
                                        <EditProp data={item} attribute={attribute} />
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

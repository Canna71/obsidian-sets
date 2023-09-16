
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
import AttributeView from "./components/AttributeView";

const ListView: Component<SetViewProps> = (props) => {

    

    


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
                                <AttributeView attribute={attribute} data={item} />
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

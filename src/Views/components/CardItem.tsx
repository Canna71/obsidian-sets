import { Component, For, Match, Show, Switch } from "solid-js";
import { EditProp } from "./EditProp";
import FileName from "./FileName";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import MarkdownText from "../MarkdownText";

export type ItemProps = {
    attributes: AttributeDefinition[];
    data: ObjectData;
    transclude?: string[];
};

export const CardItem: Component<ItemProps> = (props) => {
    const { data } = props;

    return (
        <For each={props.attributes}>{(attribute, i) => <div class="sets-item-field" title={attribute.displayName()}>
            {/* <AttributeView attribute={attribute} data={item} /> */}
            <Switch>
                <Match when={attribute.readonly}>
                    <div class="sets-view-field">{attribute.format(data)}</div>
                </Match>
                <Match when={(props.transclude || []).includes(attribute.key) && (`${attribute.getValue(data)}`.startsWith("[[")) }>
                    <MarkdownText markdown={`!${attribute.getValue(data)}`} />
                </Match>
                <Match when={!attribute.isIntrinsic}>
                    <div class="sets-view-field">
                        <EditProp data={data} attribute={attribute} />
                    </div>
                </Match>
                <Match when={attribute.isIntrinsic && !attribute.readonly}>
                    <div class="sets-view-field">
                        <FileName data={data} attribute={attribute} />
                    </div>
                </Match>
            </Switch>




        </div>}
        </For>);
};




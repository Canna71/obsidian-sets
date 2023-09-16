import { Component, Show } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import MarkdownText from "../MarkdownText";
import { EditProp } from "./EditProp";
import FileName from "./FileName";
import { IntrinsicAttributeKey } from "./SetDefinition";

export interface AttributeViewProps {
    attribute: AttributeDefinition;
    data: ObjectData;
}

const AttributeView: Component<AttributeViewProps> = (props) => {

    const { attribute, data } = props;
    const displayAsEditProps = (attribute: AttributeDefinition) => {
        if (attribute.isIntrinsic && attribute.key === IntrinsicAttributeKey.FileName) return false;
        // return true;
        if (attribute.getPropertyInfo().type === "checkbox") return true;
        if (attribute.getPropertyInfo().type === "date") return true;
        if (attribute.getPropertyInfo().type === "datetime") return true;
    }

    const displayAsText = (attribute: AttributeDefinition) => {
        if (attribute.isIntrinsic && attribute.key === IntrinsicAttributeKey.FileName) return false;
        return !displayAsEditProps(attribute);
    }

    const title = () => {
        return attribute.displayName();
    }

    return (<>
        <Show when={displayAsText(attribute)}>
            <div class="sets-view-field" title={title()}>

                <MarkdownText markdown={attribute.format(data)} />
            </div>
        </Show>
        <Show when={attribute.isIntrinsic && attribute.key === IntrinsicAttributeKey.FileName}>
            <div class="sets-view-field" >
                <FileName data={data} attribute={attribute} editable={false} />
            </div>
        </Show>
        <Show when={displayAsEditProps(attribute)}>
            <div class="sets-view-field-prop" title={title()}>
                <EditProp data={data} attribute={attribute} />
            </div>
        </Show>
    </>
    )
}

export default AttributeView;

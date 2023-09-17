import { Component, onMount } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";

export type EditPropBaseProps = {
    data?: ObjectData;
    attribute: AttributeDefinition;
    onChange: (val: any) => void;
    value?: any;
}

export const EditProBase: Component<EditPropBaseProps> = (props) => {
    const widget = props.attribute.getPropertyWidget?.();

    // const value = getAttribute(props.data, props.attribute);
    let value = props.data && props.attribute.getValue(props.data) || props.value;
    if (Array.isArray(value)) value = value.slice();
    if (!props.attribute.getPropertyInfo) return <div>Uh oh...</div>
    const { key, type } = props.attribute.getPropertyInfo();
    // eslint-disable-next-line prefer-const
    let div: HTMLDivElement | undefined = undefined;

    const onClick = (e: MouseEvent) => {
        const msc = e.target as HTMLDivElement;
        if (msc && msc.classList.contains("multi-select-container")) {
            const input = msc.querySelector(".multi-select-input") as HTMLDivElement;
            if (input) {

                input.focus();

            }

        }
    }

    onMount(() => {
        widget && widget.render(div!, {
            key, type, value
        },
            {
                app: app,
                key,
                onChange: (val) => {
                    props.onChange && props.onChange(val);
                },
                rerender: () => {
                },
                sourcePath: props.data?.file.path || "/",
                blur: () => {
                },
                metadataEditor: null
            }

        );
    });

    return <div ref={div} onClick={onClick} class="metadata-property"></div>;

}

export type EditPropProps = {
    data: ObjectData;
    attribute: AttributeDefinition;
}

export const EditProp: Component<EditPropProps> = (props) => {
    const { key } = props.attribute.getPropertyInfo();

    return <EditProBase {...props} onChange={(val) => { 
        const owner = props.data.file;
        // const fm = {...props.data.frontmatter, [key]: val}
        app.fileManager.processFrontMatter(owner, (fm) => {
            fm[key] = val;
        });
    }} />

};

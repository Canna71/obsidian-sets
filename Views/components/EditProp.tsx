import { Component, onMount } from "solid-js";
import { Attribute, getAttribute } from "src/Query";
import { ObjectData } from "src/ObjectData";

export const EditProp: Component<{ data: ObjectData; attribute: Attribute; }> = (props) => {

    const key = props.attribute.attribute;
    const propertyInfo = app.metadataTypeManager.getPropertyInfo(key);
    const type = app.metadataTypeManager.getAssignedType(key) || propertyInfo?.type;
    const widget = app.metadataTypeManager.registeredTypeWidgets[type];

    const value = getAttribute(props.data, props.attribute);
    // eslint-disable-next-line prefer-const
    let div: HTMLDivElement | undefined = undefined;

    onMount(() => {
        widget.render(div!, {
            key, type, value
        },
            {
                app: app,
                key,
                onChange: (val) => {
                    console.log(`what to do now? `, val);
                    const owner = props.data.file;
                    // const fm = {...props.data.frontmatter, [key]: val}
                    app.fileManager.processFrontMatter(owner, (fm) => {
                        fm[key] = val;
                    });
                },
                rerender: () => {
                    console.log(`re-render called`);
                },
                sourcePath: props.data.file.path,
                blur: () => {
                    console.log(`blur called`);
                },
                metadataEditor: null
            }

        );
    });

    return <div ref={div}></div>;
};

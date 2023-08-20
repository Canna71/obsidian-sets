import { Component, For, Show, createSignal, onMount } from "solid-js";
import { Attribute, getAttribute } from "src/Query";
import clickOutside from "./clickoutside";
import { ObjectData } from "src/ObjectData";

false && clickOutside;

const Header: Component<{ name: string }> = (props) => {

    return (<div class="sets-header-cell" >
        <div class="sets-cell-content">
            <div>{props.name}</div>
            <div class="sets-column-resizer"></div>
        </div>
    </div>);
}

const Cell: Component<{data: ObjectData, attribute:Attribute }> = (props) => {
    const [isEdit, setEdit] = createSignal(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = () => getAttribute(props.data, props.attribute) as any;

    const onClick= (e:MouseEvent) => {
        if(!isEdit()) setEdit(true);
    }

    const exitEdit = () => {
        setEdit(false);
    }
    
    return (<div class="sets-grid-cell" onClick={onClick} >
        <div class="sets-cell-content">
            <Show when={isEdit()}
                fallback={<div class="sets-cell-read">{value()}</div> }
            >
                <div class="sets-cell-edit" use:clickOutside={exitEdit}>
                    <EditProp data={props.data} attribute={props.attribute} />
                
                </div>
            </Show>
               
        </div>
    </div>);
}

const EditProp : Component<{data: ObjectData, attribute:Attribute }> = (props) => {

    const key = props.attribute.attribute;
    const propertyInfo = app.metadataTypeManager.getPropertyInfo(key);
    const type = app.metadataTypeManager.getAssignedType(key) || propertyInfo?.type;
    const widget = app.metadataTypeManager.registeredTypeWidgets[type];

    const value = getAttribute(props.data, props.attribute);
    // eslint-disable-next-line prefer-const
    let div: HTMLDivElement | undefined = undefined;

    onMount(()=>{
        widget.render(div!,{
            key, type, value
        },
        {
            app: app,
            key,
            onChange: (val) => {
                console.log(`what to do now? `, val);
                const owner = props.data.file;
                // const fm = {...props.data.frontmatter, [key]: val}
                app.fileManager.processFrontMatter(owner, (fm)=>{
                    fm[key] = val
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
       
        )
    })

    return <div ref={div}></div>
}

// TODO: use https://github.com/minht11/solid-virtual-container
// TODO: use https://tanstack.com/table/v8/docs/guide/introduction
const GridView: Component<{ data: ObjectData[], attributes: Attribute[] }> = (props) => {


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [colSizes, setColSizes] = createSignal("200px auto")

    return <div
        class="sets-codeblock sets-gridview"
    >
        <div class="sets-headers-row" style={{ "grid-template-columns": colSizes() }}>
            <For each={props.attributes}>{
                (attribute, i) => <Header name={attribute.displayName || attribute.attribute} />
            }
            </For>
            

        </div>
        <div class="sets-gridview-body">
                <div class="sets-gridview-grid" >
                    <For each={props.data}>{(item, i) =>
                        <div class="sets-gridview-row" style={{ "grid-template-columns": colSizes() }}>
                            <For each={props.attributes}>{
                                (attribute, i) => <Cell data={item} attribute={attribute} />
                            }
                            </For>
                        </div>
                    }</For>
                </div>
            </div>
    </div>
}

export default GridView;

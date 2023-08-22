import { Keymap } from "obsidian";
import { Component, Show, createSignal } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { useApp } from "./AppProvider";

const FileName: Component<{ data: ObjectData; attribute: AttributeDefinition; }> = (props) => {
    const app = useApp();
    const text = () => props.attribute.format(props.data);
    const [isEdit, setEdit] = createSignal(false);
    let editor;

    const onEdit = (e: MouseEvent) => {
        if (!isEdit()) setEdit(true);
    };

    const exitEdit = () => {
        setEdit(false);
    };

    const onClick = async (e:MouseEvent) => {
        console.log(e);
        
        const paneType = Keymap.isModEvent(e);
        const file = props.data.file;

        const leaf = app?.workspace.getLeaf(paneType);
        await leaf?.openFile(file);
    }

    return <>
        <Show when={!isEdit()}>
            <div class="sets-cell-filename">
                <div class="sets-cell-filename-link" onClick={onClick}>{text()}</div>
                <div class="sets-cell-filename-edit" onClick={onEdit} >Edit</div>
            </div>
        </Show>
        <Show when={isEdit()}>
            <div ref={editor} class="sets-cell-filename">
                
            </div>
        </Show>
    </>
        
    
}

export default FileName; 
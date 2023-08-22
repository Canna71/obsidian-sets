import { Keymap } from "obsidian";
import { Component, Show, createSignal } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { useApp } from "./AppProvider";

const FileName: Component<{ data: ObjectData; attribute: AttributeDefinition; }> = (props) => {
    const app = useApp()!;
    const text = () => props.attribute.format(props.data);
    const [isEdit, setEdit] = createSignal(false);
    let editor : HTMLDivElement;

    console.log("Rendering FileName")

    const onEdit = (e: MouseEvent) => {
        if (!isEdit()) setEdit(true);
    };

    const renameFile = (name: string) => {
        const file = props.data.file;
        //@ts-ignore
        const newName = file.getNewPathAfterRename(name);
        app.fileManager.renameFile(file, newName);
        // debugger;
    }

    const onBlur = () => {
        setEdit(false);
        renameFile(editor.innerText.trim())
    };

    const onClick = async (e:MouseEvent) => {
        console.log(e);
        
        const paneType = Keymap.isModEvent(e);
        const file = props.data.file;

        const leaf = app?.workspace.getLeaf(paneType);
        await leaf?.openFile(file);
    }

    const onInput = (e:InputEvent) => {
        console.log(e);
        // TODO: check valid title
    } 

    const onkeydown = (e:KeyboardEvent) => {
        console.log(e);
        // TODO: check valid title
    } 

    return <>
        <Show when={!isEdit()}>
            <div class="sets-cell-filename">
                <div class="sets-cell-filename-link" onClick={onClick}>{text()}</div>
                <div class="sets-cell-filename-edit" onClick={onEdit} >Edit</div>
            </div>
        </Show>
        <Show when={isEdit()}>
            <div ref={editor!} class="sets-cell-filename" contentEditable={true} 
                autocapitalize="on"
                
                spellcheck={app.vault.getConfig("spellcheck")}
                onInput={onInput} 
                onBlur={onBlur}
                onKeyDown={onkeydown}
                >{text()}
                
            </div>
        </Show>
    </>
        
    
}

export default FileName; 
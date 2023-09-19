import { App, Platform, TFile, setIcon } from "obsidian";
import { Component, Show, createEffect, createSignal } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { useApp } from "./AppProvider";
import { Dialog } from "../Dialog";
import { useSet } from "./SetProvider";
import NameEditor, { isValidFileName } from "./NameEditor";





// refactor the props of this component in a separate interface
export interface FileNameProps {
    data: ObjectData;
    attribute: AttributeDefinition;
    editable?: boolean;
    editMode?: boolean;
}



const FileName: Component<FileNameProps> = (props) => {
    const { app } = useApp()!;
    // const text = () => props.attribute.format(props.data);
    const { getNewFile } = useSet()!;

    const editable = () => props.editable ?? true;
    // const isEdit = () => {
    //     getNewFile() === props.data.file.path;
    // }

    const isEditFile = () => {
        if (!editable()) return false;
        if (props.editMode) return true;
        const tmp = getNewFile() === props.data.file.path;
        // if (tmp) setNewFile(""); 
        return tmp;
    }

    const [isEdit, setEdit] = createSignal(isEditFile());
    const [text, setText] = createSignal(props.attribute.format(props.data));
    let pencil: HTMLDivElement;

    // focus editor when it becomes visible
    // createEffect(() => {
    //     if (isEdit()) {
    //         const range = document.createRange();
    //         editor.focus();
    //         range.selectNodeContents(editor);
    //         const selection = window.getSelection();
    //         selection!.removeAllRanges();
    //         selection!.addRange(range);
    //     }
    // })

    const onEdit = (e: MouseEvent) => {
        if (!isEdit()) setEdit(true);
        // if(isEdit()) {
        //     const range = document.createRange();
        //     editor.focus();
        //     range.selectNodeContents(editor);
        //     const selection = window.getSelection();
        //     selection!.removeAllRanges();
        //     selection!.addRange(range);
        // }
    };



    const renameFile = (name: string) => {
        const file = props.data.file;
        name = name.trim();
        const msg = isValidFileName(app, file, name);
        if (msg) {
            new Dialog(app, msg).open();
            return;
        }
        //@ts-ignore
        const newName = file.getNewPathAfterRename(name);

        try {
            app.fileManager.renameFile(file, newName);
        } catch (e) {
            console.error(e);
            new Dialog(app, e.message).open();
        }
        // debugger;
    }

    const finishEdit = () => {
        setEdit(false);
        // renameFile(editor.innerText.trim())
        renameFile(text());
    }

 

    // const onClick = async (e:MouseEvent) => {

    //     const paneType = Keymap.isModEvent(e);
    //     const file = props.data.file;

    //     const leaf = app?.workspace.getLeaf(paneType);
    //     await leaf?.openFile(file);
    // }

  

    const linkText = () => {
        return app.metadataCache.fileToLinktext(props.data.file, "/")
    }



    createEffect(() => {
        if (isEdit()) return;
        pencil && setIcon(pencil, "pencil");
    })

    return <>
        <Show when={!isEdit()}>
            <div class="sets-cell-filename">
                {/* <div class="sets-cell-filename-link internal-link" 
                data-path={props.data.file.path}
                onClick={onClick} onauxclick={onClick}>{text()}</div> */}
                <a data-href={linkText()}
                    href={linkText()}
                    class="internal-link sets-cell-filename-link"
                    target="_blank"
                    rel="noopener">{text()}</a>
                <Show when={editable()}>
                    <div ref={pencil!} class="sets-cell-filename-edit clickable-icon" onClick={onEdit} ></div>
                </Show>
            </div>
        </Show>
        <Show when={isEdit()}>
            <NameEditor value={text} setValue={setText} blur={finishEdit} enter={finishEdit}  file={props.data.file} />
        </Show>
    </>


}

export default FileName; 

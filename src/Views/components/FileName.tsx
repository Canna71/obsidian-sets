import { App, Platform, TFile, setIcon } from "obsidian";
import { Component, Show, createEffect, createSignal } from "solid-js";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { ObjectData } from "src/Data/ObjectData";
import { useApp } from "./AppProvider";
import { Dialog } from "../Dialog";
import { useBlock } from "./BlockProvider";

const regexChars = /[.?*+^$[\]\\(){}|-]/g
function escape(exp) {
    return exp.replace(regexChars, "\\$&")
}
const disallowedCharsInFilename = Platform.isWin ? '*"\\/<>:|?' : "\\/:" + (Platform.isAndroidApp ? '*?<>"' : "")

const charlist = disallowedCharsInFilename.split("").join(" ")

const invalidFilenameRE = new RegExp("[" + escape(charlist) + "]")

const unsafeChars = "#^[]|";
const unsafeList = unsafeChars.split("").join(" ");
const unsafeCharsRE = new RegExp("[" + escape(unsafeList) + "]")

const messages = {
    "msg-invalid-characters": "File name cannot contain any of the following characters: " + charlist,
    "msg-unsafe-characters": "Links will not work with file names containing any of these characters: " + unsafeList,
    "msg-file-already-exists": "There's already a file with the same name",
    "msg-empty-file-name": "File name cannot be empty.",
    "msg-bad-dotfile": "File name must not start with a dot."
}

function isValidFileName(app: App, file: TFile, filename: string) {
    if ("" === filename) return messages["msg-empty-file-name"];
    if (invalidFilenameRE.test(filename)) return messages["msg-invalid-characters"];
    if (filename.startsWith(".")) return messages["msg-bad-dotfile"];
    if (app.vault.checkForDuplicate(file, filename)) return messages["msg-file-already-exists"];
    if (unsafeCharsRE.test(filename)) return messages["msg-unsafe-characters"]
}

// refactor the props of this component in a separate interface
export interface FileNameProps {
    data: ObjectData;
    attribute: AttributeDefinition;
    editable?: boolean;
}



const FileName: Component<FileNameProps> = (props) => {
    const { app } = useApp()!;
    const text = () => props.attribute.format(props.data);
    const { getNewFile } = useBlock()!;

    const editable = () => props.editable ?? true;
    // const isEdit = () => {
    //     getNewFile() === props.data.file.path;
    // }

    const isEditFile = () => {
        if(!editable()) return false;
        const tmp = getNewFile() === props.data.file.path;
        // if (tmp) setNewFile(""); 
        return tmp;
    }

    const [isEdit, setEdit] = createSignal(isEditFile());
    const [msg, setMsg] = createSignal<string | undefined>(undefined);
    let editor: HTMLDivElement;
    let pencil: HTMLDivElement;

    // focus editor when it becomes visible
    createEffect(() => {
        if (isEdit()) {
            const range = document.createRange();
            editor.focus();
            range.selectNodeContents(editor);
            const selection = window.getSelection();
            selection!.removeAllRanges();
            selection!.addRange(range);
        }
    })

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
        renameFile(editor.innerText.trim())
    }

    const onBlur = () => {
        finishEdit();
    };

    // const onClick = async (e:MouseEvent) => {

    //     const paneType = Keymap.isModEvent(e);
    //     const file = props.data.file;

    //     const leaf = app?.workspace.getLeaf(paneType);
    //     await leaf?.openFile(file);
    // }

    const onInput = (e: InputEvent) => {
        // console.log(e, isValidFileName(app, editor.innerText.trim()));
        const msg = isValidFileName(app, props.data.file, editor.innerText.trim())

        setMsg(msg);
    }

    const linkText = () => {
        return app.metadataCache.fileToLinktext(props.data.file, "/")
    }

    const onkeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault();
            finishEdit();
        }
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
            <div ref={editor!} classList={
                {
                    "sets-cell-filename": true,
                    "invalid": !!msg(),
                    "editing": true
                }
            } contentEditable={true}
                autocapitalize="on"
                title={msg()}
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

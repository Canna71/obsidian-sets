import { Accessor, Component, Setter, createSignal, onMount } from "solid-js"
import { useApp } from "./AppProvider";
import { App, Platform, TFile } from "obsidian";

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

export function isValidFileName(app: App, file: TFile, filename: string) {
    if ("" === filename) return messages["msg-empty-file-name"];
    if (invalidFilenameRE.test(filename)) return messages["msg-invalid-characters"];
    if (filename.startsWith(".")) return messages["msg-bad-dotfile"];
    if (app.vault.checkForDuplicate(file, filename)) return messages["msg-file-already-exists"];
    if (unsafeCharsRE.test(filename)) return messages["msg-unsafe-characters"]
}

export interface NameEditorProps {
    value: Accessor<string>;
    setValue: Setter<string>;
    blur: () => void;
    enter: () => void;
    file: TFile;
}

const NameEditor:Component<NameEditorProps> = (props) => {
    let editor: HTMLDivElement;
    const [msg, setMsg] = createSignal<string | undefined>(undefined);
    const { app } = useApp()!;

    const onBlur = () => {
        props.setValue(editor.innerText.trim());
        props.blur();
    };

    const onInput = (e: InputEvent) => {
        // props.setValue(editor.innerText.trim());
        const msg = isValidFileName(app, props.file, editor.innerText.trim())

        setMsg(msg);
    }

    onMount(() => {
        const range = document.createRange();
            editor.focus();
            range.selectNodeContents(editor);
            const selection = window.getSelection();
            selection!.removeAllRanges();
            selection!.addRange(range);
    })

    const onkeydown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
            props.setValue(editor.innerText.trim());
            e.preventDefault();
            props.enter();
        }
    }

    return (
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
        >{props.value()}

        </div>
    )
}

export default NameEditor;

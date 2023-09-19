import { Accessor, Component, Setter, createSignal, onMount } from "solid-js"
import { useApp } from "./AppProvider";
import { App, Notice, Platform, TFile } from "obsidian";

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

export function isValidFileName(app: App,  filename: string, file?: TFile,) {
    if ("" === filename) return messages["msg-empty-file-name"];
    if (invalidFilenameRE.test(filename)) return messages["msg-invalid-characters"];
    if (filename.startsWith(".")) return messages["msg-bad-dotfile"];
    if (file && app.vault.checkForDuplicate(file, filename)) return messages["msg-file-already-exists"];
    if (unsafeCharsRE.test(filename)) return messages["msg-unsafe-characters"]
}

export interface NameEditorProps {
    value: Accessor<string>;
    setValue: Setter<string>;
    blur?: () => void;
    enter?: () => void;
    input?: (value: string) => void;
    file?: TFile;
}

const NameEditor:Component<NameEditorProps> = (props) => {
    let editor: HTMLDivElement;
    const [msg, setMsg] = createSignal<string | undefined>(undefined);
    const { app } = useApp()!;
    const initialVal = props.value();

    const onBlur = () => {
        props.setValue(editor.innerText.trim());
        props.blur && props.blur();
    };

    const onInput = (e: InputEvent) => {
        // props.setValue(editor.innerText.trim());
        const msg = isValidFileName(app, editor.innerText.trim(), props.file)

        setMsg(msg);
        props.input && props.input(editor.innerText.trim());
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
            e.preventDefault();
            props.setValue(editor.innerText.trim());
            if (msg()) {
                new Notice(msg()!);
            } else {
                !msg() && props.enter && props.enter();
            }
        }
    }

    const onPaste = (e: ClipboardEvent) => {
        // keep onlt the text, not the formatting
        e.preventDefault();
        const text = e.clipboardData!.getData("text/plain");
        const doc = (e.target as HTMLDivElement).doc;
        if(doc.queryCommandSupported("insertText")) {
            document.execCommand("insertText", false, text);
        } else {
            console.error("insertText not supported");
        }

    }

    return (
        <div ref={editor!} classList={
            {
                "sets-filename": true,
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
            onPaste={onPaste}
        >{initialVal}

        </div>
    )
}

export default NameEditor;

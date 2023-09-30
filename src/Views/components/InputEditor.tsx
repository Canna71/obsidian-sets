
import { Accessor, Component, Setter, createSignal, onMount } from "solid-js"
import { useApp } from "./AppProvider";
import { App, Notice, Platform, TFile } from "obsidian";



export interface InputEditorProps {
    value: Accessor<string>;
    // setValue: Setter<string>;
    onInput?: (value: string) => void;
    validate?: (val: string) => boolean;
}

const InputEditor:Component<InputEditorProps> = (props) => {
    let editor: HTMLDivElement;
    // const [msg, setMsg] = createSignal<string | undefined>(undefined);
    // const { app } = useApp()!;
    const initialVal = props.value();
    const [isValid, setValid] = createSignal<boolean>(true);
   
    const onInput = (e: InputEvent) => {
        // props.setValue(editor.innerText.trim());
        // const msg = isValidFileName(app, editor.innerText.trim(), props.file)
        if(props.validate) {
            const valid = props.validate(editor.innerText.trim());
            setValid(valid);
        }
        // setMsg(msg);
        props.onInput && props.onInput(editor.innerText.trim());
    }

    onMount(() => {
        const range = document.createRange();
            editor.focus();
            range.selectNodeContents(editor);
            const selection = window.getSelection();
            selection!.removeAllRanges();
            selection!.addRange(range);
    })


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
                "invalid": isValid(),
                "editing": true
            }
        } contentEditable={true}
            autocapitalize="on"
            // title={msg()}
            spellcheck={app.vault.getConfig("spellcheck")}
            onInput={onInput}
            // onBlur={onBlur}
            // onKeyDown={onkeydown}
            onPaste={onPaste}
        >{initialVal}

        </div>
    )
}

export default InputEditor;

import { Component, For, createSignal, onMount } from "solid-js";
import { useBlock } from "./components/BlockProvider";
import { Clause } from "src/Data/Query";

export interface ScopeEditorProps {

    exit: () => void
}

const ScopeEditor: Component<ScopeEditorProps> = (props) => {
    const { definition, save } = useBlock()!;

    const [scopeType, setScopeType] = createSignal(definition().scope?.[0] || "");
    const [scopeSpecifier, setScopeSpecifier] = createSignal(definition().scope?.[1] || "");

    

    const onSave = () => {
        save();
        props.exit();
    }

    const onScopeTypeChange = (e: Event) => {
        const select = e.target as HTMLSelectElement;
        setScopeType(select.value);
    }

    const update = (index: number, clause: Clause) => {
        // setState("filter", index, clause);
        // updateFilter(index, clause);
    }


    return (<div class="sets-scope-editor">
        
        <div class="sets-scope-header">
            <div class="sets-modal-title">Scope</div>
            <select value={scopeType()}
                onInput={onScopeTypeChange}
            >
                <option value={""}>Select...</option>
                <option value="type">Type</option>
                <option value="collection">Collection</option>
                <option value="folder">Folder</option>
                <option value="vault">Vault</option>
            </select>
            
        </div>
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>)
}

export default ScopeEditor;

import { Component, For, onMount } from "solid-js";
import { useBlock } from "./components/BlockProvider";
import { Clause } from "src/Data/Query";

export interface ScopeEditorProps {

    exit: () => void
}

const ScopeEditor: Component<ScopeEditorProps> = (props) => {
    const { definition, save } = useBlock()!;

    

    const onSave = () => {
        save();
        props.exit();
    }

    const update = (index: number, clause: Clause) => {
        // setState("filter", index, clause);
        // updateFilter(index, clause);
    }

   



    return (<div class="sets-scope-editor">
        
        
        <div class="sets-button-bar">
            <button class="mod-cta" onClick={onSave}>Save</button>
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>)
}

export default ScopeEditor;

import { Component, For, Show, createSignal, onMount } from "solid-js";
import { useBlock } from "./components/BlockProvider";
import { Clause } from "src/Data/Query";
import { useApp } from "./components/AppProvider";
import { ScopeType } from "src/Data/VaultDB";

export interface ScopeEditorProps {

    exit: () => void
}

const ScopeEditor: Component<ScopeEditorProps> = (props) => {
    const { definition, save, setDefinition } = useBlock()!;

    // get an instance of db frm the app provider
    const {db} = useApp()!;


    const [scopeType, setScopeType] = createSignal(definition().scope?.[0] || "");
    const [scopeSpecifier, setScopeSpecifier] = createSignal(definition().scope?.[1] || "");

    

    const onSave = () => {
        if(!isValid()) return;
        if(!scopeType()) return;
        setDefinition({...definition(), scope: [scopeType() as ScopeType, scopeSpecifier()]
            });
        save();
        props.exit();
    }

    const onScopeTypeChange = (e: Event) => {
        const select = e.target as HTMLSelectElement;
        setScopeType(select.value as ScopeType);
    }

    const types = () => {
        // return type names from querying VaultDB
        return db.getTypeNames();
    }

    // the isValid function should return true if the scope is valid
    // and false if it is not
    const isValid = () => {
        // if the scopeType is "type" then the scopeSpecifier should be a valid type
        if(scopeType() === "type") {
            return types().includes(scopeSpecifier());
        }
        // if the scopeType is "collection" then the scopeSpecifier should be a valid collection    
        if(scopeType() === "collection") {
            return db.getCollectionNames().includes(scopeSpecifier());
        }
        // if the scopeType is "folder" then the scopeSpecifier should be a valid folder
        if(scopeType() === "folder") {
            if (!scopeSpecifier()) return true;
            return db.isValidFolder(scopeSpecifier());
        }
        // if the scopeType is "vault" then the scopeSpecifier should be ""
        if(scopeType() === "vault") {
            return !scopeSpecifier();
        }
        
        return false;
    }

    // how to reduce sidebar icons in vscode

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
            {/* if the scopeType is "type" we should allow the user to select a type
            from the ones available */}
            <Show when={scopeType() === "type"}>
                <select value={scopeSpecifier()}
                    onChange={(e) => setScopeSpecifier(e.target.value)}
                >
                    {/* create an option for each type in types() 
                        it should also hace a first option iwth value="" and text="Select..."
                    */}
                    <option value={""}>Select...</option>
                    <For each={types()}>
                        {
                            (type) => {
                                return <option value={type}>{type}</option>
                            }
                        }
                    </For>
                </select>
            </Show>

            <Show when={scopeType() === "collection"}>

                <select value={scopeSpecifier()}    
                    onChange={(e) => setScopeSpecifier(e.target.value)}
                >   
                    <option value={""}>Select...</option>
                    <For each={db.getCollections()}>
                        {   
                            (collection) => {
                                return <option value={collection.name}>{collection.name}</option>
                            }
                        }
                    </For>
                </select>
            </Show>
                        

        </div>
        <div class="sets-button-bar">
            {/* The Save button should only be visible if the scope data is valid */}
            <Show when={isValid()}>
                <button class="mod-cta" 
                onClick={onSave}>Save</button>
            </Show>
            
            <button class="" onClick={props.exit}>Cancel</button>
        </div>
    </div>)
}

export default ScopeEditor;

import { Component, Show, createSignal } from "solid-js";
import { useBlock } from "./components/BlockProvider";
import { useApp } from "./components/AppProvider";
import { ScopeType } from "src/Data/VaultDB";
import { LinkToThis } from "src/Data/DynamicValues";
import { TFolder } from "obsidian";
import InputSuggest from "./components/InputSuggest";
import { getFolders } from "src/Utils/getFolders";

export interface ScopeEditorProps {

    exit: () => void
}

const ScopeEditor: Component<ScopeEditorProps> = (props) => {
    const { definition, save, setDefinition } = useBlock()!;

    // get an instance of db frm the app provider
    const { db, app } = useApp()!;


    const [scopeType, setScopeType] = createSignal(definition().scope?.[0] || "");
    const [scopeSpecifier, setScopeSpecifier] = createSignal(definition().scope?.[1] || "");



    const onSave = () => {
        if (!isValid()) return;
        if (!scopeType()) return;
        setDefinition({
            ...definition(), scope: [scopeType() as ScopeType, scopeSpecifier()]
        });
        save();
        props.exit();
    }

    const onScopeTypeChange = (e: Event) => {
        const select = e.target as HTMLSelectElement;
        setScopeSpecifier("");
        setScopeType(select.value as ScopeType);
    }

    const types = () => {
        // return type names from querying VaultDB
        return db.getTypeNames();
    }

    const typeOptions = () => {
        // return type names from querying VaultDB
        
        return types()
        // .filter((type) => type.toLowerCase().contains(scopeSpecifier().toLowerCase()))
        .map((type) => {
            return {
                value: type,
                label: type
            }
        });    
    }



    // the isValid function should return true if the scope is valid
    // and false if it is not
    const isValid = () => {
        // if the scopeType is "type" then the scopeSpecifier should be a valid type
        if (scopeType() === "type") {
            return types().includes(scopeSpecifier());
        }
        // if the scopeType is "collection" then the scopeSpecifier should be a valid collection    
        if (scopeType() === "collection") {
            return scopeSpecifier() === LinkToThis ||
                db.getCollections().find(c => db.generateWikiLink(c.file, "/") === scopeSpecifier());
        }
        // if the scopeType is "folder" then the scopeSpecifier should be a valid folder
        if (scopeType() === "folder") {
            if (!scopeSpecifier()) return true;
            // checks that the scopeSpecifier is a valid folder
            const folder = app.vault.getAbstractFileByPath(scopeSpecifier());
            return folder && folder instanceof TFolder;
        }
        // if the scopeType is "vault" then the scopeSpecifier should be ""
        if (scopeType() === "vault") {
            return !scopeSpecifier();
        }

        return false;
    }

    const collections = () => {
        // return collection names from querying VaultDB
        // together with their corresponding wiki link
        const ret =  db.getCollections().map((collection) => {
            return {
                label: collection.file.basename,
                value: db.generateWikiLink(collection.file, "/")
            }
        })
        ret.unshift({ label: "This", value: LinkToThis })
        // return ret.filter((collection) => collection.label.toLowerCase().contains(scopeSpecifier().toLowerCase()));
        return ret;
    }

    const folders = () => {
        // return folder names from querying VaultDB
        return getFolders(app)
        .filter((folder) => folder !== "/" && folder !== "")
        // .filter((folder) => folder.toLowerCase().contains(scopeSpecifier().toLowerCase()))
        .map((folder) => {
            return {
                value: folder,
                label: folder
            }
        })
    }


    return (<div class="sets-scope-editor">

        <div class="sets-scope-header">
            <div class="sets-modal-title">Scope</div>
        </div>
        <div class="sets-scope-body">
            <select value={scopeType()}
                onInput={onScopeTypeChange}
            >
                <option disabled hidden value={""}>Select Scope...</option>
                <option value="type">Type</option>
                <option value="collection">Collection</option>
                <option value="folder">Folder</option>
                <option value="vault">Vault</option>
            </select>
            {/* if the scopeType is "type" we should allow the user to select a type
            from the ones available */}
            <Show when={scopeType() === "type"}>
                
                <InputSuggest value={scopeSpecifier} setValue={setScopeSpecifier} options={typeOptions}
                    placeholder={() => "Select type..."} />
            </Show>

            <Show when={scopeType() === "collection"}>

                {/* <select value={scopeSpecifier()}
                    onChange={onCollectionChange}
                >
                    <option disabled hidden value={""}>Select collection...</option>
                     <option value={LinkToThis}>This</option> 
                    <For each={collections()}>
                        {
                            (collection) => {
                                return <option value={collection.value}>{collection.label}</option>
                            }
                        }
                    </For>
                </select> */}
                <InputSuggest value={scopeSpecifier} setValue={setScopeSpecifier} options={collections}    />
            </Show>

            <Show when={scopeType() === "folder"}>
               <InputSuggest 
                value={scopeSpecifier} 
                setValue={setScopeSpecifier} 
                placeholder={() => "Select folder..."}
                options={folders} />
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

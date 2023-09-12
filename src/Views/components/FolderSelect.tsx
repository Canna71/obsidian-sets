import { Accessor, Component, Setter } from "solid-js";
import InputSuggest, { InputSuggestProps } from "./InputSuggest";
import { getFolders } from "src/Utils/getFolders";
import { useApp } from "./AppProvider";

export interface FolderSelectProps {
    value: Accessor<string>,
    setValue: Setter<string>
}

const FolderSelect : Component<FolderSelectProps> = (props) => {
    const {  app } = useApp()!;

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

    return (
        <InputSuggest 
                value={props.value} 
                setValue={props.setValue} 
                placeholder={() => "Select folder..."}
                options={folders} />
                )
}

export default FolderSelect;

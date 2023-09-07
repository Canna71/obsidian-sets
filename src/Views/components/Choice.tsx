import { Setting } from "obsidian";
import { Accessor, Component, onMount } from "solid-js";
import { useApp } from "./AppProvider";
import Choices from "choices.js";
import { getFolders } from "src/Utils/getFolders";

export interface ChoiceProps {
    value: string;
    onChange: (value: string) => void;
}

const Choice: Component<ChoiceProps> = (props) => {

    let select: HTMLSelectElement;
    const { app } = useApp()!;

    const choices = () => {
        const folders = getFolders(app);
        return folders.map(folder => ({ value: folder, label: folder }));
        // return folders.map(folder => ({ value: folder.path, label: folder.name }));
    }


    onMount(() => {
        // const ch = choices();
        console.log(choices());
        new Choices(select, 
            {
            choices: choices(),
            shouldSort: true,
            addItems: true,
            silent: true,
            searchFields: ['label'],
            placeholder: false,
            itemSelectText: '',
            noResultsText: 'No results found',
            noChoicesText: 'No choices to choose from',
        });
        
    });





    return (
        <select ref={select!}
            // placeholder="enter a folder name"
        >

        </select>
    )
}

export default Choice;

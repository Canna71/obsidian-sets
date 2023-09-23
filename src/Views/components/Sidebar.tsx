import { Component, onMount } from "solid-js";
import { useApp } from "./AppProvider";
import { Counter } from "./Counter";
import { Menu, setIcon } from "obsidian";
import SetsPlugin from "src/main";
import { unslugify } from "src/Utils/slugify";

type SidebarProps = {
    plugin: SetsPlugin
}

const Sidebar:Component<SidebarProps> =  (props) => {

    const { db, app} = useApp()!;
    let addType:HTMLDivElement;
    let addColl:HTMLDivElement;
    let addItem:HTMLDivElement;

    onMount(() => {
        setIcon(addType, "plus");
        setIcon(addColl, "plus");
        setIcon(addItem, "plus");
    });


    const onAddType = () => {
        // execute the command to add a type
        app.commands.executeCommandById(`${props.plugin.manifest.id}:sets-new-type`);
    }    

    const onAddCollection = () => {
        // execute the command to add a collection
        app.commands.executeCommandById(`${props.plugin.manifest.id}:sets-new-collection`);
    }

    const onAddItem = (e:MouseEvent) => {
        // shows a context menu for each type
        const menu = new Menu();
        const availableTypes = db.getTypeNames();
        availableTypes.forEach(type => {
            menu.addItem((item) => {
                item.setTitle(unslugify(type));
                item.onClick(() => {
                    // execute the command to add an item
                    app.commands.executeCommandById(`${props.plugin.manifest.id}:sets-new-instance-${type}`);
                });
            });
        });
        menu.showAtMouseEvent(e);

    }

    return (
        <div class="sets-sidebar">
            <div class="sets-sidebar-buttons">
                <button title="Add new type" onClick={onAddType}><div ref={addType!}></div>Type</button>
                <button title="Add new collection" onClick={onAddCollection} ><div ref={addColl!}></div>Collection</button>
                <button title="Add new item"  onClick={onAddItem}><div ref={addItem!}></div>Item...</button>
            </div>
            <h3></h3>
            
        </div>
    );
}

export default Sidebar;

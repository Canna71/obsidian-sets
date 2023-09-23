import { Component, Show, createSignal, onMount } from "solid-js";
import { useApp } from "./AppProvider";
import { Counter } from "./Counter";
import { Menu, TFile, setIcon } from "obsidian";
import SetsPlugin from "src/main";
import { unslugify } from "src/Utils/slugify";
import { createSign } from "crypto";

type SidebarProps = {
    plugin: SetsPlugin
}

const Sidebar:Component<SidebarProps> =  (props) => {

    const { db, app} = useApp()!;

    const [types, setTypes] = createSignal(db.getTypeNames());

    let addType:HTMLDivElement;
    let addColl:HTMLDivElement;
    let addItem:HTMLDivElement;

    onMount(() => {
        setIcon(addType, "plus");
        setIcon(addColl, "plus");
        setIcon(addItem, "plus");

        db.on("metadata-changed", () => {
            setTypes(db.getTypeNames());    
        });
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

    const getTypeSetPage =  (type:string) => {
        const setFolder = db.getSetFileName(type);
        const file = app.vault.getAbstractFileByPath(setFolder);
        if(file instanceof TFile)
            return app.metadataCache.fileToLinktext(file, "/")
        return ""
    }

    const onNavigate = (e:MouseEvent) => {
        e.preventDefault();
        const link = e.currentTarget as HTMLAnchorElement;
        const href = link.getAttribute("data-href");
        if(href) {
            app.workspace.openLinkText(href, "", false);
        }
    }

    return (
        <div class="sets-sidebar">
            <div class="sets-sidebar-buttons">
                <button title="Add new type" onClick={onAddType}><div ref={addType!}></div>Type</button>
                <button title="Add new collection" onClick={onAddCollection} ><div ref={addColl!}></div>Collection</button>
                <button title="Add new item"  onClick={onAddItem}><div ref={addItem!}></div>Item...</button>
            </div>
            <Show when={types().length > 0}>
            <div class="sets-sidebar-section-title">Sets</div>
            <ul class="sets-sidebar-links">
                {types().map(type => (
                    <li><a
                    data-href={getTypeSetPage(type)}
                    href={getTypeSetPage(type)}
                    class="internal-link sets-filename-link"
                    target="_blank"
                    rel="noopener"
                    onClick={onNavigate}    
                    >{unslugify(type)}</a></li>
                ))}
                
            </ul>
            </Show>
            <h3></h3>
            
        </div>
    );
}

export default Sidebar;

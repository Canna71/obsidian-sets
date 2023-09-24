import { Component, For, Show, createSignal, onMount } from "solid-js";
import { useApp } from "./AppProvider";
import { Counter } from "./Counter";
import { Menu, TFile, setIcon } from "obsidian";
import SetsPlugin from "src/main";
import { unslugify } from "src/Utils/slugify";
import { createSign } from "crypto";
import Collapsible from "./Collapsible";
import { type } from "os";
import SidebarWidget from "./SidebarWidget";

type SidebarProps = {
    plugin: SetsPlugin
}

const ListTypeItem: Component<{
    link: string, type: string, plugin: SetsPlugin,
    onNavigate: (e: MouseEvent) => void
}

> = (props) => {

    let addItemOfType: HTMLDivElement;
    onMount(() => {

        setIcon(addItemOfType, "plus");

    });

    const onAddItemOfType = (e: MouseEvent, type: string) => {
        // execute the command to add an item
        app.commands.executeCommandById(`${props.plugin.manifest.id}:sets-new-instance-${type}`);
    }

    const widgets = () => {
        const widgets = props.plugin.settings.sidebarState.widgets;
        return widgets;
    }

    return (
        <li class="sets-sidebar-link-item">
            <a
                data-href={props.link}
                href={props.link}
                class="internal-link sets-filename-link"
                target="_blank"
                rel="noopener"
                onClick={props.onNavigate}
            >{unslugify(props.type)}</a>
            <div
                ref={addItemOfType!}
                class="sets-sidebar-link-item-add clickable-icon"
                onClick={(e) => onAddItemOfType(e, props.type)}></div>
        </li>
    )
}

const Sidebar: Component<SidebarProps> = (props) => {

    const { db, app } = useApp()!;

    const [types, setTypes] = createSignal(db.getTypeNames());
    const [collections, setCollections] = createSignal(db.getCollectionNames());

    let addType: HTMLDivElement;
    let addColl: HTMLDivElement;
    let addItem: HTMLDivElement;
    let addWidgetBtn: HTMLDivElement;

    onMount(() => {
        setIcon(addType, "plus");
        setIcon(addColl, "plus");
        setIcon(addItem, "plus");
        setIcon(addWidgetBtn, "plus-square");

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

    const onAddItem = (e: MouseEvent) => {
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

    const getTypeSetPage = (type: string) => {
        const setFolder = db.getSetFileName(type);
        const file = app.vault.getAbstractFileByPath(setFolder);
        if (file instanceof TFile)
            return app.metadataCache.fileToLinktext(file, "/")
        return ""
    }

    const onNavigate = (e: MouseEvent) => {
        e.preventDefault();
        const link = e.currentTarget as HTMLAnchorElement;
        const href = link.getAttribute("data-href");
        if (href) {
            app.workspace.openLinkText(href, "", false);
        }
    }

    const onCollapsibleToggle = (key: string, status: boolean) => {
        props.plugin.settings.sidebarState[key] = status;
        props.plugin.saveSettings();
    }

    const addWidget = () => {
        const settings = {...props.plugin.settings,
            sidebarState: {
                ...props.plugin.settings.sidebarState,
                widgets: [
                    ...props.plugin.settings.sidebarState.widgets || [],
                    {
                        title: "New Widget",
                        definition: {
                        }
                    }
                ]
            }
        };
        props.plugin.settings = settings;
        props.plugin.saveSettings();
    }

    return (
        <div class="sets-sidebar">
            <div class="sets-sidebar-buttons">
                <button title="Add new type" onClick={onAddType}><div ref={addType!}></div>Type</button>
                <button title="Add new collection" onClick={onAddCollection} ><div ref={addColl!}></div>Collection</button>
                <button title="Add new item" onClick={onAddItem}><div ref={addItem!}></div>Item...</button>
            </div>
            <Show when={types().length > 0}>

                <Collapsible
                    title="Sets"
                    isCollapsed={props.plugin.settings.sidebarState.typesCollapsed}
                    onToggle={(status) => onCollapsibleToggle("typesCollapsed", status)}>
                    <ul class="sets-sidebar-links">
                        {types().map(type => (
                            <ListTypeItem
                                link={getTypeSetPage(type)}
                                type={type}
                                plugin={props.plugin}
                                onNavigate={onNavigate}
                            />
                        ))}
                    </ul>
                </Collapsible>


            </Show>

            <Show when={collections().length > 0}>
                <Collapsible
                    title="Collections"
                    isCollapsed={props.plugin.settings.sidebarState.collectionsCollapsed}
                    onToggle={(status) => onCollapsibleToggle("collectionsCollapsed", status)}>
                    <ul class="sets-sidebar-links">
                        {collections().map(coll => (
                            <li><a
                                data-href={db.getCollectionFileName(coll)}
                                href={db.getCollectionFileName(coll)}
                                class="internal-link sets-filename-link"
                                target="_blank"
                                rel="noopener"
                                onClick={onNavigate}
                            >{unslugify(coll)}</a></li>
                        ))}
                    </ul>
                </Collapsible>
                <div class="sets-sidebar-widgets">
                    <For each={props.plugin.settings.sidebarState.widgets}>
                        {(widget, index) => (
                            <SidebarWidget
                                widget={widget}
                                index={index()}
                                onNavigate={onNavigate}
                                plugin={props.plugin}
                            />
                        )}
                    </For>
                    <div ref={addWidgetBtn!}
                        onClick={addWidget}
                        class="sets-sidebar-add-widget clickable-icon"></div>
                </div>
            </Show>
        </div>
    );
}

export default Sidebar;

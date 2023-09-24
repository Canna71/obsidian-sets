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
import { SidebarState } from "src/Settings";

type SidebarProps = {
    plugin: SetsPlugin
}

type ListTypeItemProps = {
    link: string,
    type: string,
    plugin: SetsPlugin,
    onNavigate: (e: MouseEvent) => void
}

const ListTypeItem: Component<ListTypeItemProps> = (props) => {

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

// generic function to update the sidebarState
// inside the plugin settings
// the function should receive a function that takes the current sidebarState
// and returns the new sidebarState
export function updateSidebarState(plugin: SetsPlugin, update: (sidebarState: SidebarState) => SidebarState) {
    const settings = {
        ...plugin.settings,
        sidebarState: update(plugin.settings.sidebarState)
    };
    plugin.settings = settings;
    plugin.saveSettings();
}

const Sidebar: Component<SidebarProps> = (props) => {

    const { db, app } = useApp()!;

    const [types, setTypes] = createSignal(db.getTypeNames());
    const [collections, setCollections] = createSignal(db.getCollectionNames());
    const [widgets, setWidgets] = createSignal(props.plugin.settings.sidebarState.widgets);

    let addType: HTMLDivElement;
    let addColl: HTMLDivElement;
    let addItem: HTMLDivElement;
    let addWidgetBtn: HTMLDivElement;

    onMount(() => {
        setIcon(addType, "file-type");
        setIcon(addColl, "collection");
        setIcon(addItem, "plus-square");
        // setIcon(addWidgetBtn, "plus-square");

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
                item.setTitle(`Create New ${unslugify(type)}`);
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
        const link = e.target as HTMLAnchorElement;
        const href = link.getAttribute("data-href");
        if (!href) return;
        e.preventDefault();
        app.workspace.openLinkText(href, "", false);
    }

    const onCollapsibleToggle = (key: string, status: boolean) => {
        props.plugin.settings.sidebarState[key] = status;
        props.plugin.saveSettings();
    }

    

    const addWidget = () => {
        updateSidebarState(props.plugin, (sidebarState) => {
            return {
                ...sidebarState,
                widgets: [
                    ...sidebarState.widgets || [],
                    {
                        title: "New Widget",
                        collapsed: false,
                        definition: {
                        }
                    }
                ]
            }
        });

        setWidgets(props.plugin.settings.sidebarState.widgets);
    }

    const deleteWidget = (index: number) => {
        
        updateSidebarState(props.plugin, (sidebarState) => {
            return {
                ...sidebarState,
                widgets: [...sidebarState.widgets.filter((w, i) => i !== index)]
            }
        }); 

        setWidgets(props.plugin.settings.sidebarState.widgets);
    }

    const onMove = (index: number, delta: number) => {
        const newIndex = index + delta;
        if (newIndex < 0 || newIndex >= widgets().length) return;
        const newwidgets = props.plugin.settings.sidebarState.widgets.slice();
        const widget = newwidgets[index];
        newwidgets.splice(index, 1);
        newwidgets.splice(newIndex, 0, widget);
        updateSidebarState(props.plugin, (sidebarState) => {
            return {
                ...sidebarState,
                widgets: newwidgets
            }
        }); 

        setWidgets(newwidgets);
    }

    return (
        <div class="sets-sidebar">
            <div class="sets-sidebar-buttons">
                <div  onClick={onAddType} ref={addType!} class="clickable-icon" title="Add new type"></div>
                {/* <button title="Add new type" onClick={onAddType}><div ref={addType!}></div>Type</button> */}
                <div title="Add new collection" class="clickable-icon"  onClick={onAddCollection}  ref={addColl!}></div>
                <div title="Add new item" class="clickable-icon" onClick={onAddItem} ref={addItem!}></div>
            </div>
            <div class="sets-sidebar-wrapper">
                <div class="sets-sidebar-scroller">

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

                    </Show>
                    <div class="sets-sidebar-widgets" onClick={onNavigate}>
                        <For each={widgets()}>
                            {(widget, index) => (
                                <SidebarWidget
                                    widget={widget}
                                    index={index()}
                                    total={widgets().length}
                                    onNavigate={onNavigate}
                                    plugin={props.plugin}
                                    onDelete={() => {deleteWidget(index())}}
                                    move={(delta: number) => {onMove(index(),delta) }}
                                />
                            )}
                        </For>
                        
                    </div>
                    <div ref={addWidgetBtn!}
                        title="Add new widget"
                            onClick={addWidget}
                            class="sets-sidebar-add-widget clickable-icon">Add New Widget</div>
                </div>
            </div>
        </div>
    );
}

export default Sidebar;

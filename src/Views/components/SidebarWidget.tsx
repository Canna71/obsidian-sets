import { App, Menu, TFile, debounce, setIcon } from "obsidian";
import { Accessor, Component, For, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { WidgetDefinition } from "src/Settings";
import SetsPlugin, { getSetsSettings } from "src/main";
import { ScopeEditorModal } from "../ScopeEditorModal";
import { IntrinsicAttributeKey, SetDefinition, VaultScope } from "./SetDefinition";
import { VaultDB, limitResults } from "src/Data/VaultDB";
import { IntrinsicAttributeDefinition } from "src/Data/IntrinsicAttributeDefinition";
import { FilterEditorModal } from "../FilterEditorModal";
import SortingEditorModal from "../SortingEditorModal";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { inferAttributes } from "./renderCodeBlock";
import ListView from "../ListView";
import { SetProvider } from "./SetProvider";
import { FieldSelectModal } from "../FieldSelectModal";
import Collapsible from "./Collapsible";
import { NameInputModal } from "../NameInputModal";
import { get } from "http";

export interface SidebarWidgetProps {
    widget: WidgetDefinition
    plugin: SetsPlugin
    index: number,
    total: number,
    onNavigate: (e: MouseEvent) => void
    onDelete: () => void
    move: (delta: number) => void;
}

// generic function to update the widget definition 
// inside the plugin settings
// the function should receive a function that takes the current definition
// and returns the new definition
export function updateWidgetDefinition(plugin: SetsPlugin, index: number, update: (def: WidgetDefinition) => WidgetDefinition) {
    const settings = {
        ...plugin.settings,
        sidebarState: {
            ...plugin.settings.sidebarState,
            widgets: plugin.settings.sidebarState.widgets.map((w, i) => {
                if (i === index) {
                    return update(w);
                }
                return w;
            })
        }
    };
    plugin.settings = settings;
    plugin.saveSettings();
}

type WidgetMenuProps = {
    widget: Accessor<WidgetDefinition>,
    db: VaultDB,
    app: App,
    index: number, 
    total: number,
    update: (def: WidgetDefinition) => void,
    delete: () => void
    move: (delta: number) => void
}

const WidgetMenu: Component<WidgetMenuProps> = (props) => {
    let widgetMenu: HTMLDivElement;
    const { widget, db, update, app } = props;
    // const { app } = props.db;

    createEffect(() => {
        setIcon(widgetMenu, "menu");
    });

    const updateSet = (set: SetDefinition) => {
        update({
            ...widget(),
            definition: set
        });
    }

    const onMenuClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const menu = new Menu();
        // add a menu item to rename the widget
        menu.addItem((item) => {
            const rename = "Rename";
            item.setTitle(rename);
            item.callback = () => {
                new NameInputModal(app, "Rename widget", "Enter name", widget().title, (result) => {
                    update({
                        ...widget(),
                        title: result
                    });
                }, undefined, false)
                    .open();
            }
            item.setIcon("pencil");
        });

        menu.addSeparator();


        menu.addItem((item) => {
            const scope = widget().definition.scope ? "Scope: " + widget().definition.scope : "Select scope";
            item.setTitle(scope);
            item.callback = () => {
                const scopeModal = new ScopeEditorModal(app, db, widget().definition, updateSet);
                scopeModal.open();
            }
        });

        // add menu item for selecting fields
        menu.addItem((item) => {
            const fields = "Attributes";
            item.setTitle(fields);
            item.callback = () => {
                const fieldsModal = new FieldSelectModal(app, db, widget().definition, updateSet);
                fieldsModal.open();
            }
        });

        // add menu item for setting a filter
        menu.addItem((item) => {
            const filter = "Filter";
            item.setTitle(filter);
            item.callback = () => {
                const filterModal = new FilterEditorModal(app, db, widget().definition, 
                getSetsSettings().topResultsWidget || 10,
                updateSet);
                filterModal.open();
            }
        });

        // ad menu for setting a sort order
        menu.addItem((item) => {
            const sort = "Sort";
            item.setTitle(sort);
            item.callback = () => {
                const sortModal = new SortingEditorModal(app, db, widget().definition, updateSet);
                sortModal.open();
            }
        });

        menu.addSeparator();
        
        // add menu for deleting the widget
        menu.addItem((item) => {
            const del = "Delete";
            item.setTitle(del);
            item.callback = props.delete
            item.setIcon("trash");
        });

        if(props.index >= props.total - 2) {
            menu.addItem((item) => {
                item.setTitle("Move up");
                item.setIcon("arrow-up");
                item.callback = () => {
                    props.move(-1);
                }
            })
        }

        if(props.index < props.total - 1) {
            menu.addItem((item) => {
                item.setTitle("Move down");
                item.setIcon("arrow-down");
                item.callback = () => {
                    props.move(1);
                }
            })
        }

        menu.showAtMouseEvent(e);
    }

    return (
        <div class="sets-sidebar-widget-menu-btn"
            ref={widgetMenu!}
            onClick={onMenuClick}
        ></div>
    )
}

const SidebarWidget: Component<SidebarWidgetProps> = (props) => {
    const { app, vaultDB: db } = props.plugin;
    const [widget, setWidget] = createSignal(props.widget);
    const sortby = () => widget().definition.sortby || [];
    const scope = () => widget().definition.scope || VaultScope;
    const clauses = () => widget().definition.filter || [];
    const query = () => db.fromClauses(scope(), clauses(), sortby());
    // const [allData, setAllData] = createSignal(db.execute(query()));

    const allData = () => db.execute(query());

    const data = () => {
        
        return limitResults(allData(), topResults());
    }

    const onDataChanged = debounce(() => {
        // triggers a change by updating the timestamp
        setWidget({...widget(), definition: {...widget().definition, timestamp: Date.now()}});

        // setAllData(db.execute(query()));
    },1000 + 1000*props.index);

    onMount(() => {
        setTimeout(() => {
            db.on("metadata-changed", onDataChanged);
        },110);
    })
 
    onCleanup(() => {
        db.off("metadata-changed", onDataChanged);
    })

    const update = (def: WidgetDefinition) => {
        const settings = {
            ...props.plugin.settings,
            sidebarState: {
                ...props.plugin.settings.sidebarState,
                widgets: props.plugin.settings.sidebarState.widgets.map((w, i) => {
                    if (i === props.index) {
                        return def
                    }
                    return w;
                })
            }
        };
        props.plugin.settings = settings;
        props.plugin.saveSettings();
        setWidget(def);
    }

    const topResults = () => {
        return widget().definition.topResults || getSetsSettings().topResultsWidget || 10;
    }

    // const fileNameAttribute = db.getAttributeDefinition(IntrinsicAttributeKey.FileName);

    const linkText = (file: TFile) => {
        return app.metadataCache.fileToLinktext(file, "/")
    }

    // Infer fields
    const attributes = () => {
        const { attributes, definition } = inferAttributes(widget().definition, db, data());
        return attributes;
    }

    const onWidgetToggle = (status: boolean) => {
        updateWidgetDefinition(props.plugin, props.index, (def) => {
            return {
                ...def,
                collapsed: status
            }
        });        
    }

    const computePosition = (index: number) => {
        const num = props.plugin.settings.sidebarState.widgets.length;
        
    }

    return (
        <div class="sets-sidebar-widget">
            <Collapsible
                title={<div class="sets-sidebar-widget-title">{widget().title}
                    <WidgetMenu
                        widget={widget}
                        db={db}
                        app={app}
                        index={props.index}
                        total={props.total}
                        update={update}
                        delete={props.onDelete}
                        move={props.move}
                    />
                </div>}
                isCollapsed={props.plugin.settings.sidebarState.widgets[props.index].collapsed}
                onToggle={onWidgetToggle}
            >

                <Show when={widget().definition.scope}>
                    <SetProvider setDefinition={widget().definition}
                        updateDefinition={() => { }}>
                        <div class="sets-sidebar-widget-content">

                            <ListView
                                attributes={attributes()}
                                data={data().data}

                            />
                        </div>
                    </SetProvider>
                </Show>
                <Show when={!widget().definition.scope}>
                    
                        <div class="sets-sidebar-empty">
                            No scope selected
                        </div>
                </Show>
            </Collapsible>





        </div >
    )
}

export default SidebarWidget;

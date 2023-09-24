import { App, Menu, TFile, setIcon } from "obsidian";
import { Accessor, Component, For, Show, createEffect, createSignal, onMount } from "solid-js";
import { WidgetDefinition } from "src/Settings";
import SetsPlugin from "src/main";
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

export interface SidebarWidgetProps {
    widget: WidgetDefinition
    plugin: SetsPlugin
    index: number
    onNavigate: (e: MouseEvent) => void
}

const WidgetMenu: Component<
    {
        widget: Accessor<WidgetDefinition>,
        db: VaultDB,
        app: App,
        update: (def: WidgetDefinition) => void
    }
> = (props) => {
    let widgetMenu: HTMLDivElement;
    const  {widget,db, update, app} = props;
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
                new NameInputModal(app, "Rename widget","Enter name", widget().title, (result) => {
                    update({
                        ...widget(),
                        title: result
                    });
                },undefined,false)
                .open();
            }
        });


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
                const filterModal = new FilterEditorModal(app, db, widget().definition, updateSet);
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

    const data = () => {
        const allData = db.execute(query());
        return limitResults(allData, topResults());
    }



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
        return widget().definition.topResults || 10;
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
        const settings = {
            ...props.plugin.settings,
            sidebarState: {
                ...props.plugin.settings.sidebarState,
                widgets: props.plugin.settings.sidebarState.widgets.map((w, i) => {
                    if (i === props.index) {
                        return {
                            ...w,
                            collapsed: status
                        }
                    }
                    return w;
                })
            }
        };
        props.plugin.settings = settings;
        props.plugin.saveSettings();
    }


    return (
        <div class="sets-sidebar-widget">
            <Collapsible
                title={<div class="sets-sidebar-widget-title">{widget().title}
                    <WidgetMenu 
                        widget={widget}
                        db={db}
                        app={app}
                        update={update}
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
            </Collapsible>





        </div >
    )
}

export default SidebarWidget;

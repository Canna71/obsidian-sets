import { Menu, TFile, setIcon } from "obsidian";
import { Component, For, Show, createSignal, onMount } from "solid-js";
import { WidgetDefinition } from "src/Settings";
import SetsPlugin from "src/main";
import { ScopeEditorModal } from "../ScopeEditorModal";
import { IntrinsicAttributeKey, SetDefinition, VaultScope } from "./SetDefinition";
import { limitResults } from "src/Data/VaultDB";
import { IntrinsicAttributeDefinition } from "src/Data/IntrinsicAttributeDefinition";
import { FilterEditorModal } from "../FilterEditorModal";
import SortingEditorModal from "../SortingEditorModal";
import { AttributeDefinition } from "src/Data/AttributeDefinition";
import { inferAttributes } from "./renderCodeBlock";
import ListView from "../ListView";
import { SetProvider } from "./SetProvider";

export interface SidebarWidgetProps {
    widget: WidgetDefinition
    plugin: SetsPlugin
    index: number
    onNavigate: (e: MouseEvent) => void
}

const SidebarWidget: Component<SidebarWidgetProps> = (props) => {
    const { app, vaultDB: db } = props.plugin;
    const [widget, setWidget] = createSignal(props.widget);
    let widgetMenu: HTMLDivElement;
    const sortby = () => widget().definition.sortby || [];
    const scope = () => widget().definition.scope || VaultScope;
    const clauses = () => widget().definition.filter || [];

    const query = () => db.fromClauses(scope(), clauses(), sortby());

    const data = () => {
        const allData = db.execute(query());
        return limitResults(allData, topResults());
    }

    onMount(() => {
        setIcon(widgetMenu, "menu");
    });

    const update = (def: SetDefinition) => {
        const settings = {
            ...props.plugin.settings,
            sidebarState: {
                ...props.plugin.settings.sidebarState,
                widgets: props.plugin.settings.sidebarState.widgets.map((w, i) => {
                    if (i === props.index) {
                        return {
                            ...w,
                            definition: def
                        }
                    }
                    return w;
                })
            }
        };
        props.plugin.settings = settings;
        props.plugin.saveSettings();
        setWidget({
            ...widget(),
            definition: def
        });
    }


    const onMenuClick = (e: MouseEvent) => {
        const menu = new Menu();
        menu.addItem((item) => {
            const scope = widget().definition.scope ? "Scope: " + widget().definition.scope : "Select scope";
            item.setTitle(scope);
            item.callback = () => {
                const scopeModal = new ScopeEditorModal(app, db, widget().definition, update);
                scopeModal.open();
            }
        });

        // add menu item for setting a filter
        menu.addItem((item) => {
            const filter = "Filter";
            item.setTitle(filter);
            item.callback = () => {
                const filterModal = new FilterEditorModal(app, db, widget().definition, update);
                filterModal.open();
            }
        });

        // ad menu for setting a sort order
        menu.addItem((item) => {
            const sort = "Sort";
            item.setTitle(sort);
            item.callback = () => {
                const sortModal = new SortingEditorModal(app, db, widget().definition, update);
                sortModal.open();
            }
        });

        menu.showAtMouseEvent(e);
    }

    const topResults = () => {
        return widget().definition.topResults || 10;
    }

    // const fileNameAttribute = db.getAttributeDefinition(IntrinsicAttributeKey.FileName);

    const linkText = (file: TFile) => {
        return app.metadataCache.fileToLinktext(file, "/")
    }

    // Infer fields

    const { attributes, definition } = inferAttributes(widget().definition, db, data());


    return (
        <div class="sets-sidebar-widget">
            <div class="sets-sidebar-widget-title">TODO: {props.widget.title}</div>
            <div class="sets-sidebar-widget-menu-btn" ref={widgetMenu!}
                onClick={onMenuClick}
            ></div>
            <Show when={widget().definition.scope}>
                <SetProvider setDefinition={widget().definition}
                    updateDefinition={() => {}}>
                <div class="sets-sidebar-widget-content">
                    {/* <For each={data().data}>
                        {(item) => {
                            return <div>
                                <a
                                data-href={linkText(item.file)}
                                href={linkText(item.file)}
                                class="internal-link sets-filename-link"
                                target="_blank"
                                rel="noopener"
                                onClick={props.onNavigate}
                            >{fileNameAttribute.format(item)}</a>
                                </div>
                        }}
                    </For> */}
                    <ListView
                        attributes={attributes}
                        data={data().data}
                    // definition={definition}
                    // onNavigate={props.onNavigate}
                    />
                </div>
            </SetProvider>
        </Show>
        </div >
    )
}

export default SidebarWidget;

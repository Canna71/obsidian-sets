import { create } from "domain";
import { useSet } from "./SetProvider";
import { Component, createEffect } from "solid-js";
import { Menu, setIcon } from "obsidian";
import { prettify } from "src/Utils/prettify";

const ViewMode: Component = () => {
    const { definition, setDefinition, save } = useSet()!;
    let icon: HTMLDivElement;
    const viewMode = () => definition().viewMode || "grid";

    const views = [
        { title: "Grid", icon: "table", viewMode: "grid" },
        { title: "List", icon: "list", viewMode: "list" },
        { title: "Board", icon: "board", viewMode: "board" },
        { title: "Gallery", icon: "layout-grid", viewMode: "gallery" },

    ];

    createEffect(() => {
        const mode = viewMode();
        const view = views.find(v => v.viewMode === mode);
        if(view) setIcon(icon, view.icon);
    })

    const tooltip = () => {
        const mode = viewMode();
        return `${prettify(mode)} view: click to change`;
    }


    const onClick = (e: MouseEvent) => {
        const menu = new Menu();
        

        views.forEach(view => {
            menu.addItem((item) => {
                item.setTitle(view.title);
                item.setIcon(view.icon);
                item.onClick(() => {
                    setDefinition({ ...definition(), viewMode: view.viewMode });
                    save();
                });
            });
        });

        menu.showAtMouseEvent(e);
    };

    return <div ref={icon!}
        class="clickable-icon"
        title={tooltip()}
        onClick={onClick}></div>
}

export default ViewMode;

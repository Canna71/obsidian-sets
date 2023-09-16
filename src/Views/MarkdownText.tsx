import { MarkdownRenderer, Component as ObsidianComponent } from "obsidian";
import { Component, createEffect } from "solid-js";
import { useApp } from "./components/AppProvider";
import SetsPlugin from "src/main";

export type MarkdownTextProps = {
    markdown: string;
}

const MarkdownText :Component<MarkdownTextProps> = (props) => {
    // gets app
    const { app } = useApp()!;
    let div :HTMLDivElement;

    createEffect(() => {
        //ts-ignore
        MarkdownRenderer.render(app,props.markdown,div,"/", app.plugins.plugins["obsidian-sets"] as SetsPlugin)
    });

    return <div ref={div!} class="sets-markdown-renderer"></div>
}

export default MarkdownText;

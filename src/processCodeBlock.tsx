import { MarkdownPostProcessorContext } from "obsidian";
import SetsPlugin from "./main";
import { render } from "solid-js/web";
import { GridView } from "Views/components/GridView";


export function processCodeBlock(source: string, el: HTMLElement, plugin: SetsPlugin, ctx: MarkdownPostProcessorContext) {
    // TODO: actual read source
    const data = plugin.queryVault([
        {
            operator: "eq",
            attribute: { tag: "metadata", attribute: "type" },
            value: "note"
        }
    ]);
    console.log(`data: `, data);

    render(()=><GridView />, el);
}

import { MarkdownPostProcessorContext } from "obsidian";
import SetsPlugin from "./main";
import { render } from "solid-js/web";
import  GridView  from "Views/components/GridView";
import { Attribute } from "./Query";


export function processCodeBlock(source: string, el: HTMLElement, plugin: SetsPlugin, ctx: MarkdownPostProcessorContext) {
    // TODO: actual read source
    const data = plugin.vaultDB.query([
        {
            operator: "eq",
            attribute: { tag: "metadata", attribute: "type" },
            value: "note"
        }
    ]);
    console.log(`data: `, data);
    const attributes : Attribute[] = [
        { tag: "file", attribute: "Name" },
        { tag: "metadata", attribute: "type", displayName: "Type" }
    ]

    render(()=><GridView data={data} attributes={attributes} />, el);
}

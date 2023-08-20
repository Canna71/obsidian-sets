import { MarkdownPostProcessorContext } from "obsidian";
import SetsPlugin from "./main";
import CodeBlock from "Views/components/renderCodeBlock";



export function processCodeBlock(source: string, el: HTMLElement, plugin: SetsPlugin, ctx: MarkdownPostProcessorContext) {
    // TODO: actual read source
    // and create Query with filters
    CodeBlock(
        plugin.vaultDB,
        [
        {
            operator: "eq",
            attribute: { tag: "metadata", attribute: "type" },
            value: "note"
        }
    ], el);
}

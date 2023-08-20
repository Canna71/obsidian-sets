import { MarkdownPostProcessorContext } from "obsidian";
import SetsPlugin from "./main";
import CodeBlock from "Views/components/renderCodeBlock";
import { Query } from "./Query";



export function processCodeBlock(source: string, el: HTMLElement, plugin: SetsPlugin, ctx: MarkdownPostProcessorContext) {
    // TODO: actual read source
    // and create Query with filters

    const query = Query.fromClauses([
        {
            operator: "eq",
            attribute: { tag: "metadata", attribute: "type" },
            value: "note"
        }
    ]);

    CodeBlock(plugin.vaultDB,query, el);
}

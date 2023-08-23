import { MarkdownPostProcessorContext, parseYaml } from "obsidian";
import SetsPlugin from "../main";
import CodeBlock from "src/Views/components/renderCodeBlock";
import { Query } from "../Data/Query";



export function processCodeBlock(source: string, el: HTMLElement, plugin: SetsPlugin, ctx: MarkdownPostProcessorContext) {
    // TODO: actual read source
    // and create Query with filters
    // TODO: write iterface
    // const code = JSON.parse(source);
    const code = parseYaml(source);
    const clauses = code.filter;

    const query = Query.fromClauses(clauses);

    // const query = Query.fromClauses([
    //     {
    //         operator: "eq",
    //         attribute: { tag: "metadata", attribute: "type" },
    //         value: "meeting"
    //     }
    // ]);

    CodeBlock(plugin.app, plugin.vaultDB,query, el);
}

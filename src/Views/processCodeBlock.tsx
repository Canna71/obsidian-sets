import { MarkdownPostProcessorContext, parseYaml } from "obsidian";
import SetsPlugin from "../main";
import renderCodeBlock, { SetDefinition } from "src/Views/components/renderCodeBlock";



export function processCodeBlock(source: string, el: HTMLElement, plugin: SetsPlugin, ctx: MarkdownPostProcessorContext) {
    // TODO: actual read source
    // and create Query with filters
    // TODO: write iterface
    // const code = JSON.parse(source);
    const definition = parseYaml(source) as SetDefinition;
    

    try {
        renderCodeBlock(plugin.app, plugin.vaultDB,definition, el);
    } catch(e) {
        console.error(e);
    }
}

import { MarkdownPostProcessorContext, MarkdownView, stringifyYaml } from "obsidian";

export function saveDataIntoBlock<T>(
    data: T,

    ctx: MarkdownPostProcessorContext
) {
   

    const view = app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    if (view.getMode() === "source") {
        const sec = ctx.getSectionInfo((ctx as any).el as HTMLElement);
        if (sec) {
            
            const yaml = stringifyYaml(data) + "\n";
            view?.editor.replaceRange(
                yaml,
                { line: sec?.lineStart + 1, ch: 0 },
                { line: sec?.lineEnd, ch: 0 },
                "*"
            );
            return true;
        }
    } 
    return false;
}
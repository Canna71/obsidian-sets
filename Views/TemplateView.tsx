/* eslint-disable @typescript-eslint/ban-types */
import { debounce, finishRenderMath, ItemView,  WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";



import { loadMathJax } from "obsidian";
import { TemplateSettings } from "src/Settings";
import { getTemplateSettings } from "src/main";
export const TEMPLATE_VIEW = "Template-view";

export const TemplateContext = React.createContext<any>({});



export class TemplateView extends ItemView {
    settings: TemplateSettings;
    root: Root;
    state = {

    };



    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        // this.settings = (this.app as any).plugins.plugins["obsidian-Template"].settings as TemplateSettings;
        this.settings = getTemplateSettings();
        this.state = {

        };
        this.icon = "sigma";
    }

    getViewType() {
        return TEMPLATE_VIEW;
    }

    getDisplayText() {
        return "Template";
    }

    override onResize(): void {
        super.onResize();
        this.handleResize();
    }

    handleResize = debounce(() => {
        this.render();
    }, 300);




    render() {

        this.root.render(
            <React.StrictMode>
                <TemplateContext.Provider value={{
                    width: this.contentEl.innerWidth,
                    settings: this.settings
                }}>
                   <div>TODO:</div>
                </TemplateContext.Provider>
            </React.StrictMode>
        );
    }



    async onOpen() {
        const { contentEl } = this;
        // contentEl.setText('Woah!');
        // this.titleEl.setText("Obsidian Janitor")	

        this.root = createRoot(contentEl/*.children[1]*/);
        await loadMathJax();
        await finishRenderMath();
        this.render();
        // const e = nerdamer('x^2+2*(cos(x)+x*x)');
        // const latex = e.toTeX();
        // console.log(latex);
        // const mathEl = renderMath(latex, true);
        // contentEl.appendChild(mathEl);
    }

    async onClose() {

        this.root.unmount();
    }
}

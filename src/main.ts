import { DEFAULT_SETTINGS, SetsSettings } from "src/Settings";
import { addIcon, debounce, MarkdownView, TFile } from "obsidian";

// import { MathResult } from './Extensions/ResultMarkdownChild';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SetsView, SETS_VIEW } from "../Views/SetsView";
import {
    App,
    finishRenderMath,
    loadMathJax,
    Modal,
    Plugin,
    WorkspaceLeaf,
} from "obsidian";
import { SetsSettingsTab } from "src/SettingTab";
import passwordPropertyType from "./propertytypes/password";
import { Query, matches } from "./Query";
import { processCodeBlock } from "./processCodeBlock";

const sigma = `<path stroke="currentColor" fill="none" d="M78.6067 22.8905L78.6067 7.71171L17.8914 7.71171L48.2491 48.1886L17.8914 88.6654L78.6067 88.6654L78.6067 73.4866" opacity="1"  stroke-linecap="round" stroke-linejoin="round" stroke-width="6" />
`;

// Remember to rename these classes and interfaces!

let gSettings: SetsSettings;

export type ObjectData = {
    name: string;
    file: TFile;
    frontmatter: unknown;
}

export function getSetsSettings() {
    return gSettings;
}

export default class SetsPlugin extends Plugin {
    settings: SetsSettings;
    hashesInitialized = false;
    hashes: Map<string, string> = new Map();

    async onload() {
        await this.loadSettings();

        this.registerView(SETS_VIEW, (leaf) => new SetsView(leaf, this));

        addIcon("sigma", sigma);

        if (this.settings.addRibbonIcon) {
            // This creates an icon in the left ribbon.
            const ribbonIconEl = this.addRibbonIcon(
                "sigma",
                "Open Sets",
                (evt: MouseEvent) => {
                    this.activateView();
                }
            );
            // Perform additional things with the ribbon
            ribbonIconEl.addClass("Sets-ribbon-class");
        }

        this.addCommand({
            id: "show-Sets-view",
            name: "Show Sets Sidebar",
            callback: () => this.activateView(),
        });

        this.app.workspace.onLayoutReady(() => {
            if (this.settings.showAtStartup) {
                this.activateView();
            }
        });

        this.registerCodeBlock();
        this.registerPostProcessor();
        this.registerEditorExtensions();

        this.app.workspace.on(
            "active-leaf-change",
            (leaf: WorkspaceLeaf | null) => {
                // console.log("active-leaf-change", leaf);
                if (leaf?.view instanceof MarkdownView) {
                    // @ts-expect-error, not typed
                    const editorView = leaf.view.editor.cm as EditorView;
                }
            },
            this
        );

        this.app.workspace.on(
            "codemirror",
            (cm: CodeMirror.Editor) => {
                console.log("codemirror", cm);
            },
            this
        );

        this.registerNewTypes();

        this.addSettingTab(new SetsSettingsTab(this.app, this));

        this.updateHashes();
        this.updateHashes = debounce(this.updateHashes.bind(this), 100)
        //TODO: deregister on unload
        this.app.metadataCache.on(
            "resolved",
            
                this.updateHashes
            
        );
    }

    updateHashes() {
        this.hashes.clear();
        //@ts-ignore
        for (const entry in this.app.metadataCache.fileCache) {
            //@ts-ignore
            const file = this.app.metadataCache.fileCache[entry];
            const hash = file.hash;

            this.hashes.set(hash, entry);
        }
        this.hashesInitialized = true;
        console.log(`hash updated`); 
    }

    registerNewTypes() {
        this.app.metadataTypeManager.registeredTypeWidgets.password =
            passwordPropertyType;
        this.app.metadataTypeManager.savePropertyInfo();
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(SETS_VIEW);
        this.app.metadataCache.off(
            "resolved",this.updateHashes
        );
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
        gSettings = this.settings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        this.app.workspace.detachLeavesOfType(SETS_VIEW);

        await this.app.workspace.getRightLeaf(false).setViewState(
            {
                type: SETS_VIEW,
                active: true,
            },
            { settings: this.settings }
        );

        this.app.workspace.revealLeaf(
            this.app.workspace.getLeavesOfType(SETS_VIEW)[0]
        );
    }

    async registerCodeBlock() {
        await loadMathJax();
        await finishRenderMath();
        this.registerMarkdownCodeBlockProcessor("set", (source, el, ctx) => {
            processCodeBlock(source, el, this, ctx);
        });
    }

    async registerPostProcessor() {
        
        // await loadMathJax();
        // await finishRenderMath();
        // this.registerMarkdownPostProcessor(getPostPrcessor(this.settings));
    }

    async registerEditorExtensions() {
        // this.registerEditorExtension([resultField, SetsConfigField]);
    }

    queryVault(query: Query) {
        if(!this.hashesInitialized){
            throw Error('plugin not initialized yet');
        }
        //@ts-ignore
        const cache = this.app.metadataCache.metadataCache;
        const ret = [];
        for (const hash in cache) {
            const md = cache[hash].frontmatter;
            try {
                const ob = this.getObjectData(hash, md);
                if (matches(query, ob)) {
                    // finds the actual file
                    
                    ret.push(ob);
                    // const file = fileCache
                }
            } catch(e) {
                console.warn(e);
            }
            
        }
        
        return ret;
    }

    private getObjectData(hash: string, md: unknown):ObjectData {
        const file = this.hashes.get(hash);
        if(!file) throw Error(`Hash ${hash} not found!`);
        const tfile = this.app.vault.getAbstractFileByPath(file);
        if(!tfile) throw Error(`File ${file} not found!`);
        if(!(tfile instanceof TFile)) throw Error(`${file} is a folder`);
        const ob = {
            name: file, 
            file: tfile,
            frontmatter: md,
        };
        return ob;
    }
}


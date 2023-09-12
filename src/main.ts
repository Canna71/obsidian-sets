import { prettify } from 'src/Utils/prettify';
import { CODEBLOCK_NAME, DEFAULT_SETTINGS, SetsSettings } from "src/Settings";
import {
    addIcon,
    Editor,
    MarkdownFileInfo,
    MarkdownView,
    Menu,
    MenuItem,
    Notice,
    TAbstractFile,
    TFile,
} from "obsidian";

// import { MathResult } from './Extensions/ResultMarkdownChild';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { SetsView, SETS_VIEW } from "./Views/SetsView";
import { finishRenderMath, loadMathJax, Plugin, WorkspaceLeaf } from "obsidian";
import { SetsSettingsTab } from "src/SettingTab";
import { processCodeBlock } from "./Views/processCodeBlock";
import { VaultDB } from "./Data/VaultDB";
import registerPasswordPropertyType from "./propertytypes/password";
import registerLinkPropertyType from "./propertytypes/link";
import { NameInputModal } from "./Views/NameInputModal";

// const sigma = `<path stroke="currentColor" fill="none" d="M78.6067 22.8905L78.6067 7.71171L17.8914 7.71171L48.2491 48.1886L17.8914 88.6654L78.6067 88.6654L78.6067 73.4866" opacity="1"  stroke-linecap="round" stroke-linejoin="round" stroke-width="6" />
// `;

// Remember to rename these classes and interfaces!

let gSettings: SetsSettings;

export function getSetsSettings() {
    return gSettings;
}

export default class SetsPlugin extends Plugin {
    settings: SetsSettings;

    _vaultDB: VaultDB;
    async onload() {
        await this.loadSettings();

        // this.registerView(SETS_VIEW, (leaf) => new SetsView(leaf, this));

        // addIcon("sigma", sigma);


        // const ribbonIconEl = this.addRibbonIcon(
        //     "database",
        //     "Open Sets",
        //     (evt: MouseEvent) => {
        //         this.activateView();
        //     }
        // );

        // Perform additional things with the ribbon
        // ribbonIconEl.addClass("Sets-ribbon-class");
        // }

        this.addCommand({
            id: "show-Sets-view",
            name: "Show Sets Sidebar",
            callback: () => this.activateView(),
        });

        this.addCommand({
            id: "sets-new-type",
            name: "Create New Type",
            callback: () => {
                new NameInputModal(this.app, "Type Name", async (name) => {
                    const newFile = await this._vaultDB.createNewType(name);
                    await this.app.workspace.openLinkText(newFile.path, "/", "tab");
                })
                .open()
                ;
            }
        }); 

        // register command to create new collection
        this.addCommand({
            id: "sets-new-collection",
            name: "Create New Collection",
            callback: () => {
                new NameInputModal(this.app, "Collection Name", async (name) => {
                    const newFile = await this._vaultDB.createNewCollection(name);
                    await this.app.workspace.openLinkText(newFile.path, "/", "tab");
                })
                .open()
                ;
            }
        });


        this.app.workspace.onLayoutReady(() => {
            if (this.settings.showAtStartup) {
                this.activateView();
            }
        });

        this.registerCodeBlock();
        this.registerPostProcessor();
        // this.registerEditorExtensions();

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


        this.registerNewTypes();

        this.addSettingTab(new SetsSettingsTab(this.app, this));

        this._vaultDB = new VaultDB(this);
        this.onVaultDBInitialized();
        // this.onVaultDBInitialized = this.onVaultDBInitialized.bind(this);

        // this._vaultDB.on("initialized", this.onVaultDBInitialized);


        this.onFileMenu = this.onFileMenu.bind(this);

        this.app.workspace.on("file-menu", this.onFileMenu);
        this.app.workspace.on("editor-menu", this.onEditorMenu);

        // this.patchView(tmp);
    }

    private patchView() {
        const tmp = MarkdownView.prototype.getDisplayText;
        const app = this.app;
        MarkdownView.prototype.getDisplayText = function () {
            const file = this.file as TFile;
            let prefix = "";
            if (file) {
                const md = app.metadataCache.getFileCache(file);
                if (md?.frontmatter?.__icon) prefix = md?.frontmatter?.__icon;
                console.log(file);
            }

            return prefix + tmp.call(this);
        };
    }

    onVaultDBInitialized() {
        // creates a command for each type to create a new item
        this._vaultDB.getTypeNames().forEach((type) => {
            this.addCommand({
                id: `sets-new-${type}`,
                name: `Create New ${prettify(type)}`,
                callback: async () => {
                    const file: TFile = await this._vaultDB.createNewInstance(type);
                    // open file
                    if (file) {
                        await this.app.workspace.openLinkText(file.path, file.path, true);
                    } else {
                        new Notice("Could not create file");
                    }
                }
            });
        });
    }

    registerNewTypes() {
        registerPasswordPropertyType(this.app);
        // registerLinkPropertyType(this.app);
        this.app.metadataTypeManager.savePropertyInfo();
    }

    onunload() {
        this.app.workspace.detachLeavesOfType(SETS_VIEW);
        this.vaultDB.off("initialized", this.onVaultDBInitialized);
        this.vaultDB.dispose();
        this.app.workspace.off("file-menu", this.onFileMenu);
        this.app.workspace.off("editor-menu", this.onEditorMenu);
    }

    public get vaultDB(): VaultDB {
        return this._vaultDB;
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
        this.registerMarkdownCodeBlockProcessor(CODEBLOCK_NAME, (source, el, ctx) => {
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

    private onFileMenu(
        menu: Menu,
        file: TAbstractFile,
        source: string,
        leaf?: WorkspaceLeaf
    ) {
        // console.log("onFileMenu",arguments);
        if (!(file instanceof TFile)) return;
        const collections = this._vaultDB.getCollections();
        const meta = this.app.metadataCache.getFileCache(file);
        // get collections currently linked by object
        const currentColl =
            (meta?.frontmatter?.[
                this.settings.collectionAttributeKey
            ] as string[]) || [];
        // map to wiki links
        let collectionLinks = collections.map((col) => ({
            col,
            link: this._vaultDB.generateWikiLink(col.file, "/"),
        }));
        // remove already linked collections
        collectionLinks = collectionLinks.filter(
            (cl) => !currentColl.includes(cl.link)
        );
        if (collectionLinks.length > 0) {
            menu.addItem((menuItem: MenuItem) => {
                menuItem.setTitle("Add To Collection...");
                collectionLinks.forEach((cl) => {
                    menuItem.setSubmenu().addItem((menuItem: MenuItem) => {
                        menuItem.setTitle(cl.col.file.basename);
                        menuItem.callback = () => {
                            currentColl.push(cl.link);
                            this.app.fileManager.processFrontMatter(
                                file,
                                (fm) => {
                                    fm[this.settings.collectionAttributeKey] =
                                        currentColl;
                                }
                            );
                        };
                    });
                });
            });
        }
    }

    private onEditorMenu(
        menu: Menu,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo
    ) {
    }
}

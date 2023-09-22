import { prettify } from 'src/Utils/prettify';
import { CODEBLOCK_NAME, DEFAULT_SETTINGS, SetsSettings } from "src/Settings";
import {
    addIcon,
    Command,
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
import { slugify, unslugify } from './Utils/slugify';
import { Show } from 'solid-js';
import { NewTypeModal } from './Views/NewTypeModal';
import { NewCollectionModal } from './Views/NewCollectionModal';
import { NameValueSuggestModal } from './Views/NameValueSuggestModal';

// const sigma = `<path stroke="currentColor" fill="none" d="M78.6067 22.8905L78.6067 7.71171L17.8914 7.71171L48.2491 48.1886L17.8914 88.6654L78.6067 88.6654L78.6067 73.4866" opacity="1"  stroke-linecap="round" stroke-linejoin="round" stroke-width="6" />
// `;

// Remember to rename these classes and interfaces!

const board = `<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-kanban"><path d="M6 5v11"/><path d="M12 5v6"/><path d="M18 5v14"/></svg>`;

let gSettings: SetsSettings;

export function getSetsSettings() {
    return gSettings;
}

export default class SetsPlugin extends Plugin {
    settings: SetsSettings;

    _vaultDB: VaultDB;
    _instanceCommands: Command[] = [];

    async onload() {
        await this.loadSettings();

        
        addIcon("board", board);

        this.app.workspace.onLayoutReady(() => {
            if (this.settings.showAtStartup) {
                this.activateView();
            }
        });

        this.registerCodeBlock();
        this.registerPostProcessor();

        this.app.workspace.on(
            "active-leaf-change",
            (leaf: WorkspaceLeaf | null) => {
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

        this.onFileMenu = this.onFileMenu.bind(this);

        this.app.workspace.on("file-menu", this.onFileMenu);
        this.app.workspace.on("editor-menu", this.onEditorMenu);

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
            }

            return prefix + tmp.call(this);
        };
    }

    onVaultDBInitialized() {
        this.registerCommands();
        this.vaultDB.on("metadata-changed", () => {
            this.registerNewInstancesCommands();
        });
    }

    registerCommands() {
        this.addCommand({
            id: "sets-new-type",
            name: "Create New Type",
            callback: () => {
                new NewTypeModal(this.app,this)
                    .open()
                    ;
            }
        });

        // register command to create new collection
        this.addCommand({
            id: "sets-new-collection",
            name: "Create New Collection",
            callback: () => {
                new NewCollectionModal(this.app, this )
                    .open()
                    ;
            }
        });

        // register command to add note to a collection
        this.addCommand({
            id: "sets-add-to-collection",
            name: "Add To Collection",
            checkCallback: (checking: boolean) => {
                const view = this.app.workspace.getActiveViewOfType(MarkdownView);
                if(checking) {
                    return !!view;
                    
                } else {
                    if(view) {
                        const file = view.file;
                        if(file instanceof TFile) {
                            const { collectionLinks, currentColl } = this.getAvailableCollections(file);
                            
                            const nameValues = collectionLinks.map(cl => ({name: cl.col.file.basename, value: cl.link}));
                            new NameValueSuggestModal(this.app, nameValues, (item) => {
                                currentColl.push(item.value);
                                this.app.fileManager.processFrontMatter(
                                    file,
                                    (fm) => {
                                        fm[this.settings.collectionAttributeKey] =
                                            currentColl;
                                    }
                                );
                            }).open();
                        }
                    }
                    return false;
                }
                    
            }
        });
        // register a command for each type to create a new item
        this.registerNewInstancesCommands();

    }

    public registerNewInstancesCommands() {


        const actualTypes = this._vaultDB.getTypeNames();

        actualTypes.forEach((type) => {
            // check if command already exists
            if (this._instanceCommands.find((cmd) => cmd.id === `${this.manifest.id}:sets-new-instance-${type}`)) return;


            const cmd = this.addCommand({
                id: `sets-new-instance-${type}`,
                name: `Create New ${unslugify(type)}`,
                callback: async () => {
                    // asks the user the name of the new item
                    new NameInputModal(this.app, `Enter ${unslugify(type)} Name`, `${unslugify(type)} Name`, async (name) => {
                        try {
                            const file: TFile = await this._vaultDB.createNewInstance(type, name);
                            // open file
                            if (file) {
                                await this.app.workspace.openLinkText(file.path, file.path, true);
                            } else {
                                new Notice("Could not create file");
                            }
                        } catch (e) {
                            new Notice(e.message);
                        }
                    })
                    .open();

                }
            });
            this._instanceCommands.push(cmd);
        });
        let toRemove: Command[] = [];
        // removes commands that are not more corresponding to a type
        this._instanceCommands.forEach((cmd) => {
            if (!actualTypes.includes(cmd.id.replace(`${this.manifest.id}:sets-new-instance-`, ""))) {
                this.app.commands.removeCommand(cmd.id);
                toRemove.push(cmd);
            }
        });
        toRemove.forEach((cmd) => {
            this._instanceCommands.splice(this._instanceCommands.indexOf(cmd), 1);
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
        this._vaultDB.off("metadata-changed", () => {
            this.registerNewInstancesCommands();
        });

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
    }

    async registerEditorExtensions() {
    }

    private onFileMenu(
        menu: Menu,
        file: TAbstractFile,
        source: string,
        leaf?: WorkspaceLeaf
    ) {
        if (!(file instanceof TFile)) return;
        const { collectionLinks, currentColl } = this.getAvailableCollections(file);
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

    private getAvailableCollections(file: TFile) {
        const collections = this.vaultDB.getCollections();
        const meta = this.app.metadataCache.getFileCache(file);
        // get collections currently linked by object
        const currentColl = (meta?.frontmatter?.[this.settings.collectionAttributeKey] as string[]) || [];
        // map to wiki links
        let collectionLinks = collections.map((col) => ({
            col,
            link: this.vaultDB.generateWikiLink(col.file, "/"),
        }));
        // remove already linked collections
        collectionLinks = collectionLinks.filter(
            (cl) => !currentColl.includes(cl.link)
        );
        return { collectionLinks, currentColl };
    }

    private onEditorMenu(
        menu: Menu,
        editor: Editor,
        info: MarkdownView | MarkdownFileInfo
    ) {
    }
}

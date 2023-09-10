import { App, CachedMetadata, TFile, TFolder, debounce } from "obsidian";
import SetsPlugin from "../main";
import {
    AttributeKey,
    Clause,
    IntrinsicAttributeKey,
    Query,
    SortField,
    isIntrinsicAttribute,
} from "./Query";
import { ObjectData } from "./ObjectData";
import Observer from "@jalik/observer";
import { MetadataAttributeDefinition } from "./MetadataAttributeDefinition";
import { IntrinsicAttributeDefinition } from "./IntrinsicAttributeDefinition";
import { AttributeDefinition } from "./AttributeDefinition";
import { getOperatorById } from "./Operator";
import { getDynamicValue, isDynamic } from "./DynamicValues";
import { FieldDefinition } from "src/Views/components/renderCodeBlock";
import { stableSort } from "src/Utils/stableSort";
import { generateCodeblock } from "src/Utils/generateCodeblock";
// import { IntrinsicAttributeDefinition } from "./IntrinsicAttributeDefinition";

export type DBEvent = "metadata-changed";

export type QueryResult = {
    data: ObjectData[];
    db: VaultDB;
    query: Query;
    total: number;
};

// define a scope type that could be "type", "collection", "folder" or "all"
// each scope type can have a further specifier, for example type has the type key
// collection has the collection file link, folder has the folder path
// all has no specifier

// TODO: support also "folder-recursive"

export type ScopeType = "type" | "collection" | "folder" | "vault";

// export type Scope = {"type": string} | {"collection": string} | {"folder": string | undefined} | {"vault": undefined};

export type Scope = [ScopeType, string?];
// export const VaultScope = {"vault": undefined} as Scope;
export const VaultScope: Scope = ["vault"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function escapeURI(e: string) {
    // eslint-disable-next-line no-control-regex
    return e.replace(/[\\\x00\x08\x0B\x0C\x0E-\x1F ]/g, function (e) {
        return encodeURIComponent(e);
    });
}

export class VaultDB {
    private dbInitialized = false;
    // private hashes: Map<string, string[]> = new Map();
    private plugin: SetsPlugin;
    private app: App;
    private _collectionCache?: ObjectData[] = undefined;
    private _typesCache?: TFile[] = undefined;
    private observer = new Observer();

    private accessors = new Map<string, AttributeDefinition>();

    constructor(plugin: SetsPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.onMetadataChanged();
        this.onMetadataChanged = debounce(
            this.onMetadataChanged.bind(this),
            100
        );
        //TODO: deregister on unload
        this.app.metadataCache.on("resolved", this.onMetadataChanged);
        this.app.vault.on("delete", this.onMetadataChanged);
        this.app.vault.on("rename", this.onMetadataChanged);
        this.app.vault.on("create", this.onMetadataChanged);
    }

    private onMetadataChanged() {
        // this.hashes.clear();
        //@ts-ignore
        // for (const entry in this.app.metadataCache.fileCache) {
        //     //@ts-ignore
        //     const file = this.app.metadataCache.fileCache[entry];
        //     const hash = file.hash;
        //     const list = this.hashes.get(hash) || [];
        //     list.push(entry);

        //     this.hashes.set(hash, list);
        // }
        console.log("metadata changed, clearing cache");
        this.accessors.clear();
        this.dbInitialized = true;
        this._collectionCache = undefined;
        this._typesCache = undefined;
        this.observer.notify("metadata-changed");
    }

    dispose() {
        console.log("disposing vaultdb");
        this.app.metadataCache.off("resolved", this.onMetadataChanged);
        this.app.vault.off("delete", this.onMetadataChanged);
        this.app.vault.off("rename", this.onMetadataChanged);
        this.app.vault.off("create", this.onMetadataChanged);
    }

    on(event: DBEvent, observer: (...args: any[]) => void) {
        this.observer.attach(event, observer);
    }

    off(event: DBEvent, observer: (...args: any[]) => void) {
        this.observer.detach(event, observer);
    }

    fromClauses(
        scope: Scope,
        clauses: Clause[],
        sort: SortField[],
        context?: ObjectData
    ): Query {
        return Query.__fromClauses(this, scope, clauses, sort, context);
    }

    // fromClausesSet(
    //     type: string,
    //     clauses: Clause[],
    //     sort: SortField[],
    //     context?: ObjectData
    // ): Query {
    //     return Query.__fromClauses(this, [ [this.plugin.settings.typeAttributeKey,"eq",type], ...clauses], sort, context);
    // }

    // fromClausesCollection(
    //     link: string,
    //     clauses: Clause[],
    //     sort: SortField[],
    //     context?: ObjectData
    // ): Query {
    //     return Query.__fromClauses(this, [ [this.plugin.settings.collectionAttributeKey,"hasall",[link]], ...clauses], sort, context);
    // }

    execute(query: Query, top = Number.MAX_VALUE): QueryResult {
        if (!this.dbInitialized) {
            throw Error("VaultDB not initialized yet");
        }
        const startTime = Date.now();
        const archetypeFolder = this.getArchetypeFolder();
        const types = archetypeFolder?.children || [];
        //@ts-ignore
        // const cache = this.app.metadataCache.metadataCache;
        const ret: ObjectData[] = [];

        let files;
        if (query.scopeFolder) {
            files = query.scopeFolder.children
                .filter((f) => f instanceof TFile)
                .filter((f) => f.path !== query.context?.file.path)
                .map((f) => f.path);
            // TODO: recurse into subfolders
        } else {
            //@ts-ignore
            files = this.app.metadataCache.getCachedFiles();
        }
        // const files: string[] = this.app.metadataCache.getCachedFiles();

        for (const filePath of files) {
            const fileCache = this.app.metadataCache.getCache(filePath);
            if (fileCache) {
                const ob = this.getObjectData(filePath, fileCache);
                if (types.contains(ob.file)) continue;
                if (query.matches(ob)) {
                    ret.push(ob);
                }
            }
        }

        // TODO: sorting
        const sortby = query.sortby;
        // const gt = getOperatorById("gt");
        // const lt = getOperatorById("lt");
        sortby.forEach((sortField) => {
            // ret.sort((a, b) => {
            stableSort(ret, (a, b) => {
                // const op = sortField[1] ? lt : gt;
                const attr = this.getAttributeDefinition(sortField[0]);
                return (sortField[1] ? -1 : 1) * this.compare(attr, a, b);
            });
        });
        const timeTaken = Date.now() - startTime;
        console.info(`${ret.length} items fetched in ${timeTaken}ms`);
        // log the current stack trace
        // console.trace();

        return {
            data: ret.slice(0, top),
            db: this,
            query,
            total: ret.length,
        };
    }

    async createNewType(name: string) {
        const typename = name.toLowerCase();
        const archetypeFolder = this.getArchetypeFolder();
        const archetypeName = this.getArchetypeName(name);
        const newFile = await this.app.fileManager.createNewFile(
            archetypeFolder,
            archetypeName,
            undefined,
            `${name} Archetype: add the properties of the ${name} here`
        );
        // adds the metadata type attribute
        this.app.fileManager.processFrontMatter(newFile, (fm) => {
            fm[this.plugin.settings.typeAttributeKey] = typename;
        });
        // create the set folder
        const setFolder = await this.getSetFolder(typename);
        this.createSetFile(setFolder as TFolder, typename);

        await this.app.workspace.openLinkText(newFile.path, "/", "tab");

        return newFile;
    }

    private async createSetFile(setFolder: TFolder, typename: string) {
        const filename = setFolder.name + ".md";
        const def = { scope: ["type", typename] as Scope };
        const content = generateCodeblock(def);
        const newFile = await this.app.vault.create(
            setFolder.path + "/" + filename,
            content
        );
        return newFile;
    }

    private compare(
        attr: AttributeDefinition,
        a: ObjectData,
        b: ObjectData
    ): number {
        const aval = attr.getValue(a);
        const bval = attr.getValue(b);

        if (aval === bval) return 0;
        if (!aval && !bval) return 0; // we treat falsy values as equal

        // we consider null and undefined values as less than any other value
        if (
            (aval === null || aval === undefined) &&
            bval !== undefined &&
            bval !== null
        )
            return -1;
        if (
            (bval === null || bval === undefined) &&
            aval !== undefined &&
            aval !== null
        )
            return 1;

        if (aval < bval) return -1;
        if (aval > bval) return 1;
        return 0;
    }

    queryType(type: string) {
        const query = this.fromClauses(
            VaultScope,
            [[this.plugin.settings.typeAttributeKey, "eq", type]],
            []
        );
        return this.execute(query);
    }

    canAdd(results: QueryResult) {
        // const type = results.query.inferSetType();
        // const collection = results.query.inferCollection();
        // if (!type && !collection) return false;
        // if(results.query.)
        return results.query.canCreate;
    }

    async addToSet(results: QueryResult, properties: FieldDefinition[]) {
        const tmp = await this.getTemplate(results);

        const { template, folder } = tmp;
        let content = "";
        if (template instanceof TFile) {
            content = await this.app.vault.read(template);
        }

        if (folder instanceof TFolder) {
            const defaults = this.inferProperties(properties, results);

            const newFile = await this.app.fileManager.createNewFile(
                folder as TFolder,
                undefined,
                undefined,
                content
            );
            this.app.fileManager.processFrontMatter(newFile, (frontMatter) => {
                // Object.assign(frontMatter, defaults);
                // merge defaults with frontmatter trying to give priority to fields with valies
                for (const key in defaults) {
                    if (
                        frontMatter[key] === null ||
                        frontMatter[key] === undefined
                    ) {
                        frontMatter[key] = defaults[key];
                    }
                    if (
                        Array.isArray(frontMatter[key]) &&
                        !frontMatter[key].includes(defaults[key])
                    ) {
                        frontMatter[key] = frontMatter[key].concat(
                            defaults[key]
                        );
                    }
                }
            });
            return newFile;
        }
    }
    private async getTemplate(results: QueryResult) {
        // gets the type constraint, if any.
        const type = results.query.inferSetType();
        if (type) {
            // const typeDisplayName = this.getTypeDisplayName(type);
            let folder;
            if (results.query.scopeFolder) {
                // we have to ensure that items are created in a way that
                // they are returned by the query
                folder = results.query.scopeFolder;
            } else {
                folder = this.plugin.settings.createObjectsInSetsFolder
                    ? await this.getSetFolder(type)
                    : results.query.context?.file.parent;
            }

            let template = this.getArchetypeFile(type);
            if (!template) {
                template = await this.inferType(type);
            }
            return { template, folder };
        }
        const collection = results.query.inferCollection();
        if (collection && results.query.context) {
            const folder = results.query.context.file.parent;
            if (folder) return { template: undefined, folder };
        }
        if (results.query.scopeFolder)
            return { template: undefined, folder: results.query.scopeFolder };
        const folder = results.query.context?.file.parent;
        return { template: undefined, folder };
    }

    inferProperties(
        properties: FieldDefinition[],
        results: QueryResult
    ): Record<string, any> {
        // build defaults from properties filtering the ones that begins with double underscore
        let defaults = properties
            .filter((prop) => !prop.startsWith("__"))
            .reduce((def, key) => {
                return { ...def, [key]: null };
            }, {} as Record<string, any>);

        const constraints = results.query.clauses
            .filter(([at]) => at !== this.plugin.settings.typeAttributeKey)
            // .filter(c => getOperatorById(c.op).isConstraint)
            .filter(([at]) => !this.getAttributeDefinition(at).isIntrinsic);
        const context = results.query.context;

        defaults = constraints.reduce((def, [at, op, val]) => {
            const operator = getOperatorById(op);
            const curDefault = def[at];

            let value = val;

            // if (curDefault === undefined) {
            //     return { ...def, [at]: value };
            // }

            // check if val is a dynamicvalue and process it

            if (isDynamic(val)) {
                value = getDynamicValue(
                    val,
                    this.getAttributeDefinition(at),
                    this,
                    context
                );
            }

            const okDefault = operator.enforce?.(curDefault, value, context);
            return { ...def, [at]: okDefault };
        }, defaults);
        return defaults;
    }

    getCollections(): ObjectData[] {
        if (this._collectionCache !== undefined) {
            return this._collectionCache;
        }

        const clause: Clause = [
            this.plugin.settings.typeAttributeKey,
            "eq",
            this.plugin.settings.collectionType,
        ];
        const query = this.fromClauses(VaultScope, [clause], []);
        const result = this.execute(query);
        this._collectionCache = result.data;
        return result.data;
    }

    getTypes(): TFile[] {
        if (this._typesCache !== undefined) {
            return this._typesCache;
        }
        const typesFolder = this.getArchetypeFolder();
        if (!typesFolder) return [];
        const typesFiles = typesFolder.children.filter(
            (f) => f instanceof TFile
        ) as TFile[];
        this._typesCache = typesFiles;
        return typesFiles;
    }

    // return the available type names by accessing the
    // frontmater of the TFiles returned by getTypes
    getTypeNames(): string[] {
        return this.getTypes()
            .map((f) => {
                const cache = this.app.metadataCache.getFileCache(f);
                if (cache) {
                    return cache.frontmatter?.[
                        this.plugin.settings.typeAttributeKey
                    ] as string;
                }
            })
            .filter((t) => t !== undefined) as string[];
    }

    // returns all the available collections
    getCollectionNames(): string[] {
        return this.getCollections()
            .map((f) => {
                return f.file.basename;
            })
            .filter((t) => t !== undefined) as string[];
    }

    getAttributeDefinition(key: string): AttributeDefinition {
        if (this.accessors.has(key)) {
            return this.accessors.get(key)!;
        }
        let ret: AttributeDefinition;
        if (isIntrinsicAttribute(key)) {
            ret = new IntrinsicAttributeDefinition(
                this.app,
                key as IntrinsicAttributeKey
            );
        } else {
            ret = new MetadataAttributeDefinition(this.app, key);
        }
        this.accessors.set(key, ret);
        return ret;
    }

    private getArchetypeFile(type: string) {
        // const typesFolder = this.getArchetypeFolder();
        // if(!typesFolder) return undefined;
        // const availableTypes = typesFolder.children;
        const availableTypes = this.getTypes();
        if (availableTypes.length < 1) return undefined;

        const typeFile = availableTypes.find((file) => {
            const cache = this.app.metadataCache.getFileCache(file);
            if (cache) {
                if (
                    cache.frontmatter?.[
                        this.plugin.settings.typeAttributeKey
                    ] === type
                )
                    return true;
            }
        });
        return typeFile;
        // const typeFilePath = this.getArchetypePath(typeDisplayName);
        // return this.app.vault.getAbstractFileByPath(typeFilePath);
    }

    getTypeAttributes(type: string) {
        const file = this.getArchetypeFile(type);
        if (file) {
            const cache = this.app.metadataCache.getFileCache(file);
            if (cache?.frontmatter) {
                return Object.keys(cache.frontmatter);
            }
        }
    }

    getFolder(path: string) {
        return this.app.vault.getAbstractFileByPath(path) as TFolder;
    }

    private getArchetypeFolder() {
        return this.app.vault.getAbstractFileByPath(
            this.plugin.settings.typesFolder
        ) as TFolder;
    }

    private getArchetypePath(typeDisplayName: string) {
        return (
            this.plugin.settings.typesFolder +
            "/" +
            this.getArchetypeName(typeDisplayName)
        );
    }

    private getArchetypeName(typeDisplayName: string) {
        return `${typeDisplayName}Type.md`;
    }

    private getTypeDisplayName(type: string) {
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    private async getSetFolder(type: string) {
        const setsRoot = this.plugin.settings.setsRoot;
        const typeDisplayName = this.getTypeDisplayName(type);
        const setFolder = `${setsRoot}/${typeDisplayName}Set`;

        let folder = this.app.vault.getAbstractFileByPath(setFolder);
        if (!folder || !(folder instanceof TFolder)) {
            folder = await this.app.vault.createFolder(setFolder);
        }
        return folder;
    }

    private async inferType(type: string) {
        const typeDisplayName = this.getTypeDisplayName(type);
        const subsum: Record<string, any[]> = {};
        const instances = this.queryType(type);
        for (const inst of instances.data) {
            if (inst.frontmatter) {
                for (const key in inst.frontmatter) {
                    subsum[key] = subsum[key] || [];
                    if (!subsum[key].contains(inst.frontmatter[key])) {
                        inst.frontmatter[key] &&
                            subsum[key].push(inst.frontmatter[key]);
                    }
                }
            }
        }
        const archeType = {};
        // now in subsum we have all possible keys with all possible values
        for (const key in subsum) {
            const values = subsum[key];
            if (values.length === 1) {
                archeType[key] = values[0];
            } else {
                archeType[key] = null;
            }
        }

        console.log("inferred type: ", archeType);
        const archetypeName = this.getArchetypeName(typeDisplayName);
        const archetypeFolder = await this.ensureFolder(
            this.plugin.settings.typesFolder
        );
        const newFIle = await this.app.fileManager.createNewFile(
            archetypeFolder,
            archetypeName,
            undefined,
            `${typeDisplayName} Archetype Inferred`
        );
        await this.app.fileManager.processFrontMatter(newFIle, (fm) => {
            Object.assign(fm, archeType);
        });
        return newFIle;
    }

    public generateWikiLink(file: TFile, source = "/") {
        // return app.fileManager.generateMarkdownLink(file,source)
        const linkText = app.metadataCache.fileToLinktext(file, source);

        return `[[${linkText}]]`;
        // return `[[${escapeURI(linkText)}]]`;
    }

    public getDataContext(filePath: string): ObjectData {
        return this.getObjectData(filePath);
    }

    private getObjectData(
        filePath: string,
        metadata?: CachedMetadata
    ): ObjectData {
        if (metadata === undefined) {
            metadata = this.app.metadataCache.getCache(filePath) || undefined;
        }
        const tfile = this.app.vault.getAbstractFileByPath(filePath);
        if (!tfile) throw Error(`File ${filePath} not found!`);
        if (!(tfile instanceof TFile)) throw Error(`${filePath} is a folder`);
        const ob = {
            name: filePath,
            file: tfile,
            //@ts-ignore
            frontmatter: metadata.frontmatter,
            db: this,
        };
        return ob;
    }

    private async ensureFolder(path: string) {
        let folder = this.app.vault.getAbstractFileByPath(path);
        if (!folder || !(folder instanceof TFolder)) {
            folder = await this.app.vault.createFolder(path);
        }
        return folder as TFolder;
    }

    inferFields(results: QueryResult): AttributeKey[] {
        const avail = {};
        results.data.forEach((result) => {
            Object.assign(avail, result.frontmatter);
        });

        return [...Object.keys(avail)];
    }
}

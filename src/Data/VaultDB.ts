
import { App, CachedMetadata, TFile, TFolder, debounce } from "obsidian";
import SetsPlugin from "../main";
import { Clause, IntrinsicAttributeKey, Query, SortField, isIntrinsicAttribute } from "./Query";
import { ObjectData } from "./ObjectData";
import Observer from "@jalik/observer";
import { MetadataAttributeDefinition } from "./MetadataAttributeDefinition";
import { IntrinsicAttributeDefinition } from "./IntrinsicAttributeDefinition";
import { AttributeDefinition } from "./AttributeDefinition";
import { getOperatorById } from "./Operator";
// import { IntrinsicAttributeDefinition } from "./IntrinsicAttributeDefinition";

export type DBEvent = "metadata-changed";

export type QueryResult = {
    data: ObjectData[];
    db: VaultDB;
    query: Query;
};

export class VaultDB {
    private dbInitialized = false;
    // private hashes: Map<string, string[]> = new Map();
    private plugin: SetsPlugin;
    private app: App;

    private observer = new Observer();

    private accessors = new Map<string,AttributeDefinition>();

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
        this.accessors.clear();
        this.dbInitialized = true;

        this.observer.notify("metadata-changed");
    }

    dispose() {
        this.app.metadataCache.off("resolved", this.onMetadataChanged);
    }

    on(event: DBEvent, observer: (...args: any[]) => void) {
        this.observer.attach(event, observer);
    }

    off(event: DBEvent, observer: (...args: any[]) => void) {
        this.observer.detach(event, observer);
    }

    fromClauses(clauses: Clause[], sort?: SortField[]): Query {
        return Query.__fromClauses(this, clauses, sort || []);
    }

    execute(query: Query): QueryResult {
        if (!this.dbInitialized) {
            throw Error("VaultDB not initialized yet");
        }
        const archetypeFolder = this.getArchetypeFolder();
        const types = archetypeFolder?.children || [];
        //@ts-ignore
        // const cache = this.app.metadataCache.metadataCache;
        const ret: ObjectData[] = [];
        
        //@ts-ignore
        const files: string[] = this.app.metadataCache.getCachedFiles();
        for (const filePath of files) {
            const fileCache = this.app.metadataCache.getCache(filePath);
            if (fileCache) {
                const ob = this.getObjectData(filePath, fileCache);
                if(types.contains(ob.file)) continue;
                if (query.matches(ob)) {
                    ret.push(ob);
                }
            }
        }
        return {
            data: ret,
            db: this,
            query,
        };
    }

    queryType(type: string) {
        const query = this.fromClauses([
            [this.plugin.settings.typeAttributeKey,"eq",type]
        ]);
        return this.execute(query);
    }

    canAdd(results: QueryResult) {
        const type = results.query.inferSetType();
        return type !== undefined && results.query.canCreate;
    }

    async addToSet(results: QueryResult) {
        const type = results.query.inferSetType();
        if(!type) {
            throw Error("Could not infer type.")
        }
        // const typeDisplayName = this.getTypeDisplayName(type);
        const folder = await this.getSetFolder(type);
        let template = this.getArchetypeFile(type);
        if (!template) {
            template = await this.inferType(type);
        }
        const defaults = this.inferProperties(results);

        if (template instanceof TFile) {
            const content = await this.app.vault.read(template);
            const newFIle = await this.app.fileManager.createNewFile(
                folder as TFolder,
                undefined,
                undefined,
                content
            );
            console.log("new file created:", newFIle.path);
            this.app.fileManager.processFrontMatter(newFIle, (frontMatter)=>{
                Object.assign(frontMatter, defaults);
            })
        }
    }
    inferProperties(results: QueryResult) : Record<string,any> {
        const constraints = results.query.clauses.filter(([at]) => at !== this.plugin.settings.typeAttributeKey)
        // .filter(c => getOperatorById(c.op).isConstraint)
        .filter(([at]) => !this.getAttributeDefinition(at).isIntrinsic)
        ;
        const defaults = constraints.reduce((def, [at,op,val])=>{
            const operator = getOperatorById(op);
            const curDefault = def[at];

            const okDefault = operator.enforce?.(curDefault, val);
            return {...def, [at]: okDefault}
        },{} as Record<string,any>);
        return defaults; 
    }

    

    getAttributeDefinition(key: string):AttributeDefinition {
        if(this.accessors.has(key)){
            return this.accessors.get(key)!;
        }
        let ret:AttributeDefinition;
        if (isIntrinsicAttribute(key) ) {
            ret = new IntrinsicAttributeDefinition(this.app, key as IntrinsicAttributeKey);
        } else {
            ret = new MetadataAttributeDefinition(this.app, key);
        }
        this.accessors.set(key,ret);
        return ret;
    }


    

    private getArchetypeFile(type: string) {

        const typesFolder = this.getArchetypeFolder();
        if(!typesFolder) return undefined;
        const availableTypes = typesFolder.children;

        const typeFile = availableTypes.find(file=>{
            if(file instanceof TFile){
                const cache = this.app.metadataCache.getFileCache(file);
                if(cache) {
                    if(cache.frontmatter?.[this.plugin.settings.typeAttributeKey] === type) return true;
                }
            }
        })
        return typeFile;
        // const typeFilePath = this.getArchetypePath(typeDisplayName);
        // return this.app.vault.getAbstractFileByPath(typeFilePath);
    }

    private getArchetypeFolder() {
        return this.app.vault.getAbstractFileByPath(this.plugin.settings.typesFolder) as TFolder;
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
                        inst.frontmatter[key] && subsum[key].push(inst.frontmatter[key]);
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

    private getObjectData(
        filePath: string,
        metadata: CachedMetadata
    ): ObjectData {
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
        if(!folder || !(folder instanceof TFolder)){
            folder = await this.app.vault.createFolder(path)
        }
        return folder as TFolder;
    }
}

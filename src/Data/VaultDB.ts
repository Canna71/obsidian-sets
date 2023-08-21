import { App, CachedMetadata, TFile, TFolder, debounce } from "obsidian";
import SetsPlugin from "../main";
import { Query } from "./Query";
import { ObjectData } from "./ObjectData";
import Observer from "@jalik/observer";

export type DBEvent = "metadata-changed";

export type QueryResult = {
    data: ObjectData[],
    db: VaultDB,
    query: Query
}

export  class VaultDB {
    private dbInitialized = false;
    // private hashes: Map<string, string[]> = new Map();
    private plugin:SetsPlugin;
    private app: App;

    private observer = new Observer();

    constructor(plugin: SetsPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.onMetadataChanged();
        this.onMetadataChanged = debounce(this.onMetadataChanged.bind(this), 100)
        //TODO: deregister on unload
        this.app.metadataCache.on(
            "resolved", this.onMetadataChanged
        );
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
        this.dbInitialized = true;
        this.observer.notify("metadata-changed");
        console.log(`metadata changed`); 
    }

    dispose() {
        this.app.metadataCache.off(
            "resolved",this.onMetadataChanged
        );
    }

    on(event:DBEvent, observer: (...args: any[]) => void) {
        this.observer.attach(event,observer);
    }

    off(event:DBEvent, observer: (...args: any[]) => void) {
        this.observer.detach(event,observer);
    }

    query(query: Query):QueryResult {
        if(!this.dbInitialized){
            throw Error('VaultDB not initialized yet');
        }
        //@ts-ignore
        // const cache = this.app.metadataCache.metadataCache;
        const ret:ObjectData[] = [];
        // for (const hash in cache) {
        //     const md = cache[hash].frontmatter;
        //     try {
        //         const ob = this.getObjectData(hash, md);
        //         if (query.matches(ob)) {
        //             // finds the actual file
                    
        //             ret.push(ob);
        //             // const file = fileCache
        //         }
        //     } catch(e) {
        //         console.warn(e);
        //     }
            
        // }
        //@ts-ignore
        const files : string[] = this.app.metadataCache.getCachedFiles()
        for(const filePath of files) {
            const fileCache = this.app.metadataCache.getCache(filePath);
            if(fileCache){
                const ob = this.getObjectData(filePath, fileCache);
                if(query.matches(ob)){
                    ret.push(ob);
                }
            }

        }
        return {
            data: ret,
            db: this,
            query
        };
    }

    queryType(type: string) {
        const query = Query.fromClauses([
            {
                op: "eq",
                at: { tag: "md", key: this.plugin.settings.typeAttributeKey },
                val: type
            }
        ]);
        return this.query(query);
    }
 
    async addToSet(type: string) {
        const typeDisplayName = this.getTypeDisplayName(type);        
        const folder = await this.getSetFolder(type);
        let template = this.getArchetypeFile(typeDisplayName);


        if(!template) {
            template = await this.inferType(type);
        }

        if(template instanceof TFile){
            const content = await this.app.vault.read(template);
            const newFIle = await this.app.fileManager.createNewFile(folder as TFolder,undefined,undefined,content);
            console.log("new file created:", newFIle.path);
        } 
   
    }

    private getArchetypeFile(typeDisplayName: string) {
        const typeFilePath = this.getArchetypePath(typeDisplayName);
        return this.app.vault.getAbstractFileByPath(typeFilePath);
    }

    private getArchetypePath(typeDisplayName: string) {
        return this.plugin.settings.typesFolder + "/" + this.getArchetypeName(typeDisplayName);
    }

    private getArchetypeName(typeDisplayName: string) {
        return `${typeDisplayName}Type.md`;
    }

    private getTypeDisplayName(type: string) {
        return  type.charAt(0).toUpperCase() + type.slice(1);
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

        console.log('inferred type: ', archeType);
        const archetypeName = this.getArchetypeName(typeDisplayName);
        const archetypeFolder = this.app.vault.getAbstractFileByPath(this.plugin.settings.typesFolder);
        const newFIle = await this.app.fileManager.createNewFile(archetypeFolder as TFolder,archetypeName,undefined,`${typeDisplayName} Archetype Inferred`);
        await this.app.fileManager.processFrontMatter(newFIle,fm=>{
            Object.assign(fm, archeType);
        })
        return newFIle;
    }

    private getObjectData(filePath: string, metadata: CachedMetadata):ObjectData {
        
        const tfile = this.app.vault.getAbstractFileByPath(filePath);
        if(!tfile) throw Error(`File ${filePath} not found!`);
        if(!(tfile instanceof TFile)) throw Error(`${filePath} is a folder`);
        const ob = {
            name: filePath, 
            file: tfile,
            //@ts-ignore
            frontmatter: metadata.frontmatter,
            db: this
        };
        return ob;
    }
}

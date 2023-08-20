import { App, TFile, TFolder, debounce } from "obsidian";
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
    private hashesInitialized = false;
    private hashes: Map<string, string> = new Map();
    private plugin:SetsPlugin;
    private app: App;

    private observer = new Observer();

    constructor(plugin: SetsPlugin) {
        this.plugin = plugin;
        this.app = plugin.app;
        this.updateHashes();
        this.updateHashes = debounce(this.updateHashes.bind(this), 100)
        //TODO: deregister on unload
        this.app.metadataCache.on(
            "resolved", this.updateHashes
        );
    }

    private updateHashes() {
        this.hashes.clear();
        //@ts-ignore
        for (const entry in this.app.metadataCache.fileCache) {
            //@ts-ignore
            const file = this.app.metadataCache.fileCache[entry];
            const hash = file.hash;

            this.hashes.set(hash, entry);
        }
        this.hashesInitialized = true;
        this.observer.notify("metadata-changed");
        console.log(`hash updated`); 
    }

    dispose() {
        this.app.metadataCache.off(
            "resolved",this.updateHashes
        );
    }

    on(event:DBEvent, observer: (...args: any[]) => void) {
        this.observer.attach(event,observer);
    }

    off(event:DBEvent, observer: (...args: any[]) => void) {
        this.observer.detach(event,observer);
    }

    query(query: Query):QueryResult {
        if(!this.hashesInitialized){
            throw Error('VaultDB not initialized yet');
        }
        //@ts-ignore
        const cache = this.app.metadataCache.metadataCache;
        const ret:ObjectData[] = [];
        for (const hash in cache) {
            const md = cache[hash].frontmatter;
            try {
                const ob = this.getObjectData(hash, md);
                if (query.matches(ob)) {
                    // finds the actual file
                    
                    ret.push(ob);
                    // const file = fileCache
                }
            } catch(e) {
                console.warn(e);
            }
            
        }
        
        return {
            data: ret,
            db: this,
            query
        };
    }
 
    async addToSet(type: string) {
        const setsRoot = this.plugin.settings.setsRoot;
        const typeDisplayName = type.charAt(0).toUpperCase() + type.slice(1);
        const setFolder = `${setsRoot}/${typeDisplayName}Set`;
         
        let folder = this.app.vault.getAbstractFileByPath(setFolder);
        if(!folder || !(folder instanceof TFolder)){
            folder = await this.app.vault.createFolder(setFolder);
        }
        const typeFilePath = this.plugin.settings.typesFolder + "/" + `${typeDisplayName}Type.md`
        const template = this.app.vault.getAbstractFileByPath(typeFilePath);
        // TODO: what if it doesn't exists yet?
        // TODO: create template by using current properties
        if(template instanceof TFile){
            const content = await this.app.vault.read(template);
            const newFIle = this.app.fileManager.createNewFile(folder as TFolder,undefined,undefined,content);
            console.log("new file created");
        }

        
    }
    
    private getObjectData(hash: string, md: Record<string,any>):ObjectData {
        const file = this.hashes.get(hash);
        if(!file) throw Error(`Hash ${hash} not found!`);
        const tfile = this.app.vault.getAbstractFileByPath(file);
        if(!tfile) throw Error(`File ${file} not found!`);
        if(!(tfile instanceof TFile)) throw Error(`${file} is a folder`);
        const ob = {
            name: file, 
            file: tfile,
            frontmatter: md,
            db: this
        };
        return ob;
    }
}

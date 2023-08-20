import { App, TFile, debounce } from "obsidian";
import SetsPlugin from "./main";
import { Query, matches } from "./Query";
import { ObjectData } from "./ObjectData";

export  class VaultDB {
    hashesInitialized = false;
    hashes: Map<string, string> = new Map();
    plugin:SetsPlugin;
    app: App;

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
        console.log(`hash updated`); 
    }

    dispose() {
        this.app.metadataCache.off(
            "resolved",this.updateHashes
        );
    }

    queryVault(query: Query) {
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
        };
        return ob;
    }
}

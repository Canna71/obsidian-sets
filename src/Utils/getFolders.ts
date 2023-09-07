import { App } from "obsidian";

export  function getFolders(app: App):string[]{
    //@ts-ignore
    const files = app.vault.adapter.files;
    const folders:string[] = [];
    for(const key in files){
        if(files[key].type === "folder"){
            folders.push(files[key].realpath);
        }
    }
    return folders;
}

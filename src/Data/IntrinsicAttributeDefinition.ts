import { ObjectData } from "./ObjectData";
import { AttributeDefinition } from "./AttributeDefinition";
import { App, moment } from "obsidian";
import { IntrinsicAttributeKey } from "src/Views/components/SetDefinition";

// function getFileAttribute(file: TFile, key: IntrinsicAttributeKey) {
//     switch(key){
//         case "FileCreationDate":
//             return moment(file.stat.ctime).format("LL");
//         case "FileModificationDate":
//             return moment(file.stat.mtime).format("LL");
//         case "FileName":
//             return file.name;
//         case "FilePath":
//             return file.path;
//     }
// }

export class IntrinsicAttributeDefinition implements AttributeDefinition {
    _key: IntrinsicAttributeKey;
    
    private _app: App;
    constructor(app: App, key: IntrinsicAttributeKey) {
        this._key = key;
        
        this._app = app;
    }
    get key() { return this._key; }

    displayName() { 

        switch(this._key){
            case IntrinsicAttributeKey.FileCreationDate:
                return "Creation date";
            case IntrinsicAttributeKey.FileModificationDate:
                return "Modification date";
            case IntrinsicAttributeKey.FileName:
                return "Name";
            case IntrinsicAttributeKey.FilePath:
                return "Path";
            default:
                return "Unknown";
        }
     }
    getValue(data: ObjectData) {
        switch(this._key){
            case IntrinsicAttributeKey.FileCreationDate:
                return moment(data.file.stat.ctime).toISOString();
            case IntrinsicAttributeKey.FileModificationDate:
                return moment(data.file.stat.mtime).toISOString();
            case IntrinsicAttributeKey.FileName:
                return data.file.basename;
            case IntrinsicAttributeKey.FilePath:
                return data.file.path;
        }
    }
    // TODO: remove dependency from app
    getPropertyWidget() {
        switch(this._key){
            case IntrinsicAttributeKey.FileCreationDate:
            case IntrinsicAttributeKey.FileModificationDate:
                return this._app.metadataTypeManager.registeredTypeWidgets["date"];
            case IntrinsicAttributeKey.FileName:
            case IntrinsicAttributeKey.FilePath:
            default:
                return this._app.metadataTypeManager.registeredTypeWidgets["text"];
        }
    }
    getPropertyInfo() {
        return { key: this._key, type: "text" };
    }

    get readonly() { return this._key !== IntrinsicAttributeKey.FileName; }
    get isIntrinsic() { return true; }

    format(data: ObjectData) { 
        const value = this.getValue(data)
        switch(this._key){
            case IntrinsicAttributeKey.FileCreationDate:
            case IntrinsicAttributeKey.FileModificationDate:
                return moment(value).format("LL");
            default:
                return value?.toString() || "";
        }
    }
}

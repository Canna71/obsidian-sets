import { ObjectData } from "./ObjectData";
import { AttributeDefinition } from "./AttributeDefinition";
import { App, TFile, moment } from "obsidian";
import { IntrinsicAttributeKey } from "./Query";

function getFileAttribute(file: TFile, key: IntrinsicAttributeKey) {
    switch(key){
        case "FileCreationDate":
            return moment(file.stat.ctime);
        case "FileModificationDate":
            return moment(file.stat.mtime);
        case "FileName":
            return file.name;
        case "FilePath":
            return file.path;
    }
}

export class IntrinsicAttributeDefinition implements AttributeDefinition {
    _key: IntrinsicAttributeKey;
    _displayName: string;
    constructor(app: App, key: IntrinsicAttributeKey, displayName?: string) {
        this._key = key;
        this._displayName = this._displayName ||
            key[0].toUpperCase() + key.slice(1);
    }
    displayName() { return this._displayName; }
    getValue(data: ObjectData) {
        return getFileAttribute(data.file, this._key)
    }
    // TODO: remove dependency from app
    getPropertyWidget() {
        return undefined;
    }

    getPropertyInfo() {
        return { key: this._key, type: "text" };
    }

    get readonly() { return true; }

}

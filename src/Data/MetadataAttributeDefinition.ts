import { ObjectData } from "./ObjectData";
import { AttributeDefinition } from "./AttributeDefinition";
import { App } from "obsidian";



export class MetadataAttributeDefinition implements AttributeDefinition {
    _key: string;
    _displayName: string;
    constructor(app: App, key: string, displayName?: string) {
        this._key = key;
        this._displayName = this._displayName ||
            key[0].toUpperCase() + key.slice(1);
    }
    displayName() { return this._displayName; }
    getValue(data: ObjectData) { 
        return data.frontmatter?.[this._key];
        // return getMetadataAttribute(data, { "tag": "md", "key": this._key }); 
    }

    format(data: ObjectData) { 
        return this.getValue(data).toString();
        // return getMetadataAttribute(data, { "tag": "md", "key": this._key }); 
    }
    // TODO: remove dependency from app
    getPropertyWidget() {
        const key = this._key;
        const propertyInfo = app.metadataTypeManager.getPropertyInfo(key);
        const type = app.metadataTypeManager.getAssignedType(key) || propertyInfo?.type;
        const widget = app.metadataTypeManager.registeredTypeWidgets[type];
        return widget;
    }

    getPropertyInfo() {
        const key = this._key;
        const propertyInfo = app.metadataTypeManager.getPropertyInfo(this._key);
        const type = app.metadataTypeManager.getAssignedType(key) || propertyInfo?.type;
        return { key, type };
    }

    get readonly() {return false;}
    get isIntrinsic() { return false; }
}



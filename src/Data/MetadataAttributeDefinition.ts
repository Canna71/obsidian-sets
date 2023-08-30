import { ObjectData } from "./ObjectData";
import { AttributeDefinition } from "./AttributeDefinition";
import { App } from "obsidian";
import { prettify } from "src/Utils/prettify";



export class MetadataAttributeDefinition implements AttributeDefinition {
    _key: string;
    _displayName: string;
    private _app: App;
    constructor(app: App, key: string, displayName?: string) {
        this._key = key;
        this._displayName = this._displayName ||
            prettify(this._key);
        this._app = app;
    }
    get key() { return this._key; }
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
        const propertyInfo = this._app.metadataTypeManager.getPropertyInfo(key);
        const type = this._app.metadataTypeManager.getAssignedType(key) || propertyInfo?.type;
        const widget = this._app.metadataTypeManager.registeredTypeWidgets[type];
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



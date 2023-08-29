import { App, SuggestModal, setIcon } from "obsidian";
import { sortBy } from "src/Utils/sortBy";
import { PropertyInfo } from "src/obsidian-ex";


export interface PropertyData {
    name: string;
    count: number;
    typeKey: string;
    typeName: string;
    typeIcon: string;
}

export class AttributeModal extends SuggestModal<PropertyData> {
    private _types: any;
    private _onSelect: (PropertyData: any) => void;
    // private _app: App;
    constructor(app: App, onSelect:(PropertyData)=>void) {
        super(app);
        // this._types = indexBy<any>("type",Object.values(app.metadataTypeManager.registeredTypeWidgets));
        this._types = app.metadataTypeManager.registeredTypeWidgets;
        this._onSelect = onSelect;
    }
    // Returns all available suggestions.
    getSuggestions(query: string): PropertyData[] {
        query = query.toLowerCase();
        
        let propInfo: PropertyInfo[] = Object.values(this.app.metadataTypeManager.properties)
            .filter(property => property.name && property.name.length && property.name.toLowerCase().includes(query))
            ;
        propInfo = sortBy("name", propInfo);
        const ret = propInfo.map(pi => {
            //this._types.find(rtw => rtw.type === pi.type);
            const type = this._types[pi.type];
                return ({
                    name: pi.name,
                    count: pi.count,
                    typeName: type?.name(),
                    typeKey: type?.type,
                    typeIcon: type?.icon
                })
            
            });
        return ret;
        
    }

    // Renders each suggestion item.
    renderSuggestion(prop: PropertyData, el: HTMLElement) {
        el.createEl("div", { text: prop.name });
        const details = el.createEl("div" , {cls: "metadata-property-key"});
        const icon = details.createEl("div", {cls: "metadata-property-icon"})
        setIcon(icon, prop.typeIcon || "help-circle");
        //metadata-property-key-input
        // details.createEl("small", { text: `${prop.typeName}` });
        details.createEl("div", { text: `${prop.typeName || "unknown"}`, 
        cls: "metadata-property-icon" 
    });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(prop: PropertyData, evt: MouseEvent | KeyboardEvent) {
        // console.log(`chosen `, prop);
        this._onSelect && this._onSelect(prop);
    }
}

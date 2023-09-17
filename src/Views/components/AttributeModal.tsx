import { App, SuggestModal, setIcon } from "obsidian";
import { getPropertyData } from "src/Data/PropertyData";
import type { PropertyData } from "src/Data/PropertyData";


export class AttributeModal extends SuggestModal<PropertyData> {
    // private _types: any;
    private _onSelect: (PropertyData: any) => void;
    private _filter?: (PropertyData: any) => boolean;
    // private _app: App;
    constructor(app: App, onSelect:(PropertyData)=>void, filter?: (PropertyData)=>boolean) {
        super(app);
        // this._types = indexBy<any>("type",Object.values(app.metadataTypeManager.registeredTypeWidgets));
        // this._types = app.metadataTypeManager.registeredTypeWidgets;
        this._onSelect = onSelect;
        this._filter = filter;
    }
    // Returns all available suggestions.
    getSuggestions(query: string): PropertyData[] {
        query = query.toLowerCase();
        
        // let propInfo: PropertyInfo[] = Object.values(this.app.metadataTypeManager.properties)
        //     .filter(property => property.name && property.name.length && property.name.toLowerCase().includes(query))
        //     ;
        // propInfo = sortBy("name", propInfo);
        // const ret = propInfo.map(pi => {
        //     //this._types.find(rtw => rtw.type === pi.type);
        //     const type = this._types[pi.type];
        //         return ({
        //             name: pi.name,
        //             count: pi.count,
        //             typeName: type?.name(),
        //             typeKey: type?.type,
        //             typeIcon: type?.icon
        //         })
            
        //     });
        const pds = getPropertyData(this.app);
        return pds.filter(pd => 
            pd.name && pd.name.length && 
            pd.name.toLowerCase().includes(query))
            .filter(pd => !this._filter || this._filter(pd))
            ;
        
    }

    // Renders each suggestion item.
    renderSuggestion(prop: PropertyData, el: HTMLElement) {
        el.createEl("div", { text: prop.name });
        const details = el.createEl("div" , {cls: "metadata-property-key"});
        const icon = details.createEl("div", {cls: "metadata-property-icon"})
        setIcon(icon, prop.typeIcon || "file-question");
        //metadata-property-key-input
        // details.createEl("small", { text: `${prop.typeName}` });
        details.createEl("div", { text: `${prop.typeName || "unknown"}`, 
        cls: "metadata-property-icon" 
    });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(prop: PropertyData, evt: MouseEvent | KeyboardEvent) {
        this._onSelect && this._onSelect(prop);
    }
}

import { App, SuggestModal, setIcon } from "obsidian";
import { getPropertyData } from "src/Data/PropertyData";
import type { PropertyData } from "src/Data/PropertyData";


export class AttributeModal extends SuggestModal<PropertyData> {
    private _onSelect: (PropertyData: any) => void;
    private _filter?: (PropertyData: any) => boolean;
    constructor(app: App, onSelect:(PropertyData)=>void, filter?: (PropertyData)=>boolean) {
        super(app);
        this._onSelect = onSelect;
        this._filter = filter;
    }
    // Returns all available suggestions.
    getSuggestions(query: string): PropertyData[] {
        query = query.toLowerCase();
        
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
        details.createEl("div", { text: `${prop.typeName || "unknown"}`, 
        cls: "metadata-property-icon" 
    });
    }

    // Perform action on the selected suggestion.
    onChooseSuggestion(prop: PropertyData, evt: MouseEvent | KeyboardEvent) {
        this._onSelect && this._onSelect(prop);
    }
}

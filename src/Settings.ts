import { SetDefinition } from "./Views/components/SetDefinition";

export interface WidgetDefinition {
    collapsed: boolean;
    title: string;
    definition: SetDefinition;
}

// this represents the sidebarState in the settings
export interface SidebarState {
    typesCollapsed: boolean;
    collectionsCollapsed: boolean;
    widgets: WidgetDefinition[];
}

export interface SetsSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    setsRoot: string;
    typesFolder: string;
    typesSuffix: string;
    typeSetSuffix: string;
    typeAttributeKey: string;
    collectionsRoot: string;
    collectionAttributeKey: string;
    collectionType: string;
    inferCollectionFieldsByDefault: boolean;
    inferSetFieldsByDefault: boolean;
    inferQueryFieldsByDefault: boolean;
    createObjectsInSetsFolder: boolean;
    topResults: number;
    topResultsWidget: number;
    registerCustomTypes: boolean;
    sidebarState: SidebarState
} 

export const DEFAULT_SETTINGS: SetsSettings = {
    addRibbonIcon: true,
    showAtStartup: false,
    setsRoot: "Sets",
    typeSetSuffix: "Set",
    typesFolder: "Types",
    typesSuffix: "Type",
    typeAttributeKey: "type",
    collectionsRoot: "Collections",
    collectionAttributeKey: "collection",
    collectionType: "collection",
    inferCollectionFieldsByDefault: true,
    inferSetFieldsByDefault: false,
    inferQueryFieldsByDefault: false,
    createObjectsInSetsFolder: false,
    topResults: 200, 
    topResultsWidget: 10,
    registerCustomTypes: true,
    sidebarState: {
        typesCollapsed: false,
        collectionsCollapsed: false,
        widgets: []
    }
}

export const CODEBLOCK_NAME = "set";

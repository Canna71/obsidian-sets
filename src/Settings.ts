
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
    registerCustomTypes: boolean;
    sidebarState: {
        typesCollapsed: boolean;
        collectionsCollapsed: boolean;
    }
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
    registerCustomTypes: true,
    sidebarState: {
        typesCollapsed: false,
        collectionsCollapsed: false,
    }
}

export const CODEBLOCK_NAME = "set";

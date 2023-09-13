
export interface SetsSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    setsRoot: string;
    typesFolder: string;
    typeSetSuffix: string;
    typeAttributeKey: string;
    collectionsRoot: string;
    collectionAttributeKey: string;
    collectionType: string;
    inferCollectionFieldsByDefault: boolean;
    inferSetFieldsByDefault: boolean;
    inferQueryFieldsByDefault: boolean;
    createObjectsInSetsFolder: boolean;
} 

export const DEFAULT_SETTINGS: SetsSettings = {
    addRibbonIcon: true,
    showAtStartup: false,
    setsRoot: "Sets",
    typeSetSuffix: "Set",
    typesFolder: "Types",
    typeAttributeKey: "type",
    collectionsRoot: "Collections",
    collectionAttributeKey: "collection",
    collectionType: "collection",
    inferCollectionFieldsByDefault: true,
    inferSetFieldsByDefault: false,
    inferQueryFieldsByDefault: false,
    createObjectsInSetsFolder: false
}

export const CODEBLOCK_NAME = "set";


export interface SetsSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    setsRoot: string;
    typesFolder: string;
    typeAttributeKey: string;
    collectionsRoot: string;
    collectionAttributeKey: string;
    collectionType: string;
    inferCollectionFieldsByDefault: boolean;
    inferSetFieldsByDefault: boolean;
    inferQueryFieldsByDefault: boolean;
} 

export const DEFAULT_SETTINGS: SetsSettings = {
    addRibbonIcon: true,
    showAtStartup: false,
    setsRoot: "Sets",
    typesFolder: "Sets/Types",
    typeAttributeKey: "type",
    collectionsRoot: "Sets/Collections",
    collectionAttributeKey: "collection",
    collectionType: "collection",
    inferCollectionFieldsByDefault: true,
    inferSetFieldsByDefault: false,
    inferQueryFieldsByDefault: false
}


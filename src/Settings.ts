
export interface SetsSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    setsRoot: string;
    typesFolder: string;
    typeAttributeKey: string;
    collectionsRoot: string;
    collectionAttributeKey: string;
    collectionType: string;
    inferFieldsByDefault: boolean;
}   

export const DEFAULT_SETTINGS: SetsSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    setsRoot: "Sets",
    typesFolder: "Sets/Types",
    typeAttributeKey: "type",
    collectionsRoot: "Collections",
    collectionAttributeKey: "collection",
    collectionType: "collection",
    inferFieldsByDefault: false
}


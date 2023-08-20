
export interface SetsSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    setsRoot: string;
    typesFolder: string;
    typeAttributeKey: string;
}   

export const DEFAULT_SETTINGS: SetsSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    setsRoot: "Sets",
    typesFolder: "Sets/Types",
    typeAttributeKey: "type"
}


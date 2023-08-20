
export interface SetsSettings {
    addRibbonIcon: boolean;
    showAtStartup: boolean;
    setsRoot: string;
    typesFolder: string;
}   

export const DEFAULT_SETTINGS: SetsSettings = {
    addRibbonIcon: true,
    showAtStartup: true,
    setsRoot: "Sets",
    typesFolder: "Sets/Types"
}


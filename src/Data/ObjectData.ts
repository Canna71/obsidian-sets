import { FrontMatterCache, TFile } from "obsidian";
import { VaultDB } from "./VaultDB";


export type ObjectData = {
    name: string;
    file: TFile;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frontmatter?: FrontMatterCache;
    db: VaultDB
};

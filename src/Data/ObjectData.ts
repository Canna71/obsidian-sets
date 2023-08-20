import { TFile } from "obsidian";
import { VaultDB } from "./VaultDB";


export type ObjectData = {
    name: string;
    file: TFile;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frontmatter: Record<string, any> | undefined;
    db: VaultDB
};

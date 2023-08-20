import { TFile } from "obsidian";


export type ObjectData = {
    name: string;
    file: TFile;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    frontmatter: Record<string, any>;
};

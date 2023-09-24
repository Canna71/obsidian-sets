
// export interface BlockContext {
//     state: SetDefinition,
//     update: (def:SetDefinition) => void;
// }

import { OperatorName } from "src/Data/Operator";

export const ScopeTypes = ["type", "collection", "folder", "vault"]
export type ScopeType = typeof ScopeTypes[number];
// export type ScopeType = "type" | "collection" | "folder" | "vault";

// export type Scope = {"type": string} | {"collection": string} | {"folder": string | undefined} | {"vault": undefined};

export type Scope = [ScopeType, string?];
// export const VaultScope = {"vault": undefined} as Scope;
export const VaultScope: Scope = ["vault"];

export type FieldDefinition = string;


export enum IntrinsicAttributeKey {
    FileName = "__bname",
    FileCreationDate = "__ctime",
    FileModificationDate = "__mtime",
    FilePath = "__path",
}

export function isIntrinsicAttribute(key: IntrinsicAttributeKey | string): key is IntrinsicAttributeKey {
    return (Object.values(IntrinsicAttributeKey).includes(key as IntrinsicAttributeKey) );
}

export type ExtrinsicAttributeKey = string;

export type AttributeKey = IntrinsicAttributeKey | ExtrinsicAttributeKey;

export type Clause = [AttributeKey, OperatorName, any];

export type SortField = [AttributeKey, boolean]; // false = ascending, true = descendig

export const ViewModes = ["grid", "list", "board", "gallery"]
// type viewmode have all elements of ViewModes
export type ViewMode = typeof ViewModes[number];


// export type ViewMode = 

export interface SetDefinition {
    scope?: Scope;
    // type?: string;
    // collection?: string;
    filter?: Clause[];
    fields?: FieldDefinition[];
    sortby?: SortField[];
    topResults?: number;
    transientState?: any;
    grid?: {
        columnWidths?: Record<string, string>;
    };
    board?: {
        groupField?: FieldDefinition;
        lanes?: string[];
    };
    gallery?: {
        numColumns?: number;
        minWidth?: number;
        transclude?: string[];
    }
    timestamp?: number;
    viewMode?: ViewMode;
}

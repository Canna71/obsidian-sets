
// export interface BlockContext {
//     state: SetDefinition,
//     update: (def:SetDefinition) => void;
// }

import { OperatorName } from "src/Data/Operator";

export type ScopeType = "type" | "collection" | "folder" | "vault";

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

export type ViewMode = "grid" | "list";

export interface SetDefinition {
    scope?: Scope;
    // type?: string;
    // collection?: string;
    filter?: Clause[];
    fields?: FieldDefinition[];
    sortby?: SortField[];
    transientState?: any;
    grid?: {
        columnWidths?: Record<string, string>;
    };
    timestamp?: number;
    viewMode?: ViewMode;
}

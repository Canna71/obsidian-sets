import {  TFile } from "obsidian";
import moment from "moment";
import { ObjectData } from "./ObjectData";

export type FileAttribute = {
    tag: "file",
    attribute: "Name" | "CreationDate" | "ModifyDate" | "Path",
    displayName?: string
}

function getFileAttribute(file: TFile, attr: FileAttribute) {
    switch(attr.attribute){
        case "CreationDate":
            return moment(file.stat.ctime);
        case "ModifyDate":
            return moment(file.stat.mtime);
        case "Name":
            return file.name;
        case "Path":
            return file.path;
    }
}

function getMetadataAttribute(metadata: unknown, attr: MetadataAttribute):unknown {
    if(!metadata) return undefined;
    return (metadata as Record<string,unknown>)[attr.attribute];
}

export function getAttribute(objectData: ObjectData, attribute: Attribute) {
    if(attribute.tag === "file")
        return getFileAttribute(objectData.file, attribute);
    else 
        return getMetadataAttribute(objectData.frontmatter, attribute);
}

export type MetadataAttribute = {
    tag: "metadata",
    attribute: string,
    displayName?: string
};

export type OperatorName = "eq";

export type Operator = {
    op: OperatorName;
    compatibleTypes: string[] | string;
    matches:(a:unknown, b:unknown) => boolean;
}

const operators : Record<OperatorName,Operator> = {
    "eq": {
        op: "eq",
        compatibleTypes: "*",
        matches: (a:unknown, b:unknown) => a == b
    }
}

export type Attribute = FileAttribute | MetadataAttribute;

export type Clause = {
    attribute: Attribute,
    operator: OperatorName,
    value: unknown
}
// export type Query = Clause[];

export class Query {

    private _clauses: Clause[];

    private constructor(clauses: Clause[]) {
        this._clauses = clauses;
    }

    static fromClauses(clauses: Clause[]){
        return new Query(clauses);
    }

    matches(data: ObjectData) {
        if(!data) return false;
        
        const res = this._clauses.every(clause => {
            const attr = getAttribute(data, clause.attribute);
            const op = operators[clause.operator];
            const val = clause.value;
            return op.matches(attr,val);
        });
     
        return res;
    }
}



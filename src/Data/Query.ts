import {  TFile } from "obsidian";
import moment from "moment";
import { ObjectData } from "./ObjectData";
import { getSetsSettings } from "../main";
import { SetsSettings } from "../Settings";

export interface FileAttributeClause  {
    tag: "file",
    key: "Name" | "CreationDate" | "ModifyDate" | "Path",
}

export interface FileAttributeDefinition extends FileAttributeClause {
    
    displayName: string
}

function getFileAttribute(file: TFile, attr: FileAttributeClause) {
    switch(attr.key){
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

function getMetadataAttribute(metadata: unknown, attr: MetadataAttributeClause):unknown {
    if(!metadata) return undefined;
    return (metadata as Record<string,unknown>)[attr.key];
}

export function getAttribute(objectData: ObjectData, attribute: AttributeClause) {
    if(attribute.tag === "file")
        return getFileAttribute(objectData.file, attribute);
    else 
        return getMetadataAttribute(objectData.frontmatter, attribute);
}

export interface MetadataAttributeClause {
    tag: "md",
    key: string,
}

export interface MetadataAttributeDefinition extends MetadataAttributeClause {
    
    displayName: string
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

export type AttributeClause = FileAttributeClause | MetadataAttributeClause;
export type AttributeDefinition = FileAttributeDefinition | MetadataAttributeDefinition;


export type Clause = {
    at: AttributeClause,
    op: OperatorName,
    val: any
}
// export type Query = Clause[];

export class Query {

    private _clauses: Clause[];
    private _settings: SetsSettings;

    private constructor(clauses: Clause[]) {
        this._clauses = clauses;
        this._settings = getSetsSettings();
    }

    static fromClauses(clauses: Clause[]){
        return new Query(clauses);
    }

    matches(data: ObjectData) {
        if(!data) return false;
        
        const res = this._clauses.every(clause => {
            const attr = getAttribute(data, clause.at);
            const op = operators[clause.op];
            const val = clause.val;
            return op.matches(attr,val);
        });
     
        return res;
    }

    inferSetType(): string | undefined {
        const c = this._clauses.filter(clause =>clause.at.key === this._settings.typeAttributeKey);
        if(c.length === 0) return undefined;
        const s = c.filter(clause => clause.op === "eq");
        if(s.length === 0) return undefined;

        return s[0].val as string;
    }
}



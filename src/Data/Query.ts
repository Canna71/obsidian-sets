
import { ObjectData } from "./ObjectData";
import { getSetsSettings } from "../main";
import { SetsSettings } from "../Settings";

export enum IntrinsicAttributeKey {
    FileName = "__bname",
    FileCreationDate = "__ctime" ,
    FileModificationDate = "__mtime",
    FilePath = "__path",
  }


export type ExtrinsicAttribute = string;


export type OperatorName = "eq";

export type Operator = {
    op: OperatorName;
    compatibleTypes: string[] | string;
    isConstraint: boolean;
    matches:(a:unknown, b:unknown) => boolean;
}

const operators : Record<OperatorName,Operator> = {
    "eq": {
        op: "eq",
        compatibleTypes: "*",
        isConstraint: true,
        matches: (a:unknown, b:unknown) => a == b
    }
}

export const getOperatorById = (op: OperatorName) => {
    return operators[op];
}


export type AttributeClause = IntrinsicAttributeKey | ExtrinsicAttribute;

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

    static fromClauses(clauses: Clause[]|Clause){
        if(Array.isArray(clauses))
            return new Query(clauses);
        else
            return new Query([clauses]);
    }

    matches(data: ObjectData) {
        if(!data) return false;
        
        const res = this._clauses.every(clause => {
            // const attr = getAttribute(data, clause.at);
            const attr = data.db.getAttributeDefinition(clause.at).getValue(data);
            const op = operators[clause.op];
            const val = clause.val;
            return op.matches(attr,val);
        });
     
        return res;
    }

    inferSetType(): string | undefined {
        const typeClauses = this.getTypeClauses();
        if(typeClauses.length>0)
            return typeClauses[0].val as string;
    }

    getTypeClauses(): Clause[]  {
        const clauses =  this._clauses.filter(clause =>
            (clause.at === this._settings.typeAttributeKey) 
            && (clause.op === "eq") );
        return clauses;
    }

    get clauses() {
        return this._clauses;
    }
}



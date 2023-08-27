import { ObjectData } from "./ObjectData";
import { getSetsSettings } from "../main";
import { SetsSettings } from "../Settings";
import { OperatorName, getOperatorById } from "./Operator";
import { AttributeDefinition } from "./AttributeDefinition";
import { VaultDB } from "./VaultDB";

export enum IntrinsicAttributeKey {
    FileName = "__bname",
    FileCreationDate = "__ctime",
    FileModificationDate = "__mtime",
    FilePath = "__path",
}

export function isIntrinsicAttribute(key: IntrinsicAttributeKey | string): key is IntrinsicAttributeKey {
    return (Object.values(IntrinsicAttributeKey).includes(key as IntrinsicAttributeKey) );
}

export type ExtrinsicAttribute = string;

export type AttributeClause = IntrinsicAttributeKey | ExtrinsicAttribute;

export type Clause = [AttributeClause, OperatorName, any];

export type SortField = [AttributeClause, boolean];

// export type Clause = {
//     at: AttributeClause,
//     op: OperatorName,
//     val: any
// }
// export type Query = Clause[];

export class Query {
    private _clauses: Clause[];
    private _settings: SetsSettings;
    private _hasExtrinsic: boolean;
    private _attributes: AttributeDefinition[];
    private _db: VaultDB;
    private _canCreate: boolean;
    private _context?: ObjectData;
    private _sortBy: SortField[];

    private constructor(db: VaultDB, clauses: Clause[], context?: ObjectData, context?: ObjectData) {
        this._db = db;
        const operators = clauses.map(clause => getOperatorById(clause[1]))
        this._clauses = clauses.sort((a,b)=>{
            const aSelectiveness = getOperatorById(a[1]).selectiveness;
            const bSelectiveness = getOperatorById(b[1]).selectiveness;
            return aSelectiveness - bSelectiveness

        });
        this._settings = getSetsSettings();
        const attributes = clauses.map(([key]) => key);
        this._hasExtrinsic = attributes.some(key => !isIntrinsicAttribute(key));
        this._attributes = attributes.map(key => this._db.getAttributeDefinition(key));
        this._canCreate = operators.every(op => {
            return op.enforce !== undefined;
        })
        this._context = context;
        this._sortBy = sort;
    }

    static __fromClauses(db: VaultDB, clauses: Clause[] | Clause, context?: ObjectData, sort: SortField[]) {
        if (Array.isArray(clauses) && Array.isArray(clauses[0]))
            return new Query(db,clauses, context, sort);
        else return new Query(db, [clauses as Clause], context, sort);
    }

    matches(data: ObjectData) {
        if (!data) return false;

        // this to exclude files with no frontmatter 
        // in the common case of querying for metadata
        if(this._hasExtrinsic && !data.frontmatter) return false;

        const res = this._clauses.every((clause) => {
            // const attr = getAttribute(data, clause.at);
            const [at, op, val] = clause;
            const attr = this._db.getAttributeDefinition(at);
            const operator = getOperatorById(op);
            // const val = clause.val; 
            return operator.matches(attr, data, val, this._context);
        });

        return res;
    }

    inferSetType(): string | undefined {
        const typeClauses = this.getTypeClauses();
        if (typeClauses.length > 0) return typeClauses[0][2] as string;
    }

    getTypeClauses(): Clause[] {
        const clauses = this._clauses.filter(
            ([at, op, _]) =>
                at === this._settings.typeAttributeKey && op === "eq"
        );
        return clauses;
    }

    get clauses() {
        return this._clauses;
    }

    get canCreate() {
        return this._canCreate;
    }

    get context() {
        return this._context;
    }
}

import { ObjectData } from "./ObjectData";
import { getSetsSettings } from "../main";
import { SetsSettings } from "../Settings";
import { OperatorName, getOperatorById } from "./Operator";
import { AttributeDefinition } from "./AttributeDefinition";
import { VaultDB } from "./VaultDB";
import { LinkToThis, getDynamicValue, isDynamic } from "./DynamicValues";
import { TFolder } from "obsidian";
import { AttributeKey, Clause, Scope, ScopeType, SortField, isIntrinsicAttribute } from "src/Views/components/SetDefinition";

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
    private _scope: ScopeType;
    private _scopeSpecifier: string | undefined;
    private _scopeFolder: TFolder | undefined;
    // private _newFile: string | undefined;
    
    protected constructor(db: VaultDB,scope: Scope,  clauses: Clause[], sort: SortField[], context?: ObjectData) {
        this._db = db;
        this._scope = scope[0];
        this._scopeSpecifier = scope[1];
        this._clauses = clauses;
        this._settings = getSetsSettings();
        switch(this._scope){
            case "type":
                this._clauses.push([this._settings.typeAttributeKey,"eq",this._scopeSpecifier]);
            break;
            case "collection":
                this._clauses.push([this._settings.collectionAttributeKey,"hasall",[this._scopeSpecifier]]);
            break
            case "folder":
                if(this._scopeSpecifier){
                    this._scopeFolder = this._db.getFolder(this._scopeSpecifier)
                } else {
                    this._scopeFolder = context?.file.parent || undefined;
                }
            break;
        }
        
        const operators = clauses.map(clause => getOperatorById(clause[1]))
        this._clauses = this._clauses.sort((a,b)=>{
            const aSelectiveness = getOperatorById(a[1]).selectiveness;
            const bSelectiveness = getOperatorById(b[1]).selectiveness;
            return aSelectiveness - bSelectiveness

        });
        const attributes = clauses.map(([key]) => key);
        this._hasExtrinsic = attributes.some(key => !isIntrinsicAttribute(key));
        this._attributes = attributes.map(key => this._db.getAttributeDefinition(key));
        this._canCreate = operators.every(op => {
            return op.enforce !== undefined;
        })
        this._canCreate = this._canCreate && this._scope !== "collection";
        this._context = context;
        this._sortBy = sort.slice().reverse();
    }

    static __fromClauses(db: VaultDB,scope:Scope, clauses: Clause[] | Clause, sort: SortField[], context?: ObjectData) {
        // copy clauses to avoid mutating the original array
        clauses = clauses.slice();

        if(Array.isArray(clauses)){
            if(clauses.length > 0){
                if(Array.isArray(clauses[0])){
                    return new Query(db,scope, clauses as Clause[], sort, context);
                } else {
                    return new Query(db,scope, [clauses as Clause], sort, context);
                }
            } else {
                return new Query(db,scope, [], sort, context);
            }
        } else {
            throw new Error("Query.__fromClauses: clauses must be an array of clauses")
        }
        
        // if (Array.isArray(clauses) && clauses.length && Array.isArray(clauses[0]))
        //     return new Query(db,clauses, sort, context);
        // else return new Query(db, [clauses as Clause], sort, context);
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
            let value = val;
            // const val = clause.val; 
            if(isDynamic(val)) value = getDynamicValue(val,attr,data.db,this._context);
            return operator.matches(attr, data, value, this._context);
        });

        return res;
    }

    inferSetType(): string | undefined {
        const typeClauses = this.getClausesByAttr(this._settings.typeAttributeKey);
        if (typeClauses.length > 0) return typeClauses[0][2] as string;
    }

    inferCollection(): string | undefined {
        const collClauses = this.getClausesByAttr(this._settings.collectionAttributeKey)
        .filter(c => c[1]==="hasall" || c[1] === "hasany")
        .filter(c => c[2] === LinkToThis)
        ;

        if (collClauses.length > 0 && this._context) {
            const link = this._db.generateWikiLink(this._context.file)
            return link;
        }
        
    }

    getClausesByAttr(key: AttributeKey, op: OperatorName="eq"): Clause[] {
        const clauses = this._clauses.filter(
            ([at, clop, _]) =>
                at === key && clop === op
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

    get sortby() {
        return this._sortBy;
    }

    get scopeFolder() {
        return this._scopeFolder;
    }
    

    // get newFile():string | undefined {
    //     return this._newFile;
    // }

    // set newFile(newFile: string | undefined) {
    //     this._newFile = newFile;
    // }

}



import { getSetsSettings } from "src/main";
import { Clause, Query, SortField } from "./Query";
import { ObjectData } from "./ObjectData";
import { VaultDB } from "./VaultDB";

export class Set extends Query {
    constructor(type: string, db: VaultDB, clauses: Clause[], sort: SortField[], context?: ObjectData){
        clauses = [[getSetsSettings().typeAttributeKey,"eq",type], ...clauses]
        super(db,clauses,sort,context);
    }
}

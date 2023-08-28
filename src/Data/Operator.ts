import { AttributeDefinition } from "./AttributeDefinition";
import { ObjectData } from "./ObjectData";


export type OperatorName = "eq" | "neq" | "isnull" | "notnull" | 
    "hasall" | "hasthis" |
    "gt" | "gte" | "lt" | "lte";

export type Operator = {
    op: OperatorName;
    compatibleTypes: string[] | string;
    matches: (a: AttributeDefinition, data:ObjectData, val:unknown, context?: ObjectData) => boolean;
    enforce?: (current: unknown, val: unknown, context?: ObjectData) => unknown;
    selectiveness: number;
};



export const getOperatorById = (op: OperatorName) => {
    return operators[op];
}



const operators : Record<OperatorName,Operator> = {
    "eq": {
        op: "eq",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) == val,
        enforce: (current: unknown, val: unknown) => val,
        selectiveness: 0
    },
    "neq": {
        op: "neq",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) != val,
        // enforce: (a:unknown, b:unknown) => b
        selectiveness: Number.MAX_VALUE
    },
    "isnull": {
        op: "isnull",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) === null,
        enforce: (current: unknown, val: unknown) => null,
        selectiveness: 10
    },
    "notnull": {
        op: "notnull",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) !== null,
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 10
    },
    
    "hasall": {
        op: "hasall",
        compatibleTypes: "list",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
            const list = a.getValue(data);
            if(!list) return false;
            if(!Array.isArray(list)) return false;
            if (val === undefined) val = []
            if (!Array.isArray(val)) val=[val];
            
            return (val as any[]).every(el => (list as any[]).includes(el))
        },
        enforce: (current:unknown, val:unknown) => {
            const ret = (!current || !Array.isArray(current)) ? [] : current.slice();
            const items = Array.isArray(val) ? val : [val];
            
            items.forEach(item => !ret.includes(item) && ret.push(item));
            return ret;
        },
        selectiveness: 5
    },
    "hasthis": {
        op: "hasthis",
        compatibleTypes: "list",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown, context: ObjectData) => {
            const list = a.getValue(data);
            if(!list) return false;
            if(!Array.isArray(list)) return false;

            
            
            const thisLink = data.db.generateLink(context.file);
            return list.includes(thisLink);
            // return (val as any[]).every(el => (list as any[]).includes(el))
        },
        enforce: (current:unknown, val:unknown, context: ObjectData) => {
            const ret = (!current || !Array.isArray(current)) ? [] : current.slice();
            const thisLink = app.fileManager.generateMarkdownLink(context.file,"/")
            
            if(!ret.includes(thisLink)) ret.push(thisLink);
            return ret;
        },
        selectiveness: 5
    },
    "gt": {
        op: "gt",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) > (val as any),
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5
    },
    "gte": {
        op: "gte",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) >= (val as any),
        enforce: (current:unknown, b:unknown) => b,
        selectiveness: 5
    },
    "lt": {
        op: "lt",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) < (val as any),
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5
    },
    "lte": {
        op: "lte",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) <= (val as any),
        enforce: (current:unknown, b:unknown) => b,
        selectiveness: 5
    },
}

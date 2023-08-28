import { AttributeDefinition } from "./AttributeDefinition";
import { ObjectData } from "./ObjectData";


export type OperatorName = 
    "eq" | "neq" | "isempty" | "notempty" | 
    "contains" | "nocontains" |
    "hasall" | "hasthis" | "hasany" | "hasnone" |
    "gt" | "gte" | "lt" | "lte" |
    "checked" | "unchecked"
    ;

export type Operator = {
    op: OperatorName;
    displayName: () => string;
    compatibleTypes: string[] | string;
    matches: (a: AttributeDefinition, data:ObjectData, val:unknown, context?: ObjectData) => boolean;
    enforce?: (current: unknown, val: unknown, context?: ObjectData) => unknown;
    selectiveness: number;
    isUnary: boolean;
};



export const getOperatorById = (op: OperatorName) => {
    return operators[op];
}

const prepareLists = (a:AttributeDefinition, data:ObjectData, val:unknown) => {
    const list = a.getValue(data);
    if(!list) return false;
    if(!Array.isArray(list)) return false;
    if (val === undefined) val = []
    if (!Array.isArray(val)) val=[val];
    return {list:list as any[], value: val as any[]}           
}

const operators : Record<OperatorName,Operator> = {
    "eq": { 
        op: "eq",
        compatibleTypes: ["text","number","date","datetime","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) == val,
        enforce: (current: unknown, val: unknown) => val,
        selectiveness: 0,
        displayName: () => "Equal",
        isUnary: false
    },
    "neq": {
        op: "neq",
        compatibleTypes: ["text","number","date","datetime","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) != val,
        // enforce: (a:unknown, b:unknown) => b
        selectiveness: Number.MAX_VALUE,
        displayName: () => "Not Equal",
        isUnary: false

    },
    "isempty": {
        op: "isempty",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
            const value = a.getValue(data);
            if(Array.isArray(value)){
                return value.length === 0
            }
            return value === null || value === undefined || value === ""
        } ,
        enforce: (current: unknown, val: unknown) => null,
        selectiveness: 10,
        displayName: () => "Is Empty",
        isUnary: true

    },
    "notempty": {
        op: "notempty",
        compatibleTypes: "*",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
            const value = a.getValue(data);
            if(Array.isArray(value)){
                return value.length > 0
            }
            return value !== null && value !== undefined && value !== ""
        } ,
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 10,
        displayName: () => "Is Not Empty",
        isUnary: true

    },
    
    "hasall": {
        op: "hasall",
        compatibleTypes: "list",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
                
            const res = prepareLists(a,data,val);
            if(!res) return res;
            const {list, value} = res;
            return value.every(el => (list as any[]).includes(el))
        },
        enforce: (current:unknown, val:unknown) => {
            const ret = (!current || !Array.isArray(current)) ? [] : current.slice();
            const items = Array.isArray(val) ? val : [val];
            
            items.forEach(item => !ret.includes(item) && ret.push(item));
            return ret;
        },
        selectiveness: 5,
        displayName: () => "Has All",
        isUnary: false

    },
    "hasany": {
        op: "hasany",
        compatibleTypes: "list",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
            const res = prepareLists(a,data,val);
            if(!res) return res;
            const {list, value} = res;
            return value.some(el => (list as any[]).includes(el))
        },
        
        selectiveness: 5,
        displayName: () => "Has Any",
        isUnary: false

    },
    "hasnone": {
        op: "hasnone",
        compatibleTypes: "list",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
                
            const res = prepareLists(a,data,val);
            if(!res) return res;
            const {list, value} = res;
            return value.every(el => !(list as any[]).includes(el))
        },
        enforce: (current:unknown, val:unknown) => {
            
            return [];
        },
        selectiveness: 5,
        displayName: () => "Has None",
        isUnary: false

    },
    "hasthis": {
        op: "hasthis",
        compatibleTypes: "list",
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown, context: ObjectData) => {
            const list = a.getValue(data);
            if(!list) return false;
            if(!Array.isArray(list)) return false;

            
            const thisLink = data.db.generateWikiLink(context.file);
            return list.includes(thisLink);
            // return (val as any[]).every(el => (list as any[]).includes(el))
        },
        enforce: (current:unknown, val:unknown, context: ObjectData) => {
            const ret = (!current || !Array.isArray(current)) ? [] : current.slice();
            // const thisLink = app.fileManager.generateMarkdownLink(context.file,"/")
            const thisLink = context.db.generateWikiLink(context.file);
            if(!ret.includes(thisLink)) ret.push(thisLink);
            return ret;
        },
        selectiveness: 5,
        displayName: () => "Has This",
        isUnary: true
    },
    "gt": {
        op: "gt",
        compatibleTypes: ["text","number","date","datetime","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) > (val as any),
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5,
        displayName: () => "Greater Than",
        isUnary: false

    },
    "gte": {
        op: "gte",
        compatibleTypes: ["text","number","date","datetime","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) >= (val as any),
        enforce: (current:unknown, b:unknown) => b,
        selectiveness: 5,
        displayName: () => "Greater Than Or Equal",
        isUnary: false

    },
    "lt": {
        op: "lt",
        compatibleTypes: ["text","number","date","datetime","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) < (val as any),
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5,
        displayName: () => "Less Than",
        isUnary: false

    },
    "lte": {
        op: "lte",
        compatibleTypes: ["text","number","date","datetime","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) <= (val as any),
        enforce: (current:unknown, b:unknown) => b,
        selectiveness: 5,
        displayName: () => "Less Than Or Equal",
        isUnary: false

    },
    "contains": {
        op: "contains",
        compatibleTypes: ["text","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data).toString().toLowerCase().includes((val as any).toString().toLowerCase()),
        // enforce: (current:unknown, b:unknown) => b,
        selectiveness: 2,
        displayName: () => "Contains",
        isUnary: false

    },
    "nocontains": {
        op: "nocontains",
        compatibleTypes: ["text","password"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => !a.getValue(data).toString().toLowerCase().includes((val as any).toString().toLowerCase()),
        // enforce: (current:unknown, b:unknown) => b,
        selectiveness: 12,
        displayName: () => "Does Not Contain",
        isUnary: false

    },
    "checked": {
        op: "checked",
        compatibleTypes: ["checkbox"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => a.getValue(data) == true,
        // enforce: (current:unknown, b:unknown) => b,
        selectiveness: 10,
        displayName: () => "Checked",
        isUnary: true
    },
    "unchecked": {
        op: "unchecked",
        compatibleTypes: ["checkbox"],
        matches: (a:AttributeDefinition, data:ObjectData, val:unknown) => {
            const value = a.getValue(data);
            return value == false || value === null || value === undefined;
        },
        // enforce: (current:unknown, b:unknown) => b,
        selectiveness: 10,
        displayName: () => "Unchecked",
        isUnary: true
    },
}

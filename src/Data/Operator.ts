

export type OperatorName = "eq" | "neq" | "isnull" | "notnull" | "hasall" | 
    "gt" | "gte" | "lt" | "lte";

export type Operator = {
    op: OperatorName;
    compatibleTypes: string[] | string;
    matches: (a: unknown, b: unknown) => boolean;
    enforce?: (a: unknown, b: unknown) => unknown;
    selectiveness: number;
};



export const getOperatorById = (op: OperatorName) => {
    return operators[op];
}



const operators : Record<OperatorName,Operator> = {
    "eq": {
        op: "eq",
        compatibleTypes: "*",
        matches: (a:unknown, b:unknown) => a == b,
        enforce: (a:unknown, b:unknown) => b,
        selectiveness: 0
    },
    "neq": {
        op: "neq",
        compatibleTypes: "*",
        matches: (a:unknown, b:unknown) => a != b,
        // enforce: (a:unknown, b:unknown) => b
        selectiveness: Number.MAX_VALUE
    },
    "isnull": {
        op: "isnull",
        compatibleTypes: "*",
        matches: (a:unknown, b:unknown) => a === null,
        enforce: (a:unknown, b:unknown) => null,
        selectiveness: 10
    },
    "notnull": {
        op: "notnull",
        compatibleTypes: "*",
        matches: (a:unknown, b:unknown) => a !== null,
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 10
    },
    
    "hasall": {
        op: "hasall",
        compatibleTypes: "list",
        matches: (list:unknown, item:unknown) => {
            if (list === undefined) list = []
            if (item === undefined) item = []
            
            return (Array.isArray(item)?item as any[]:[item] ).every(el => (list as any[]).includes(el))
        },
        enforce: (list:unknown, item:unknown) => {
            const items = Array.isArray(item) ? item : [item];
            const ret = items.slice();
            items.forEach(i => !ret.includes(i) && ret.push(i));
            return ret;
        },
        selectiveness: 5
    },
    "gt": {
        op: "gt",
        compatibleTypes: "*",
        matches: (a:any, b:any) => a > b,
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5
    },
    "gte": {
        op: "gte",
        compatibleTypes: "*",
        matches: (a:any, b:any) => a >= b,
        enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5
    },
    "lt": {
        op: "lt",
        compatibleTypes: "*",
        matches: (a:any, b:any) => a < b,
        // enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5
    },
    "lte": {
        op: "lte",
        compatibleTypes: "*",
        matches: (a:any, b:any) => a <= b,
        enforce: (a:unknown, b:unknown) => b,
        selectiveness: 5
    },
}

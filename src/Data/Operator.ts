

export type OperatorName = "eq" | "hasall";

export type Operator = {
    op: OperatorName;
    compatibleTypes: string[] | string;
    isConstraint: boolean;
    matches: (a: unknown, b: unknown) => boolean;
    enforce: (a: unknown, b: unknown) => unknown;
};



export const getOperatorById = (op: OperatorName) => {
    return operators[op];
}



const operators : Record<OperatorName,Operator> = {
    "eq": {
        op: "eq",
        compatibleTypes: "*",
        isConstraint: true,
        matches: (a:unknown, b:unknown) => a == b,
        enforce: (a:unknown, b:unknown) => b
    },
    "hasall": {
        op: "hasall",
        compatibleTypes: "list",
        isConstraint: true,
        matches: (list:unknown, item:unknown) => 
            (Array.isArray(item)?item as any[]:[item] ).every(el => (list as any[]).includes(el)),
        enforce: (list:unknown, item:unknown) => {
            const items = Array.isArray(item) ? item : [item];
            const ret = items.slice();
            items.forEach(i => !ret.includes(i) && ret.push(i));
            return ret;
        }
    }
}

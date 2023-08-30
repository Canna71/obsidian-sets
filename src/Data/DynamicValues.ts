import { moment } from "obsidian";
import { AttributeDefinition } from "./AttributeDefinition";
import { ObjectData } from "./ObjectData";

export type DynamicValueName = "@link-to-this"
| "@today"

;

export interface DynamicValue  {
    id: DynamicValueName,
    displayName: () => string,
    generate: (a: AttributeDefinition, data:ObjectData, context?: ObjectData) => any;
    type: string;
}

export function isDynamic(val: string):boolean {
    return val in dynamicValues;
}

export function getDynamicValue(val: string, a: AttributeDefinition, data:ObjectData,   context?: ObjectData) {
    const dv = dynamicValues[val];
    return dv.generate(a,data,context);
}

export function getDynamicValuesForType(type: string) {
    return Object.values(dynamicValues)
        .filter(dv => dv.type === type);
}

export const dynamicValues:Record<DynamicValueName,DynamicValue> = {
    "@link-to-this": {
        id: "@link-to-this",
        displayName: () => "Link to this",
        generate: (a: AttributeDefinition, data:ObjectData, context?: ObjectData) => {
            if(context){
                const thisLink = data.db.generateWikiLink(context.file);
                return thisLink;
            } else {
                throw Error("Cannot generate @link-to-this since context is missing.")
            }
        },
        type: "multitext"
    },

    "@today": {
        id: "@today",
        displayName: () => "Today",
        generate: (a: AttributeDefinition, data:ObjectData, context?: ObjectData) => {
            return moment().format("YYYY-MM-DD")
        },
        type: "date"
    }
}

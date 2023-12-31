import { moment } from "obsidian";
import { AttributeDefinition } from "./AttributeDefinition";
import { ObjectData } from "./ObjectData";
import { VaultDB } from "./VaultDB";

export type DynamicValueName = "@link-to-this"
| "@today" | "@yesterday" | "@tomorrow"
| "@last-week" | "@this-week" | "@next-week"
| "@last-month" | "@this-month" | "@next-month"

;

export const LinkToThis:DynamicValueName = "@link-to-this";

export interface DynamicValue  {
    id: DynamicValueName,
    displayName: () => string,
    //  refactor second argument to be a VaultDB object

    generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => any;
    type: string[];
}

export function isDynamic(val: string):boolean {
    return val in dynamicValues;
}

export function getDynamicValue(val: string, a: AttributeDefinition, db: VaultDB,   context?: ObjectData) {
    const dv = dynamicValues[val];
    return dv.generate(a,db,context);
}

export function getDynamicValuesForType(type: string) {
    return Object.values(dynamicValues)
        .filter(dv => dv.type.includes(type));
}

export const dynamicValues:Record<DynamicValueName,DynamicValue> = {
    "@link-to-this": {
        id: "@link-to-this",
        displayName: () => "Link to this",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            if(context){
                const thisLink = db.generateWikiLink(context.file);
                return thisLink;
            } else {
                throw Error("Cannot generate @link-to-this since context is missing.")
            }
        },
        type: ["multitext", "text"]
    },

    "@today": {
        id: "@today",
        displayName: () => "Today",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@yesterday": {
        id: "@yesterday",
        displayName: () => "Yesterday",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().subtract(1, 'days').format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@tomorrow": {
        id: "@tomorrow",
        displayName: () => "Tomorrow",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().add(1, 'days').format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@this-week": {
        id: "@this-week",
        displayName: () => "This week",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().startOf('week').format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@last-week": {
        id: "@last-week",
        displayName: () => "Last week",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().subtract(1, 'week').startOf("week").format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@next-week": {
        id: "@next-week",
        displayName: () => "Next week",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().add(1, 'week').startOf("week").format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },

    "@this-month": {
        id: "@this-month",
        displayName: () => "This month",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().startOf('month').format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@last-month": {
        id: "@last-month",
        displayName: () => "Last month",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().subtract(1, 'month').startOf("month").format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
    "@next-month": {
        id: "@next-month",
        displayName: () => "Next month",
        generate: (a: AttributeDefinition, db: VaultDB, context?: ObjectData) => {
            return moment().add(1, 'month').startOf("month").format("YYYY-MM-DD")
        },
        type: ["date","datetime"]
    },
}

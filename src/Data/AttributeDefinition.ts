import { ObjectData } from "./ObjectData";
import { PropertyWidget } from "src/obsidian-ex";


export interface AttributeDefinition {
    displayName: () => string;
    getValue: (data: ObjectData) => any;
    getPropertyWidget: () => PropertyWidget | undefined;
    getPropertyInfo: () => {
        key: string;
        type: string;
    };
    readonly: boolean;
}

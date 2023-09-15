import { App } from "obsidian";
import { indexBy } from "src/Utils/indexBy";
import { sortBy } from "src/Utils/sortBy";
import { PropertyInfo } from "src/obsidian-ex";
import { IntrinsicAttributeDefinition } from "./IntrinsicAttributeDefinition";
import { IntrinsicAttributeKey } from "src/Views/components/SetDefinition";

export interface PropertyData {
    key: string;
    name: string;
    count: number;
    typeKey: string;
    typeName: string;
    typeIcon: string;
}

let _types;

export function getPropertyDataById(app:App, key: string):  PropertyData | undefined {
    return getPropertyData(app).find(pd => pd.key === key);
}

export function getPropertyData(app: App): PropertyData[] {
    if (!_types) {
        _types = indexBy<any>(
            "type",
            Object.values(app.metadataTypeManager.registeredTypeWidgets)
        );
    }
    let propInfo: PropertyInfo[] = Object.values(
        app.metadataTypeManager.properties
    ).filter((property) => property.name && property.name.length)
    .filter((property) => !property.name.startsWith("__"))   
    ;
    propInfo = sortBy("name", propInfo);
    const ret = propInfo.map((pi) => {
        //this._types.find(rtw => rtw.type === pi.type);
        const type = _types[pi.type];
        return {
            key: pi.name,
            name: pi.name,
            count: pi.count,
            typeName: type?.name(),
            typeKey: type?.type,
            typeIcon: type?.icon,
        };
    });

    const intrinsics = [
        {
            name: new IntrinsicAttributeDefinition(app, IntrinsicAttributeKey.FileName).displayName(),
            key: IntrinsicAttributeKey.FileName,
            count:Number.NaN,
            typeName: "Text",
            typeKey: "text",
            typeIcon: "lucide-text"
        },
        {
            name: new IntrinsicAttributeDefinition(app, IntrinsicAttributeKey.FilePath).displayName(),
            key: IntrinsicAttributeKey.FilePath,
            count:Number.NaN,
            typeName: "Text",
            typeKey: "text",
            typeIcon: "lucide-text" 
        },
        {
            name: new IntrinsicAttributeDefinition(app, IntrinsicAttributeKey.FileCreationDate).displayName(),
            key: IntrinsicAttributeKey.FileCreationDate,
            count:Number.NaN,
            typeName: "Date & time",
            typeKey: "datetime",
            typeIcon: "lucide-clock"
        },
        {
            name: new IntrinsicAttributeDefinition(app, IntrinsicAttributeKey.FileModificationDate).displayName(),
            key: IntrinsicAttributeKey.FileModificationDate,
            count:Number.NaN,
            typeName: "Date & time",
            typeKey: "datetime",
            typeIcon: "lucide-clock"
        } 
    ]

    return [...intrinsics, ...ret];
}

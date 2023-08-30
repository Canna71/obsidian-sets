import { App } from "obsidian";
import { indexBy } from "src/Utils/indexBy";
import { sortBy } from "src/Utils/sortBy";
import { PropertyInfo } from "src/obsidian-ex";

export interface PropertyData {
    name: string;
    count: number;
    typeKey: string;
    typeName: string;
    typeIcon: string;
}

let _types;

export function getPropertyData(app: App): PropertyData[] {
    if (!_types) {
        _types = indexBy<any>(
            "type",
            Object.values(app.metadataTypeManager.registeredTypeWidgets)
        );
    }
    let propInfo: PropertyInfo[] = Object.values(
        app.metadataTypeManager.properties
    ).filter((property) => property.name && property.name.length);
    propInfo = sortBy("name", propInfo);
    const ret = propInfo.map((pi) => {
        //this._types.find(rtw => rtw.type === pi.type);
        const type = _types[pi.type];
        return {
            name: pi.name,
            count: pi.count,
            typeName: type?.name(),
            typeKey: type?.type,
            typeIcon: type?.icon,
        };
    });
    return ret;
}

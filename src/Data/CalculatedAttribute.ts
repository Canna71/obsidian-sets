import { unslugify } from 'src/Utils/slugify';
// implements an AttributeDefinition that is calculated from other attributes
// the calculation is done by a function that takes an ObjectData and returns a value

import { AttributeDefinition } from "./AttributeDefinition";
import { ObjectData } from "./ObjectData";

export class CalculatedAttribute implements AttributeDefinition {
    private _calculate: (data: ObjectData) => any;
    private _name: string;

    constructor(name:string, calculate: (data: ObjectData) => any) {
        this._calculate = calculate;
        this._name = name;
    }
   
    displayName() { return unslugify(this._name); }
    getValue(data: ObjectData) { 
        // return the "#error" string if the calculation fails
        try {
            return this._calculate(data);
        } catch (e) {
            return "#error";
        }
    }
    format(data: ObjectData) { return this.getValue(data)?.toString() || ""; }
    getPropertyWidget() { return undefined; }
    getPropertyInfo() { return { key: this._name, type: "?" }; }
    get readonly() {return true;}
    get isIntrinsic() { return false; }
    get key() { return this._name; }

    
}



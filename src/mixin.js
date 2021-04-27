export class Mixin {
    constructor(name, group, data = {}) {
        this.name = name;
        this.group = group;
        for (let prop in data) {
            let propDesc = Object.getOwnPropertyDescriptor(data, prop);
            if (propDesc.get) {
                Object.defineProperty(this, prop, propDesc);
            } else {
                this[prop] = data[prop];
            }
        }
    }
}
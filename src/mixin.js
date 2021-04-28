export class Mixin {
    constructor(name, groups, data = {}) {
        this.name = name;
        this.groups = groups;
        for (let prop in data) {
            let propDesc = Object.getOwnPropertyDescriptor(data, prop);
            if (propDesc.get || propDesc.set) {
                Object.defineProperty(this, prop, propDesc);
            } else {
                this[prop] = data[prop];
            }
        }
    }
}
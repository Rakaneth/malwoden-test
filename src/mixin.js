export default class Mixin {
    constructor(name, groups, level=1, data = {}) {
        this.name = name;
        this.groups = groups;
        this.level = level;
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
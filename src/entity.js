import { Glyph} from "malwoden";

class Entity {
    constructor(id, opts) {
        this._x = 0;
        this._y = 0;
        this._id = id;
        this._name = opts.name || "No name";
        this._desc = opts.desc || "No desc";
        this._glyph = opts.glyph || Glyph.fromCharCode(CharCode.at);
        this._layer = opts.layer || 0;
        this._components = {};
        this._groups = {};
        this._mapID = "none";
        this._tags = opts.tags || new Set();
        if (opts.components) {
            for (let c of opts.components) {
                this.applyComponent(c);
            }
        }
    }

    get pos() { return {x: this._x, y: this._y}};
    get mapID() { return this._mapID; }
    get name() { return this._name; }
    get desc() { return this._desc; }
    get glyph() { return this._glyph; }
    get layer() { return this._layer; }

    applyComponent(component) {
        for (let k in component) {
            const excludeProps = ['init', 'group', 'name', 'stats'];
            if (!(excludeProps.includes(k) || this.hasOwnProperty(k))) {
                const propDesc = Object.getOwnPropertyDescriptor(component, k);
                if (propDesc.get || propDesc.set) {
                    Object.defineProperty(this, k, propDesc);
                } else {
                    this[k] = component[k]
                }
            }
        }

        this._components[component.name] = true;
        for (let group of component.groups.split(',')) {
            this._groups[group] = true;
        }

        if (component.init) {
            component.init.call(this, opts)
        }

        if (component.stats) {
            for (let sk in component.stats) {
                if (this[sk]) {
                    this[sk] += component.stats[sk];
                } else {
                    this[sk] = component.stats[sk];
                }
            }
        }

        if (component.isSuffix) {
            this._name = `${component.name} ${this._name}`;
        } else if (component.isPrefix) {
            this._name = `${this._name} ${component.name}`
        }
    }

    has(componentOrGroup) {
        return this._components[entityOrGroup] || this._groups[entityOrGroup];
    }

    hasTag(tag) {
        return this._tags.includes(tag);
    }

    moveTo(x, y, mapID=null) {
        this._x = x;
        this._y = y;
        if (mapID) {
            this._mapID = mapID; 
        }
    }

    moveBy(dx, dy) {
        this._x += dx;
        this._y += dy;
    }
}
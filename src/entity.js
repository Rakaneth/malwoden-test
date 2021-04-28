import { Color, Glyph} from "malwoden";

export class Entity {
    constructor(id, layer, opts) {
        this._x = 0;
        this._y = 0;
        this._id = id;
        this._name = opts.name || "No name";
        this._desc = opts.desc || "No desc";
        if (opts.glyph) {
            const [r, g, b] = opts.glyph.color;
            const color = new Color(r, g, b);
            const glyph = new Glyph(opts.glyph.char, color);
            this._glyph = glyph;
        } else {
            this._glyph = Glyph.fromCharCode(CharCode.at);
        }
        this._layer = layer;
        this._components = {};
        this._groups = {};
        this._mapID = "none";
        this._tags = new Set();
        if (opts.tags) {
            opts.tags.forEach(t => this._tags.add(t));
        }
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
    get id() { return this._id; }

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
        return this._tags.has(tag);
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
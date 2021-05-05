import { Color, Glyph} from "malwoden";
import { pctChance } from './rng';

export class Entity {
    constructor(id, layer, opts) {
        this._x = 0;
        this._y = 0;
        this._id = id;
        this._name = opts.name || "No name";
        this._desc = opts.desc || "No desc";
        let glyph;
        const components = opts.components || [];
        
        if (opts.glyph) {
            const [r, g, b] = opts.glyph.color;
            const color = new Color(r, g, b);
            if (typeof(opts.glyph.char) === 'string') {
                glyph = new Glyph(opts.glyph.char, color);
            } else {
                glyph = Glyph.fromCharCode(opts.glyph.char, color);
            }
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

        if (opts.egos && !opts.noEgos) {
            for (let chance in opts.egos) {
                const ego = opts.egos[chance]
                const c = parseInt(chance, 10);
                const check = pctChance(c);
                const canPrefix = !this.has("prefix") && ego.isPrefix;
                const canSuffix = !this.has("suffix") && ego.isSuffix;
                if (check && (canPrefix || canSuffix)) {
                    components.push(ego);
                }
            }
        }
        components.sort((fst, snd) => fst.level - snd.level);
        for (let comp of components) {
            this.applyComponent(comp, opts);
        }

        for (let resolver of components.filter(c => c.resolve)) {
            resolver.resolve(this, opts);
        }

    }

    get pos() { return {x: this._x, y: this._y}};
    get mapID() { return this._mapID; }
    get name() { return this._name; }
    get desc() { return this._desc; }
    get glyph() { return this._glyph; }
    get layer() { return this._layer; }
    get id() { return this._id; }

    applyComponent(component, opts) {
        //disable egos in template
        if (opts.noEgos && (component.isSuffix || component.isPrefix)) return;
        
        //can't have the same component twice
        if (this.has(component.name)) return;

        //can't have multiple races
        if (component.isRace && this.has('race')) return;

        for (let k in component) {
            const excludeProps = [
                'init', 
                'groups', 
                'name', 
                'stats', 
                'isPrefix', 
                'isSuffix',
                'isRace',
                'resolve'
            ];
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
            this._name = `${this._name} ${component.name}`;
        } else if (component.isPrefix) {
            this._name = `${component.name} ${this._name}`
        }

        if (component.tags) {
            for (let tag of component.tags) {
                this._tags.add(tag);
            }
        }
    }

    has(componentOrGroup) {
        return this._components[componentOrGroup] || this._groups[componentOrGroup];
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

    isAt(p, mapID) {
        return this._x === p.x && this._y === p.y && this._mapID === mapID;
    }
}
"use strict";

const Types = require('./Types');

/**
 * This class is the base for each item in an `Items` collection. All `Value` instances
 * must have a corresponding defined `Type` in the `Types` registry. This can be set by
 * providing a `type` config property. If no `type` is specified, the `value` (if given)
 * is used. If neither `type` nor `value` are given, the type defaults to String.
 */
class Item {
    constructor (config) {
        Object.assign(this, config);
        
        this._config = config;

        if (this.init) {
            this.init();
        }

        this.verify();
    }
}

Item.prototype.isItem = true;

module.exports = Item;

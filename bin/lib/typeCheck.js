'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.transformerTypesInCorrect = transformerTypesInCorrect;
exports.transformerIsInCorrectFormat = transformerIsInCorrectFormat;
exports.onlyPropertiesThatCorrespondBetween = onlyPropertiesThatCorrespondBetween;
exports.dataIsInCorrectFormat = dataIsInCorrectFormat;

var _utils = require('./utils');

var _deps = require('./deps');

function transformerTypesInCorrect(transformer) {

    return (0, _utils.traverse)(transformer, function (val) {
        return val;
    }).some(function (val, index, key) {
        if ((0, _deps.isString)(val)) {
            return false;
        }
        if ((0, _deps.isArray)(val)) {
            if ((0, _deps.isString)(val[0])) {
                return false;
            }
            if ((0, _deps.isArray)(val) && val.length == 2) {
                if ((0, _deps.isString)(val[0]) && (0, _deps.isFunc)(val[1])) {
                    return false;
                }
            }
            console.warn("Transformer's key:'" + key + "' is not specified properly, must be in the format [String Relocator, Transform Function]. You Specified:" + JSON.stringify(val));
            return true;
        }
        if ((0, _deps.isFunc)(val)) {
            return false;
        }
        if ((0, _deps.isObj)(val)) {
            return transformerTypesInCorrect(val);
        }
        console.warn("You specified a type that is not associated with a transformer object. You entered: '" + val + "' with a type of: '" + (typeof val === 'undefined' ? 'undefined' : _typeof(val)) + "' on key:'" + key + "'");
        return true;
    });
}

function transformerIsInCorrectFormat(transformer) {
    if (checkIfIsCircular(transformer)) {
        return false;
    }
    if (transformerTypesInCorrect(transformer)) {
        return false;
    }
    return true;
}

function onlyPropertiesThatCorrespondBetween(obj, transformer) {
    var tKeys = Object.keys(transformer).filter(function (cur) {
        return (0, _deps.hasOwnProp)(obj, cur);
    });

    return (0, _utils.createObj)(tKeys, tKeys.map(function (key) {
        var val = transformer[key];
        if ((0, _deps.isObj)(val)) {
            return onlyPropertiesThatCorrespondBetween(obj[key], val);
        }
        return val;
    }));
}

function dataIsInCorrectFormat(data) {
    if (checkIfIsCircular(data)) {
        return false;
    }
    return true;
}

function checkIfIsCircular(obj) {
    if ((0, _deps.isObj)(obj) && (0, _deps.isCircular)(obj)) {
        //just a check as this is a recursive method
        console.warn('Circular reference found and is unsupported. exiting...');
        return true;
    }
    return false;
}
//# sourceMappingURL=typeCheck.js.map
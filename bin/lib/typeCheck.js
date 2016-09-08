'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.transformerTypesInCorrect = transformerTypesInCorrect;
exports.transformerIsInCorrectFormat = transformerIsInCorrectFormat;
exports.onlyPropertiesThatCorrespondBetween = onlyPropertiesThatCorrespondBetween;
exports.dataIsInCorrectFormat = dataIsInCorrectFormat;

var _utils = require('./utils');

var _deps = require('./deps');

function transformerTypesInCorrect(transformer) {
    return (0, _deps.isInCorrectFormat)(transformer, {}, function (val) {
        if ((0, _deps.isString)(val) || (0, _deps.isFunc)(val)) {
            return false;
        }
        if ((0, _deps.isArray)(val)) {
            if ((0, _deps.isString)(val[0])) {
                return false;
            }
            if (val.length == 2) {
                if ((0, _deps.isString)(val[0]) && (0, _deps.isFunc)(val[1])) {
                    return false;
                }
            }
        }
        return true;
    });
}

function transformerIsInCorrectFormat(transformer) {
    if (checkIfIsCircular(transformer) || transformerTypesInCorrect(transformer)) {
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
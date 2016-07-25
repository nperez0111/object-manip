'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var isString = require('validate.io-string'),
    curry = require('curry'),
    isFunc = require('isfunction'),
    isObj = require('isobject'),
    isArray = require('isarray'),
    hasOwnProp = require('has-own-prop'),
    isStringOrArr = function isStringOrArr(a) {
    return isString(a) || isArray(a);
},
    isCircular = require('is-circular');
exports.isString = isString;
exports.curry = curry;
exports.isFunc = isFunc;
exports.isArray = isArray;
exports.hasOwnProp = hasOwnProp;
exports.isStringOrArr = isStringOrArr;
exports.isObj = isObj;
exports.isCircular = isCircular;
//# sourceMappingURL=deps.js.map
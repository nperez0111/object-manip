'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
if (!Object.values) {
    Object.values = function (obj) {
        return Object.keys(obj).map(function (key) {
            return obj[key];
        });
    };
}
var isString = require('validate.io-string'),
    curry = require('curry'),
    isFunc = require('isfunction'),
    isObj = require('isobject'),
    isArray = require('isarray'),
    hasOwnProp = require('has-own-prop'),
    isStringOrArr = function isStringOrArr(a) {
    return isString(a) || isArray(a);
},
    isCircular = require('is-circular'),
    isInCorrectFormat = require('is-in-correct-format'),
    is = isInCorrectFormat.is,
    props = function props(obj) {
    return {
        keys: Object.keys(obj),
        values: Object.values(obj)
    };
};

exports.isString = isString;
exports.curry = curry;
exports.isFunc = isFunc;
exports.isArray = isArray;
exports.hasOwnProp = hasOwnProp;
exports.isStringOrArr = isStringOrArr;
exports.isObj = isObj;
exports.isCircular = isCircular;
exports.isInCorrectFormat = isInCorrectFormat;
exports.is = is;
exports.props = props;
//# sourceMappingURL=deps.js.map
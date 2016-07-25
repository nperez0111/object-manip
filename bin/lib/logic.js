'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.actualCopy = actualCopy;
exports.parseRelocator = parseRelocator;

var _utils = require('./utils');

var isString = require('validate.io-string'),
    curry = require('curry'),
    isFunc = require('isfunction'),
    isObj = require('isobject'),
    isArray = require('isarray'),
    hasOwnProp = require('has-own-prop'),
    isStringOrArr = function isStringOrArr(a) {
    return isString(a) || isArray(a);
};

function actualCopy(placement, valueObj) {
    var get = function get(str, obj) {

        var arr = str.split(',').map(function (cur) {
            return cur.split('.');
        }).reduce(function (a, b) {
            return a.concat(b);
        }, []),
            ret = obj;

        if (!isObj(obj)) {
            //if something passed in the second arg return the array they want.
            return arr;
        }

        arr.forEach(function (cur) {
            ret = ret[cur];
        });

        return ret;
    };
    return (0, _utils.reducer)(placement.map(function (cur) {
        var cal = get(cur[0]);
        //fix bug where splitting via , shoul be handled seperate from .
        return (0, _utils.makeObj)(get(cur[0], valueObj), cal.slice(cal.length - 1 < cur[1] ? 0 : cur[1]));
    }));
}

function parseRelocator(str, cur, keys, values, func, thisArg) {
    var back = false;
    if (str.charAt(0) == '.' && str.charAt(1) == '/') {
        str = str.slice(2);
        back = true;
    }

    var props = str.split('.'),
        value = func ? (0, _utils.valueOf)(values[cur], func, thisArg) : values[cur];

    if (back == false) {

        keys[cur] = props.shift();
        values[cur] = props.length == 0 ? value : (0, _utils.makeObj)(value, props);
        return [keys, values];
    }

    keys.splice(cur, 1);
    values.splice(cur, 1);
    var obj = props.length == 1 ? (0, _utils.createObj)(str, value) : (0, _utils.makeObj)(value, props);
    return [keys, values, [obj, props[0]]];

    /*returns in format [keys,values,[optional val to set]]*/
}
//# sourceMappingURL=logic.js.map
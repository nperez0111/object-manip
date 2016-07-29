'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createObj = createObj;
exports.makeObj = makeObj;
exports.reducer = reducer;
exports.levelOfTransform = levelOfTransform;
exports.traverse = traverse;
exports.valueOf = valueOf;

var _deps = require('./deps');

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function createObj(keys, values) {
    var ret = {};
    if ((0, _deps.isArray)(keys) && (0, _deps.isArray)(values)) {
        keys.forEach(function (cur, i) {
            ret[cur] = values[i];
        });
    } else {
        ret[keys] = values;
    }
    return ret;
}

// makeOBj(123,[a,b,c])=={a:{b:{c:123}}}
function makeObj(val, props) {
    var obj = {};
    props.reverse();
    obj[props.shift()] = val;
    props.forEach(function (cur) {
        var ret = {};
        ret[cur] = obj;
        obj = ret;
    });
    return obj;
}

function reducer(val) {

    return val.reduce(function (acc, obj) {

        if ((0, _deps.isArray)(obj)) {

            return Object.assign({}, acc, reducer(obj));
        }

        return Object.assign({}, acc, obj);
    }, {});
}
function levelOfTransform(_ref) {
    var _ref2 = _toArray(_ref);

    var dot = _ref2[0];
    var slash = _ref2[1];

    var rest = _ref2.slice(2);

    var num = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];

    if (dot == '.' && slash == '/') {
        return levelOfTransform(rest, num + 1);
    }
    return num;
}

function traverse(objecto, funct) {
    var shouldReduce = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
    var useKeys = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

    var keys = Object.keys(objecto),
        values = keys.map(function (cur) {
        return objecto[cur];
    });
    if (useKeys) {
        var temp = values;
        values = keys;
        keys = temp;
        temp = null;
    }
    var mapper = values.map(function (val, index) {

        return funct(val, index, keys[index]);
    });

    if (shouldReduce) {

        mapper = reducer(mapper);
    }

    return mapper;
}

function valueOf(val, func, thisArg) {
    if ((0, _deps.isArray)(val)) {

        return val.map(function (currentValue, index, arr) {
            return func.call(thisArg, currentValue, index, arr);
        });
    }
    //maybe add another thing into the call

    return func.call(thisArg, val);
}
//# sourceMappingURL=utils.js.map
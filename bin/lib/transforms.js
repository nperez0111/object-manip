'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasDeepTransform = exports.postTransform = exports.findDeepNonTransforms = exports.findDeepTransforms = exports.deepTraversal = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _utils = require('./utils');

var _logic = require('./logic');

var _deps = require('./deps');

var toStr = function toStr(str) {
    return (0, _deps.isArray)(str) ? str[0] : str;
};
var hasDeepTransform = function hasDeepTransform(transformer) {
    var isDeep = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

    var _props = (0, _deps.props)(transformer);

    var keys = _props.keys;
    var values = _props.values;


    return values.some(function (cur) {

        if ((0, _deps.isStringOrArr)(cur)) {

            return (0, _utils.levelOfTransform)(toStr(cur)) > 1;
        } else if (isDeep && (0, _deps.isObj)(cur)) {

            return hasDeepTransform(cur);
        } else {
            //i guess no other case is it relevant
            return false;
        }
    });
},
    postTransform = function postTransform(transformer) {

    return (0, _utils.traverse)(transformer, function (value, i, key) {

        var val = null;

        if ((0, _deps.isStringOrArr)(value)) {

            var str = toStr(value);
            val = str.slice((0, _utils.levelOfTransform)(str) * 2);

            if ((0, _deps.isArray)(value)) {
                val = [val, value[1]];
            }
        } else {

            val = postTransform(value);
        }

        return (0, _utils.createObj)(key, val);
    }, true);
},
    findDeepNonTransforms = function findDeepNonTransforms(transformer) {

    var passesTest = function passesTest(value) {

        if (!(0, _deps.isObj)(value)) {

            if ((0, _deps.isStringOrArr)(value)) {
                return (0, _utils.levelOfTransform)(toStr(value)) < 2;
            }

            return true;
        }

        return findDeepNonTransforms(value).length !== 0;
    };
    return (0, _utils.traverse)(transformer, function (value, i, key) {
        if (passesTest(value)) {

            if (!(0, _deps.isObj)(value)) {

                return (0, _utils.createObj)(key, value);
            }

            //look inside the val for non transforms
            return (0, _utils.createObj)(key, (0, _utils.reducer)(findDeepNonTransforms(value)));
        }
        return false;
    }).filter(function (a) {
        return a !== false;
    });
},
    findDeepTransforms = function findDeepTransforms(transformer) {
    var notTransforms = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];


    return (0, _utils.traverse)(transformer, function (cur, i, value) {
        //[boolean checking if immediate values in the object have deeptransforms needed, index]
        return hasDeepTransform((0, _utils.createObj)(cur, value), true) === notTransforms ? [cur, value] : false;
    }, false, true).filter(function (a) {
        return a;
    }).map(function (cur) {
        var _cur = _slicedToArray(cur, 2);

        var key = _cur[0];
        var val = _cur[1];


        if ((0, _deps.isObj)(val)) {

            val = (0, _utils.reducer)(findDeepTransforms(val));
        }

        return (0, _utils.createObj)(key, val);
    });
},
    deepTraversal = function deepTraversal(original) {

    return (0, _utils.traverse)(original, function (value, i, key) {

        var val = null;

        if ((0, _deps.isStringOrArr)(value)) {

            var str = toStr(value),
                num = (0, _utils.levelOfTransform)(str);
            val = [str.slice(num * 2), num];
        } else {

            val = deepTraversal(value)[0];
            val[0] = key + ',' + val[0];
        }

        return val;
    });
};

exports.deepTraversal = deepTraversal;
exports.findDeepTransforms = findDeepTransforms;
exports.findDeepNonTransforms = findDeepNonTransforms;
exports.postTransform = postTransform;
exports.hasDeepTransform = hasDeepTransform;
//# sourceMappingURL=transforms.js.map
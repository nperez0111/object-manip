'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.hasDeepTransform = exports.postTransform = exports.findDeepNonTransforms = exports.findDeepTransforms = exports.deepTraversal = undefined;

var _utils = require('./utils');

var _logic = require('./logic');

var _deps = require('./deps');

var hasDeepTransform = function hasDeepTransform(transformer, isDeep) {

    isDeep = isDeep == undefined ? true : isDeep;

    var keys = Object.keys(transformer),
        values = keys.map(function (cur) {
        return transformer[cur];
    });

    return values.some(function (cur) {

        if ((0, _deps.isStringOrArr)(cur)) {

            var s = (0, _deps.isArray)(cur) ? cur[0] : cur;
            return (0, _utils.levelOfTransform)(s) > 1;
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

            var s = (0, _deps.isArray)(value) ? value[0] : value;
            val = s.slice((0, _utils.levelOfTransform)(s) * 2);

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
                var s = (0, _deps.isArray)(value) ? value[0] : value;
                return (0, _utils.levelOfTransform)(s) < 2;
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
    findDeepTransforms = function findDeepTransforms(transformer, notTransforms) {
    notTransforms = notTransforms === undefined ? true : notTransforms;

    return (0, _utils.traverse)(transformer, function (cur, i, value) {
        //[boolean checking if immediate values in the object have deeptransforms needed, index]
        return [hasDeepTransform((0, _utils.createObj)(cur, value), true) === notTransforms, [cur, value]];
    }, false, true).filter(function (a) {
        return a[0];
    }).map(function (cur) {
        var key = cur[1][0],
            val = cur[1][1];

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

            var s = (0, _deps.isArray)(value) ? value[0] : value,
                num = (0, _utils.levelOfTransform)(s);
            val = [s.slice(num * 2), num];
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
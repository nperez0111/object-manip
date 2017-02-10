'use strict';

var _utils = require('./lib/utils');

var _typeCheck = require('./lib/typeCheck');

var _logic = require('./lib/logic');

var _deps = require('./lib/deps');

var _transforms = require('./lib/transforms');

var needsToBeSetBack = false,
    flag = false;

var deep = (0, _deps.curry)(function (transformer, obj) {
    if ((0, _typeCheck.transformerIsInCorrectFormat)(transformer) && (0, _typeCheck.dataIsInCorrectFormat)(obj)) {
        if ((0, _transforms.hasDeepTransform)(transformer)) {
            return deepTransform((0, _typeCheck.onlyPropertiesThatCorrespondBetween)(obj, transformer), obj);
        } else {
            return transform((0, _typeCheck.onlyPropertiesThatCorrespondBetween)(obj, transformer), obj);
        }
    }
    return false;
}),
    deepTransform = function deepTransform(transformer, obj) {
    var settings = module.exports.settings;

    if (settings.reverse) {
        var temp = obj;
        obj = transformer;
        transformer = temp;
        temp = null;
    }

    var workNeeded = (0, _utils.reducer)((0, _transforms.findDeepTransforms)(transformer));
    var yay = transform((0, _utils.reducer)((0, _transforms.findDeepNonTransforms)(transformer)), obj);

    var transformed = transform((0, _transforms.postTransform)(workNeeded), obj);
    var keysToVal = (0, _transforms.deepTraversal)(workNeeded);
    /*lo( 'keysToVal', keysToVal )
    lo( 'transformed', transformed )*/
    var finallyMovedBack = (0, _logic.actualCopy)(keysToVal, transformed);
    /*log( 'eas' );
    log( workNeeded );*/

    return Object.assign(yay, finallyMovedBack);
},
    transform = (0, _deps.curry)(function (transformer, obj) {

    var settings = module.exports.settings;

    if (settings.reverse) {
        var temp = obj;
        obj = transformer;
        transformer = temp;
        temp = null;
    }

    var ret = replaceValues(transformer, obj, callback);
    if ((0, _deps.isArray)(ret)) {
        return ret[1][0][0];
    }
    return ret;
}),
    callback = function callback(func, prop, obj) {

    if ((0, _deps.isStringOrArr)(func)) {

        flag = func;

        return obj[prop];
    } else if ((0, _deps.isFunc)(func)) {

        if ((0, _deps.hasOwnProp)(obj, prop)) {

            return (0, _utils.valueOf)(obj[prop], func, module.exports.settings.thisArg);
        } else {
            //figure out a way to remove the obj key so we dont have a loose function lying around
            return func;
        }
    } else if ((0, _deps.isObj)(func) && (0, _deps.isObj)(obj)) {

        var objPostTransform = replaceValues(func, obj[prop], callback);
        if ((0, _deps.isArray)(objPostTransform)) {
            //is in format[object itself, objects to be sent up a level]
            needsToBeSetBack = objPostTransform[1].map(function (wentBack) {
                return wentBack[0];
            });

            objPostTransform = objPostTransform[0];
        }
        return objPostTransform;
    }

    //should just overwrite the value if is not a string, function, or object
    return func;
},
    replaceValues = function replaceValues(obj, actual, callback) {
    var keys = Object.keys(obj),
        edits = [],
        setBack = [],
        add = [],
        values = keys.map(function (key, i) {

        var val = callback(obj[key], key, actual);

        if (flag !== false) {
            edits.push([flag, i]);
            flag = false;
        }
        if (needsToBeSetBack !== false) {
            setBack.push(needsToBeSetBack);
            needsToBeSetBack = false;
        }
        return val;
    }),
        ret = {};

    if (edits.length) {

        edits.forEach(function (cur) {
            var str = cur[0],
                func = false;
            if ((0, _deps.isArray)(cur[0])) {
                str = cur[0][0];
                func = cur[0][1];
            }
            //log( 'preparse' )

            var postParse = (0, _logic.parseRelocator)(str, cur[1], keys, values, func, module.exports.settings.thisArg);
            keys = postParse[0];
            values = postParse[1];

            if (postParse.length == 3) {

                add.push(postParse[2]);
            }
        });
    }

    if (setBack.length) {

        setBack.forEach(function (cur) {

            cur.forEach(function (objy) {

                keys = keys.concat(Object.keys(objy));

                values = values.concat(Object.values(objy));
            });
        });
    }

    values.forEach(function (val, i) {
        if ((0, _deps.isObj)(val)) {
            if (Object.keys(val).length == 0) {
                return;
            }
        }
        ret[keys[i]] = val;
    });

    if (add.length) {
        ret = [ret, add];
    }

    return ret;
};

var d = {
    hasDeepTransform: _transforms.hasDeepTransform,
    findDeepTransforms: _transforms.findDeepTransforms,
    deepTransform: deepTransform,
    transform: transform,
    deep: deep,
    not: {
        deep: transform
    },
    toggleReverse: function toggleReverse() {
        module.exports.settings.reverse = !module.exports.settings.reverse;
        return module.exports.settings.reverse;
    },
    setThis: function setThis(newThis) {
        module.exports.settings.thisArg = newThis;
        return true;
    },
    settings: {
        reverse: false,
        thisArg: null
    }
};

module.exports = deep;
Object.keys(d).forEach(function (a) {
    module.exports[a] = d[a];
});

module.exports.transform.deep = deep;

function log(a) {
    console.log(a);
    return a;
}
var lo = (0, _deps.curry)(function (a, b) {
    log(a);
    log(b);
    log('end ' + a);
    return b;
});
//# sourceMappingURL=index.js.map
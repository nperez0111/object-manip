'use strict';

var _utils = require('./lib/utils');

var _typeCheck = require('./lib/typeCheck');

var _logic = require('./lib/logic');

var _deps = require('./lib/deps');

var needsToBeSetBack = false,
    flag = false;

function replaceValues(obj, actual, callback) {
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

                values = values.concat(Object.keys(objy).map(function (a) {
                    return objy[a];
                }));
            });
        });
    }

    keys.forEach(function (cur, i) {
        if ((0, _deps.isObj)(values[i])) {
            if (Object.keys(values[i]).length == 0) {
                return;
            }
        }
        ret[cur] = values[i];
    });

    if (add.length) {
        ret = [ret, add];
    }

    return ret;
}

var d = {
    hasDeepTransform: function hasDeepTransform(transformer, isDeep) {

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

                return module.exports.hasDeepTransform(cur);
            } else {
                //i guess no other case is it relevant
                return false;
            }
        });
    },
    findDeepNonTransforms: function findDeepNonTransforms(transformer) {

        var passesTest = function passesTest(value) {

            if (!(0, _deps.isObj)(value)) {

                if ((0, _deps.isStringOrArr)(value)) {
                    var s = (0, _deps.isArray)(value) ? value[0] : value;
                    return (0, _utils.levelOfTransform)(s) < 2;
                }

                return true;
            }

            return module.exports.findDeepNonTransforms(value).length !== 0;
        };
        return (0, _utils.traverse)(transformer, function (value, i, key) {
            if (passesTest(value)) {

                if (!(0, _deps.isObj)(value)) {

                    return (0, _utils.createObj)(key, value);
                }

                //look inside the val for non transforms
                return (0, _utils.createObj)(key, (0, _utils.reducer)(module.exports.findDeepNonTransforms(value)));
            }
            return false;
        }).filter(function (a) {
            return a !== false;
        });
    },
    findDeepTransforms: function findDeepTransforms(transformer, notTransforms) {
        notTransforms = notTransforms === undefined ? true : notTransforms;

        return (0, _utils.traverse)(transformer, function (cur, i, value) {
            //[boolean checking if immediate values in the object have deeptransforms needed, index]
            return [module.exports.hasDeepTransform((0, _utils.createObj)(cur, value), true) === notTransforms, [cur, value]];
        }, false, true).filter(function (a) {
            return a[0];
        }).map(function (cur) {
            var key = cur[1][0],
                val = cur[1][1];

            if ((0, _deps.isObj)(val)) {

                val = (0, _utils.reducer)(module.exports.findDeepTransforms(val));
            }

            return (0, _utils.createObj)(key, val);
        });
    },
    postTransform: function postTransform(transformer) {

        return (0, _utils.traverse)(transformer, function (value, i, key) {

            var val = null;

            if ((0, _deps.isStringOrArr)(value)) {

                var s = (0, _deps.isArray)(value) ? value[0] : value;
                val = s.slice((0, _utils.levelOfTransform)(s) * 2);

                if ((0, _deps.isArray)(value)) {
                    val = [val, value[1]];
                }
            } else {

                val = module.exports.postTransform(value);
            }

            return (0, _utils.createObj)(key, val);
        }, true);
    },
    deepTraversal: function deepTraversal(original) {

        return (0, _utils.traverse)(original, function (value, i, key) {

            var val = null;

            if ((0, _deps.isStringOrArr)(value)) {

                var s = (0, _deps.isArray)(value) ? value[0] : value,
                    num = (0, _utils.levelOfTransform)(s);
                val = [s.slice(num * 2), num];
            } else {

                val = module.exports.deepTraversal(value)[0];
                val[0] = key + ',' + val[0];
            }

            return val;
        });
    },
    deepTransform: function deepTransform(transformer, obj) {
        var settings = module.exports.settings;

        if (settings.reverse) {
            var temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        var workNeeded = (0, _utils.reducer)(module.exports.findDeepTransforms(transformer));
        var easy = (0, _utils.reducer)(module.exports.findDeepNonTransforms(transformer));
        var yay = module.exports.transform(easy, obj);

        var transformed = module.exports.transform(module.exports.postTransform(workNeeded), obj);
        var keysToVal = module.exports.deepTraversal(workNeeded);
        /*lo( 'keysToVal', keysToVal )
        lo( 'transformed', transformed )*/
        var finallyMovedBack = (0, _logic.actualCopy)(keysToVal, transformed);
        /*log( 'eas' );
        log( workNeeded );*/

        return Object.assign(yay, finallyMovedBack);
    },
    transform: (0, _deps.curry)(function (transformer, obj) {

        var settings = module.exports.settings;

        if (settings.reverse) {
            var temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        var ret = replaceValues(transformer, obj, module.exports.callback);
        if ((0, _deps.isArray)(ret)) {
            return ret[1][0][0];
        }
        return ret;
    }),
    callback: function callback(func, prop, obj) {

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

            var objPostTransform = replaceValues(func, obj[prop], module.exports.callback);
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

var deep = (0, _deps.curry)(function (transformer, obj) {
    if ((0, _typeCheck.transformerIsInCorrectFormat)(transformer) && (0, _typeCheck.dataIsInCorrectFormat)(obj)) {
        if (module.exports.hasDeepTransform(transformer)) {
            return module.exports.deepTransform((0, _typeCheck.onlyPropertiesThatCorrespondBetween)(obj, transformer), obj);
        } else {
            return module.exports.transform((0, _typeCheck.onlyPropertiesThatCorrespondBetween)(obj, transformer), obj);
        }
    }
    return {};
});

module.exports = deep;
Object.keys(d).forEach(function (a) {
    module.exports[a] = d[a];
});

module.exports.transform.deep = deep;
module.exports.deep = deep;
module.exports.not = {
    deep: d.transform
};

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
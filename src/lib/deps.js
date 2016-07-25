const isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArray = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    isStringOrArr = function ( a ) {
        return isString( a ) || isArray( a );
    };
export {
    isString,
    curry,
    isFunc,
    isArray,
    hasOwnProp,
    isStringOrArr,
    isObj
};

if ( !Object.values ) {
    Object.values = obj => Object.keys( obj ).map( key => obj[ key ] )
}
const isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArray = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    isStringOrArr = function ( a ) {
        return isString( a ) || isArray( a );
    },
    isCircular = require( 'is-circular' ),
    isInCorrectFormat = require( 'is-in-correct-format' ),
    is = isInCorrectFormat.is,
    props = obj => {
        return {
            keys: Object.keys( obj ),
            values: Object.values( obj )
        }
    }

export {
    isString,
    curry,
    isFunc,
    isArray,
    hasOwnProp,
    isStringOrArr,
    isObj,
    isCircular,
    isInCorrectFormat,
    is,
    props
};

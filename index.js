var isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArr = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' );

function objArr( obj, actual, callback ) {
    var values = Object.keys( obj ).map( function ( key ) {
            return callback( obj[ key ], key, actual );
        } ),
        ret = {};

    Object.keys( obj ).forEach( function ( cur, i ) {
        ret[ cur ] = values[ i ];
    } );

    return ret;
}
module.exports = {
    transform: curry( function ( transformer, obj ) {
        if ( module.exports.reverse ) {
            var temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }
        return objArr( transformer, obj, module.exports.callback );

    } ),
    callback: function ( func, prop, obj ) {

        if ( isString( func ) ) {

        } else if ( isFunc( func ) ) {

            if ( hasOwnProp( obj, prop ) ) {

                return func( obj[ prop ] );

            } else {

                return func;

            }

        } else if ( isObj( func ) ) {

            return module.exports.transform( func, obj[ prop ], module.exports.callback );

        } else if ( isArr( func ) ) {

        }

    },
    reverse: false
}

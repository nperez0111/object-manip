var isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArr = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    flag = false;

function objArr( obj, actual, callback ) {
    var keys = Object.keys( obj ),
        edits = [],
        values = keys.map( function ( key, i ) {
            var val = callback( obj[ key ], key, actual );
            if ( flag !== false ) {
                edits.push( [ flag, i ] );
                flag = false;
            }
            return val;
        } ),
        ret = {};
    if ( edits.length ) {
        edits.forEach( function ( cur ) {
            keys[ cur[ 1 ] ] = cur[ 0 ];
        } );
    }

    keys.forEach( function ( cur, i ) {
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
            flag = func;
            return obj[ prop ];
        } else if ( isFunc( func ) ) {

            if ( hasOwnProp( obj, prop ) ) {
                if ( isArr( obj[ prop ] ) ) {
                    return obj[ prop ].map( func );
                }
                return func( obj[ prop ] );

            } else {

                return func;

            }

        } else if ( isObj( func ) ) {

            return module.exports.transform( func, obj[ prop ], module.exports.callback );

        }

    },
    reverse: false
}

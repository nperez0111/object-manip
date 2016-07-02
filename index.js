var isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArr = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    flag = false,
    isCircular = require( 'is-circular' );

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
            var ret = parseStr( cur[ 0 ], cur[ 1 ], keys, values );
            keys = ret[ 0 ];
            values = ret[ 1 ];
        } );
    }

    keys.forEach( function ( cur, i ) {
        ret[ cur ] = values[ i ];
    } );

    return ret;
}

function parseStr( str, cur, keys, values ) {
    var props = str.split( '.' );
    if ( props.length == 1 ) {
        keys[ cur ] = str;
        return [ keys, values ];
    }
    keys[ cur ] = props.shift();
    values[ cur ] = makeObj( values[ cur ], props );
    /*returns in format [keys,values]*/
    return [ keys, values ];
}

function makeObj( val, props ) {
    var obj = {};
    props.reverse();
    obj[ props.shift() ] = val;
    props.forEach( function ( cur ) {
        var ret = {};
        ret[ cur ] = obj;
        obj = ret;
    } );
    return obj;
}

module.exports = {
    transform: curry( function ( transformer, obj ) {

        var settings = module.exports.settings;

        if ( settings.reverse ) {
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
            if ( isCircular( func ) ) {
                console.warn( "Circular Object detected, now exiting..." );
                return null;
            }
            var temp = module.exports.settings.reverse;
            module.exports.settings.reverse = false;
            //have to make sure that the setting isnt manipulated before insertion
            var r = module.exports.transform( func, obj[ prop ], module.exports.callback );
            module.exports.settings.reverse = temp;

            return r;

        }

    },
    settings: {
        reverse: false
    }
}

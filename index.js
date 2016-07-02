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
            var str = cur[ 0 ],
                func = false;
            if ( isArr( cur[ 0 ] ) ) {
                str = cur[ 0 ][ 0 ];
                func = cur[ 0 ][ 1 ];
            }
            var postParse = parseStr( str, cur[ 1 ], keys, values, func );
            keys = postParse[ 0 ];
            values = postParse[ 1 ];
        } );
    }

    keys.forEach( function ( cur, i ) {
        ret[ cur ] = values[ i ];
    } );

    return ret;
}

function parseStr( str, cur, keys, values, func ) {
    var props = str.split( '.' ),
        value = func ? isArr( values[ cur ] ) ? values[ cur ].map( func ) : func( values[ cur ] ) : values[ cur ];
    if ( props.length == 1 ) {
        keys[ cur ] = str;
        values[ cur ] = value;
        return [ keys, values ];
    }
    keys[ cur ] = props.shift();
    values[ cur ] = makeObj( value, props );
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

        if ( isString( func ) || isArr( func ) ) {

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

function log( a ) {
    console.log( a );
    return a;
}

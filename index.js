var isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArr = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    flag = false,
    needsToBeSetBack = false,
    isCircular = require( 'is-circular' );

function objArr( obj, actual, callback ) {
    var keys = Object.keys( obj ),
        edits = [],
        setBack = [],
        add = [],
        values = keys.map( function ( key, i ) {

            var val = callback( obj[ key ], key, actual );

            if ( flag !== false ) {
                edits.push( [ flag, i ] );
                flag = false;
            }
            if ( needsToBeSetBack !== false ) {
                setBack.push( needsToBeSetBack );
                needsToBeSetBack = false;
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
            //log( 'preparse' )

            var postParse = parseStr( str, ( cur[ 1 ] ), keys, values, func );
            keys = postParse[ 0 ];
            values = postParse[ 1 ];
            if ( postParse.length == 3 ) {
                add.push( ( postParse[ 2 ] ) );
            }
        } );
    }
    if ( setBack.length ) {
        setBack.forEach( function ( cur ) {
            cur.forEach( function ( objy ) {
                keys = keys.concat( Object.keys( objy ) );
                values = values.concat( Object.keys( objy ).map( function ( a ) {
                    return objy[ a ];
                } ) );
            } );

        } );
    }

    keys.forEach( function ( cur, i ) {
        ret[ cur ] = values[ i ];
    } );
    if ( add.length ) {
        ret = [ ret, add ];
    }

    return ret;
}

function parseStr( str, cur, keys, values, func ) {
    var back = false;
    if ( str.charAt( 0 ) == '.' && str.charAt( 1 ) == '/' ) {
        str = str.slice( 2 );
        back = true;
    }
    var props = str.split( '.' ),
        value = func ? isArr( values[ cur ] ) ? values[ cur ].map( func ) : func( values[ cur ] ) : values[ cur ];
    /*log( 'parsing' )
    log( keys[ cur ] )
    log( values[ cur ] )*/
    if ( !back ) {
        if ( props.length == 1 ) {
            keys[ cur ] = str;
            values[ cur ] = value;
            return [ keys, values ];
        }
        keys[ cur ] = props.shift();
        values[ cur ] = makeObj( value, props );
        return [ keys, values ];
    } else {
        keys.splice( cur, 1 );
        values.splice( cur, 1 );
        if ( props.length == 1 ) {
            var r = {};
            r[ str ] = value;
            return [ keys, values, [ r, str ] ];
        }
        return [ keys, values, [ makeObj( value, props ), props[ 0 ] ] ];
    }
    /*returns in format [keys,values,[optional val to set]]*/

}

function createObj( keys, values ) {
    var ret = {};
    if ( isArr( keys ) && isArr( values ) ) {
        keys.forEach( function ( cur, i ) {
            ret[ cur ] = values[ i ];
        } );

    } else {
        ret[ keys ] = values;
    }
    return ret;
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

function reducer( val ) {

    return val.reduce( function ( acc, obj ) {

        if ( isArr( obj ) ) {

            return Object.assign( {}, acc, reducer( obj ) );

        }

        return Object.assign( {}, acc, obj );

    }, {} );
};

function levelOfTransform( str, num ) {
    var arr = Array.from( str );
    if ( arr.shift() == '.' && arr.shift() == '/' ) {
        return levelOfTransform( arr.join( '' ), ( num || 0 ) + 1 );
    }
    return num || 0;
}



module.exports = {
    hasDeepTransform: function ( transformer, isDeep ) {

        isDeep = isDeep == undefined ? true : isDeep;

        var keys = Object.keys( transformer ),
            values = keys.map( function ( cur ) {
                return transformer[ cur ];
            } );

        if ( isObj( transformer ) && isCircular( transformer ) ) {
            //just a check as this is a recursive method
            console.warn( 'Circular reference found and is unsupported. exiting...' );
            return null;
        }

        return values.some( function ( cur ) {

            if ( isString( cur ) || isArr( cur ) ) {

                var s = isArr( cur ) ? cur[ 0 ] : cur;
                return levelOfTransform( s ) > 1;

            } else if ( isDeep && isObj( cur ) ) {

                return module.exports.hasDeepTransform( cur );

            } else {
                //i guess no other case is it relevant
                return false;
            }

        } );
    },
    findDeepNonTransforms: function ( transformer ) {
        var keys = Object.keys( transformer ),
            values = keys.map( function ( cur ) {
                return transformer[ cur ];
            } ),
            arr = values.slice( 0 );

        if ( keys.length == 0 ) {

            return arr;

        }

        values = values.map( function ( c, i ) {

            return i;

        } ).filter( function ( value, i ) {

            var val = values[ value ];

            if ( !isObj( val ) ) {

                if ( isString( val ) || isArr( val ) ) {

                    return false;

                }

                return true;

            }

            //figure out what to do about deep objects
            return module.exports.findDeepNonTransforms( val ).length !== 0;

        } );

        return values.map( function ( cur ) {

            var val = arr[ cur ],
                key = keys[ cur ];

            if ( !isObj( val ) ) {

                return createObj( key, val );

            }

            //look inside the val for non transforms
            return createObj( key, reducer( module.exports.findDeepNonTransforms( val ) ) );

        } );

    },
    findDeepTransforms: function ( transformer, notTransforms ) {
        notTransforms = notTransforms === undefined ? true : notTransforms;
        var keys = Object.keys( transformer ),
            values = keys.map( function ( cur ) {
                return transformer[ cur ];
            } ),
            arr = [];
        if ( keys.length == 0 ) {
            return arr;
        }
        var deepTransformKeys = ( keys.map( function ( cur, i ) {
            return [ module.exports.hasDeepTransform( createObj( cur, values[ i ] ), true ) === notTransforms, i ];
        } ).filter( function ( a ) {
            return a[ 0 ];
        } ) );
        return ( deepTransformKeys.map( function ( cur ) {

            var key = keys[ cur[ 1 ] ],
                val = values[ cur[ 1 ] ];

            if ( isObj( val ) ) {

                val = module.exports.findDeepTransforms( val );

                val = reducer( val );
            }

            return createObj( key, val );

        } ) );

    },
    deepTransform: function ( transformer, obj ) {
        var settings = module.exports.settings;

        if ( settings.reverse ) {
            var temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        var workNeeded = log( reducer( module.exports.findDeepTransforms( transformer ) ) );
        var easy = log( reducer( module.exports.findDeepNonTransforms( transformer ) ) );
        log( obj )
        var yay = module.exports.transform( easy, obj );
        lo( 'awesome', yay );


    },
    transform: curry( function ( transformer, obj ) {

        var settings = module.exports.settings;

        if ( settings.reverse ) {
            var temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        var ret = objArr( transformer, obj, module.exports.callback );
        if ( isArr( ret ) ) {
            return ret[ 1 ][ 0 ][ 0 ];
        }
        return ret;

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

        } else if ( isObj( func ) && isObj( obj ) ) {
            if ( isCircular( func ) ) {
                console.warn( "Circular Object detected, now exiting..." );
                return null;
            }
            var r = ( objArr( func, obj[ prop ], module.exports.callback ) );
            if ( isArr( r ) ) {
                var arr = r[ 1 ];
                r = r[ 0 ];
                needsToBeSetBack = arr.map( function ( wentBack ) {
                    return wentBack[ 0 ];
                } );
            }
            return r;

        }
        return func;

    },
    toggleReverse: function () {
        module.exports.settings.reverse = !module.exports.settings.reverse;
        return module.exports.settings.reverse
    },
    settings: {
        reverse: false
    }
}
module.exports.transform.deep = curry( function ( transformer, obj ) {
    if ( module.exports.hasDeepTransform( transformer ) ) {
        return module.exports.deepTransform( transformer, obj );
    } else {
        return module.exports.transform( transformer, obj );
    }
} );

function log( a ) {
    console.log( a );
    return a;
}
var lo = curry( function ( a, b ) {
    log( a );
    log( b );
    log( 'end ' + a );
    return b;
} );

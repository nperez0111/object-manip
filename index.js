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
        if ( isObj( values[ i ] ) ) {
            if ( Object.keys( values[ i ] ).length == 0 ) {
                return;
            }
        }
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



var d = {
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
                    var s = isArr( val ) ? val[ 0 ] : val;
                    return levelOfTransform( s ) < 2;

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
    postTransform: function ( transformer ) {

        var keys = Object.keys( transformer ),
            values = keys.map( function ( cur ) {
                return transformer[ cur ];
            } );

        return reducer( values.map( function ( value, i ) {

            var key = keys[ i ],
                val = null;

            if ( isString( value ) || isArr( value ) ) {

                var s = isArr( value ) ? value[ 0 ] : value;
                val = s.slice( levelOfTransform( s ) * 2 );

                if ( isArr( value ) ) {
                    val = [ val, value[ 1 ] ];
                }

            } else {

                val = module.exports.postTransform( value );

            }

            return createObj( key, val );

        } ) );
    },
    deepTraversal: function ( original ) {
        var keys = Object.keys( original ),
            values = keys.map( function ( cur ) {
                return original[ cur ];
            } );
        return ( values.map( function ( value, i ) {

            var key = keys[ i ],
                val = null;

            if ( isString( value ) || isArr( value ) ) {

                var s = isArr( value ) ? value[ 0 ] : value,
                    num = levelOfTransform( s );
                val = [ ( s.slice( num * 2 ) ), num ];

            } else {

                val = module.exports.deepTraversal( value )[ 0 ];
                val[ 0 ] = key + ',' + val[ 0 ];

            }

            return val;

        } ) );

    },
    get: function ( str, obj ) {
        var arr = ( ( str.split( ',' ) ).map( function ( cur ) {
                return cur.split( '.' )
            } ).reduce( function ( a, b ) {
                return a.concat( b );
            }, [] ) ),
            ret = obj;
        if ( !isObj( obj ) ) {
            return arr;
        }
        arr.forEach( function ( cur ) {
            ret = ret[ cur ];
        } );
        return ret;
    },
    actualCopy: function ( placement, valueObj ) {
        return reducer( placement.map( function ( cur ) {
            var cal = module.exports.get( cur[ 0 ] );

            return makeObj( module.exports.get( cur[ 0 ], valueObj ), cal.slice( cal.length - 1 < cur[ 1 ] ? 0 : cur[ 1 ] ) );
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

        var workNeeded = ( reducer( module.exports.findDeepTransforms( transformer ) ) );
        var easy = ( reducer( module.exports.findDeepNonTransforms( transformer ) ) );
        var yay = module.exports.transform( easy, obj );

        /*
        transform(posttransformed moved back a tick,transform(orginaltransform,originaldata))
        */
        var transformed = module.exports.transform( module.exports.postTransform( workNeeded ), obj );
        var keysToVal = ( module.exports.deepTraversal( workNeeded ) );
        /*lo( 'keysToVal', keysToVal )
        lo( 'transformed', transformed )*/
        var finallyMovedBack = ( module.exports.actualCopy( keysToVal, transformed ) );
        /*log( 'eas' );
        log( workNeeded );*/

        return Object.assign( yay, finallyMovedBack );


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
var deep = curry( function ( transformer, obj ) {
    if ( module.exports.hasDeepTransform( transformer ) ) {
        return module.exports.deepTransform( transformer, obj );
    } else {
        return module.exports.transform( transformer, obj );
    }
} );

module.exports = deep;
Object.keys( d ).forEach( function ( a ) {
    module.exports[ a ] = d[ a ];
} );

module.exports.transform.deep = deep;
module.exports.deep = deep;
module.exports.not = {
    deep: d.transform
};

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

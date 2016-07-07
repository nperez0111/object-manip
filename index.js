var isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArray = require( 'isArray' ),
    hasOwnProp = require( 'has-own-prop' ),
    flag = false,
    needsToBeSetBack = false,
    isCircular = require( 'is-circular' ),
    isStringOrArr = function ( a ) {
        return isString( a ) || isArray( a );
    };

function replaceValues( obj, actual, callback ) {
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
            if ( isArray( cur[ 0 ] ) ) {
                str = cur[ 0 ][ 0 ];
                func = cur[ 0 ][ 1 ];
            }
            //log( 'preparse' )

            var postParse = parseRelocator( str, ( cur[ 1 ] ), keys, values, func );
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

function parseRelocator( str, cur, keys, values, func ) {
    var back = false;
    if ( str.charAt( 0 ) == '.' && str.charAt( 1 ) == '/' ) {
        str = str.slice( 2 );
        back = true;
    }
    var props = str.split( '.' ),
        value = func ? valueOf( values[ cur ], func ) : values[ cur ];
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

function valueOf( val, func ) {
    if ( isArray( val ) ) {

        return val.map( function ( currentValue, index, arr ) {
            return func.call( module.exports.settings, currentValue, index, arr );
        } );

    }
    //maybe add another thing into the call

    return func.call( module.exports.settings.thisArg, val );
}

function createObj( keys, values ) {
    var ret = {};
    if ( isArray( keys ) && isArray( values ) ) {
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

        if ( isArray( obj ) ) {

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

            if ( isStringOrArr( cur ) ) {

                var s = isArray( cur ) ? cur[ 0 ] : cur;
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

        var passesTest = function ( value ) {

            if ( !isObj( value ) ) {

                if ( isStringOrArr( value ) ) {
                    var s = isArray( value ) ? value[ 0 ] : value;
                    return levelOfTransform( s ) < 2;

                }

                return true;

            }

            return module.exports.findDeepNonTransforms( value ).length !== 0;

        };
        return module.exports.traverse( transformer, function ( value, i, key ) {
            if ( passesTest( value ) ) {

                if ( !isObj( value ) ) {

                    return createObj( key, value );

                }

                //look inside the val for non transforms
                return createObj( key, reducer( module.exports.findDeepNonTransforms( value ) ) );
            }
            return false;
        } ).filter( function ( a ) {
            return a !== false;
        } );

    },
    findDeepTransforms: function ( transformer, notTransforms ) {
        notTransforms = notTransforms === undefined ? true : notTransforms;

        return module.exports.traverse( transformer, function ( cur, i, value ) {
            //[boolean checking if immediate values in the object have deeptransforms needed, index]
            return [ module.exports.hasDeepTransform( createObj( cur, value ), true ) === notTransforms, [ cur, value ] ];

        }, false, true ).filter( function ( a ) {
            return a[ 0 ];

        } ).map( function ( cur ) {
            var key = cur[ 1 ][ 0 ],
                val = cur[ 1 ][ 1 ];

            if ( isObj( val ) ) {

                val = reducer( module.exports.findDeepTransforms( val ) );

            }

            return createObj( key, val );

        } );

    },
    traverse: function ( objecto, funct, shouldReduce, useKeys ) {
        var keys = Object.keys( objecto ),
            values = keys.map( function ( cur ) {
                return objecto[ cur ];
            } );
        if ( useKeys ) {
            var temp = values;
            values = keys;
            keys = temp;
            temp = null;
        }
        mapper = values.map( function ( val, index ) {

            return funct( val, index, keys[ index ] );

        } );

        if ( shouldReduce ) {

            mapper = reducer( mapper );

        }

        return mapper;
    },
    postTransform: function ( transformer ) {

        return ( module.exports.traverse( transformer, function ( value, i, key ) {

            var val = null;

            if ( isStringOrArr( value ) ) {

                var s = isArray( value ) ? value[ 0 ] : value;
                val = s.slice( levelOfTransform( s ) * 2 );

                if ( isArray( value ) ) {
                    val = [ val, value[ 1 ] ];
                }

            } else {

                val = module.exports.postTransform( value );

            }

            return createObj( key, val );

        }, true ) );
    },
    deepTraversal: function ( original ) {

        return ( module.exports.traverse( original, function ( value, i, key ) {

            var val = null;

            if ( isStringOrArr( value ) ) {

                var s = isArray( value ) ? value[ 0 ] : value,
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

                return cur.split( '.' );

            } ).reduce( function ( a, b ) {

                return a.concat( b );

            }, [] ) ),
            ret = obj;

        if ( !isObj( obj ) ) {
            //if something passed in the second arg return the array they want.
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
            //fix bug where splitting via , shoul be handled seperate from .
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

        var ret = replaceValues( transformer, obj, module.exports.callback );
        if ( isArray( ret ) ) {
            return ret[ 1 ][ 0 ][ 0 ];
        }
        return ret;

    } ),
    callback: function ( func, prop, obj ) {

        if ( isStringOrArr( func ) ) {

            flag = func;

            return obj[ prop ];

        } else if ( isFunc( func ) ) {

            if ( hasOwnProp( obj, prop ) ) {

                return valueOf( obj[ prop ], func );

            } else {

                return func;

            }

        } else if ( isObj( func ) && isObj( obj ) ) {
            if ( isCircular( func ) ) {
                console.warn( "Circular Object detected, now exiting..." );
                return null;
            }
            var objPostTransform = ( replaceValues( func, obj[ prop ], module.exports.callback ) );
            if ( isArray( objPostTransform ) ) {
                //is in format[object itself, objects to be sent up a level]
                needsToBeSetBack = objPostTransform[ 1 ].map( function ( wentBack ) {
                    return wentBack[ 0 ];
                } );

                objPostTransform = objPostTransform[ 0 ];
            }
            return objPostTransform;

        }

        //should just overwrite the value if is not a string, function, or object
        return func;

    },
    toggleReverse: function () {
        module.exports.settings.reverse = !module.exports.settings.reverse;
        return module.exports.settings.reverse;
    },
    settings: {
        reverse: false,
        thisArg: null
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

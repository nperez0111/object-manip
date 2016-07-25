import {
    reducer,
    createObj,
    makeObj,
    levelOfTransform,
    traverse,
    valueOf
} from './lib/utils';

import {
    onlyPropertiesThatCorrespondBetween,
    dataIsInCorrectFormat,
    transformerIsInCorrectFormat,
    transformerTypesInCorrect
} from './lib/typeCheck';

import {
    actualCopy,
    parseRelocator
} from './lib/logic'

const isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArray = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    isStringOrArr = function ( a ) {
        return isString( a ) || isArray( a );
    };
let needsToBeSetBack = false,
    flag = false;

function replaceValues( obj, actual, callback ) {
    let keys = Object.keys( obj ),
        edits = [],
        setBack = [],
        add = [],
        values = keys.map( function ( key, i ) {

            const val = callback( obj[ key ], key, actual );

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
            let str = cur[ 0 ],
                func = false;
            if ( isArray( cur[ 0 ] ) ) {
                str = cur[ 0 ][ 0 ];
                func = cur[ 0 ][ 1 ];
            }
            //log( 'preparse' )

            let postParse = parseRelocator( str, cur[ 1 ], keys, values, func, module.exports.settings.thisArg );
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





let d = {
    hasDeepTransform: function ( transformer, isDeep ) {

        isDeep = isDeep == undefined ? true : isDeep;

        let keys = Object.keys( transformer ),
            values = keys.map( function ( cur ) {
                return transformer[ cur ];
            } );



        return values.some( function ( cur ) {

            if ( isStringOrArr( cur ) ) {

                let s = isArray( cur ) ? cur[ 0 ] : cur;
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

        let passesTest = function ( value ) {

            if ( !isObj( value ) ) {

                if ( isStringOrArr( value ) ) {
                    let s = isArray( value ) ? value[ 0 ] : value;
                    return levelOfTransform( s ) < 2;

                }

                return true;

            }

            return module.exports.findDeepNonTransforms( value ).length !== 0;

        };
        return traverse( transformer, function ( value, i, key ) {
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

        return traverse( transformer, function ( cur, i, value ) {
            //[boolean checking if immediate values in the object have deeptransforms needed, index]
            return [ module.exports.hasDeepTransform( createObj( cur, value ), true ) === notTransforms, [ cur, value ] ];

        }, false, true ).filter( function ( a ) {
            return a[ 0 ];

        } ).map( function ( cur ) {
            let key = cur[ 1 ][ 0 ],
                val = cur[ 1 ][ 1 ];

            if ( isObj( val ) ) {

                val = reducer( module.exports.findDeepTransforms( val ) );

            }

            return createObj( key, val );

        } );

    },
    postTransform: function ( transformer ) {

        return ( traverse( transformer, function ( value, i, key ) {

            let val = null;

            if ( isStringOrArr( value ) ) {

                let s = isArray( value ) ? value[ 0 ] : value;
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

        return ( traverse( original, function ( value, i, key ) {

            let val = null;

            if ( isStringOrArr( value ) ) {

                let s = isArray( value ) ? value[ 0 ] : value,
                    num = levelOfTransform( s );
                val = [ ( s.slice( num * 2 ) ), num ];

            } else {

                val = module.exports.deepTraversal( value )[ 0 ];
                val[ 0 ] = key + ',' + val[ 0 ];

            }

            return val;

        } ) );

    },
    deepTransform: function ( transformer, obj ) {
        let settings = module.exports.settings;

        if ( settings.reverse ) {
            let temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        let workNeeded = ( reducer( module.exports.findDeepTransforms( transformer ) ) );
        let easy = ( reducer( module.exports.findDeepNonTransforms( transformer ) ) );
        let yay = module.exports.transform( easy, obj );

        let transformed = module.exports.transform( module.exports.postTransform( workNeeded ), obj );
        let keysToVal = ( module.exports.deepTraversal( workNeeded ) );
        /*lo( 'keysToVal', keysToVal )
        lo( 'transformed', transformed )*/
        let finallyMovedBack = actualCopy( keysToVal, transformed );
        /*log( 'eas' );
        log( workNeeded );*/

        return Object.assign( yay, finallyMovedBack );


    },
    transform: curry( function ( transformer, obj ) {

        let settings = module.exports.settings;

        if ( settings.reverse ) {
            let temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        let ret = replaceValues( transformer, obj, module.exports.callback );
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

                return valueOf( obj[ prop ], func, module.exports.settings.thisArg );

            } else {
                //figure out a way to remove the obj key so we dont have a loose function lying around
                return func;

            }

        } else if ( isObj( func ) && isObj( obj ) ) {

            let objPostTransform = ( replaceValues( func, obj[ prop ], module.exports.callback ) );
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
    setThis: function ( newThis ) {
        module.exports.settings.thisArg = newThis;
        return true;
    },
    settings: {
        reverse: false,
        thisArg: null
    }
}

let deep = curry( function ( transformer, obj ) {
    if ( transformerIsInCorrectFormat( transformer ) && dataIsInCorrectFormat( obj ) ) {
        if ( module.exports.hasDeepTransform( transformer ) ) {
            return module.exports.deepTransform( onlyPropertiesThatCorrespondBetween( obj, transformer ), obj );
        } else {
            return module.exports.transform( onlyPropertiesThatCorrespondBetween( obj, transformer ), obj );
        }
    }
    return {};
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
let lo = curry( function ( a, b ) {
    log( a );
    log( b );
    log( 'end ' + a );
    return b;
} );

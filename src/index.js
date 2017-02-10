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
} from './lib/logic';


import {
    isString,
    curry,
    isFunc,
    isArray,
    hasOwnProp,
    isStringOrArr,
    isObj
} from './lib/deps';

import {
    deepTraversal,
    findDeepTransforms,
    findDeepNonTransforms,
    postTransform,
    hasDeepTransform
} from './lib/transforms';

let needsToBeSetBack = false,
    flag = false;




let deep = curry( function ( transformer, obj ) {
        if ( transformerIsInCorrectFormat( transformer ) && dataIsInCorrectFormat( obj ) ) {
            if ( hasDeepTransform( transformer ) ) {
                return deepTransform( onlyPropertiesThatCorrespondBetween( obj, transformer ), obj );
            } else {
                return transform( onlyPropertiesThatCorrespondBetween( obj, transformer ), obj );
            }
        }
        return false;
    } ),
    deepTransform = function ( transformer, obj ) {
        let settings = module.exports.settings;

        if ( settings.reverse ) {
            let temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        let workNeeded = ( reducer( findDeepTransforms( transformer ) ) );
        let yay = transform( ( reducer( findDeepNonTransforms( transformer ) ) ), obj );

        let transformed = transform( postTransform( workNeeded ), obj );
        let keysToVal = ( deepTraversal( workNeeded ) );
        /*lo( 'keysToVal', keysToVal )
        lo( 'transformed', transformed )*/
        let finallyMovedBack = actualCopy( keysToVal, transformed );
        /*log( 'eas' );
        log( workNeeded );*/

        return Object.assign( yay, finallyMovedBack );


    },
    transform = curry( function ( transformer, obj ) {

        let settings = module.exports.settings;

        if ( settings.reverse ) {
            let temp = obj;
            obj = transformer;
            transformer = temp;
            temp = null;
        }

        let ret = replaceValues( transformer, obj, callback );
        if ( isArray( ret ) ) {
            return ret[ 1 ][ 0 ][ 0 ];
        }
        return ret;

    } ),
    callback = function ( func, prop, obj ) {

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

            let objPostTransform = ( replaceValues( func, obj[ prop ], callback ) );
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
    replaceValues = function ( obj, actual, callback ) {
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

            setBack.forEach( cur => {

                cur.forEach( objy => {

                    keys = keys.concat( Object.keys( objy ) );

                    values = values.concat( Object.values( objy ) );

                } );

            } );

        }

        values.forEach( function ( val, i ) {
            if ( isObj( val ) ) {
                if ( Object.keys( val ).length == 0 ) {
                    return;
                }
            }
            ret[ keys[ i ] ] = val;
        } );

        if ( add.length ) {
            ret = [ ret, add ];
        }

        return ret;
    };

let d = {
    hasDeepTransform,
    findDeepTransforms,
    deepTransform,
    transform,
    deep,
    not: {
        deep: transform
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

module.exports = deep;
Object.keys( d ).forEach( a => {
    module.exports[ a ] = d[ a ];
} );

module.exports.transform.deep = deep;

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

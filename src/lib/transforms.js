import {
    reducer,
    createObj,
    makeObj,
    levelOfTransform,
    traverse,
    valueOf
} from './utils';

import {
    actualCopy,
    parseRelocator
} from './logic';

import {
    isString,
    curry,
    isFunc,
    isArray,
    hasOwnProp,
    isStringOrArr,
    isObj
} from './deps';

let hasDeepTransform = ( transformer, isDeep ) => {

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

                return hasDeepTransform( cur );

            } else {
                //i guess no other case is it relevant
                return false;
            }

        } );
    },
    postTransform = ( transformer ) => {

        return ( traverse( transformer, function ( value, i, key ) {

            let val = null;

            if ( isStringOrArr( value ) ) {

                let s = isArray( value ) ? value[ 0 ] : value;
                val = s.slice( levelOfTransform( s ) * 2 );

                if ( isArray( value ) ) {
                    val = [ val, value[ 1 ] ];
                }

            } else {

                val = postTransform( value );

            }

            return createObj( key, val );

        }, true ) );
    },
    findDeepNonTransforms = ( transformer ) => {

        let passesTest = function ( value ) {

            if ( !isObj( value ) ) {

                if ( isStringOrArr( value ) ) {
                    let s = isArray( value ) ? value[ 0 ] : value;
                    return levelOfTransform( s ) < 2;

                }

                return true;

            }

            return findDeepNonTransforms( value ).length !== 0;

        };
        return traverse( transformer, function ( value, i, key ) {
            if ( passesTest( value ) ) {

                if ( !isObj( value ) ) {

                    return createObj( key, value );

                }

                //look inside the val for non transforms
                return createObj( key, reducer( findDeepNonTransforms( value ) ) );
            }
            return false;
        } ).filter( function ( a ) {
            return a !== false;
        } );

    },
    findDeepTransforms = ( transformer, notTransforms ) => {
        notTransforms = notTransforms === undefined ? true : notTransforms;

        return traverse( transformer, function ( cur, i, value ) {
            //[boolean checking if immediate values in the object have deeptransforms needed, index]
            return [ hasDeepTransform( createObj( cur, value ), true ) === notTransforms, [ cur, value ] ];

        }, false, true ).filter( function ( a ) {
            return a[ 0 ];

        } ).map( function ( cur ) {
            let key = cur[ 1 ][ 0 ],
                val = cur[ 1 ][ 1 ];

            if ( isObj( val ) ) {

                val = reducer( findDeepTransforms( val ) );

            }

            return createObj( key, val );

        } );

    },
    deepTraversal = ( original ) => {

        return ( traverse( original, function ( value, i, key ) {

            let val = null;

            if ( isStringOrArr( value ) ) {

                let s = isArray( value ) ? value[ 0 ] : value,
                    num = levelOfTransform( s );
                val = [ ( s.slice( num * 2 ) ), num ];

            } else {

                val = deepTraversal( value )[ 0 ];
                val[ 0 ] = key + ',' + val[ 0 ];

            }

            return val;

        } ) );

    };

export {
    deepTraversal,
    findDeepTransforms,
    findDeepNonTransforms,
    postTransform,
    hasDeepTransform
};

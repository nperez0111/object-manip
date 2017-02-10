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
    isObj,
    props
} from './deps';
const toStr = str => isArray( str ) ? str[ 0 ] : str;
let hasDeepTransform = ( transformer, isDeep = true ) => {

        let { keys, values } = props( transformer )



        return values.some( function ( cur ) {

            if ( isStringOrArr( cur ) ) {

                return levelOfTransform( toStr( cur ) ) > 1;

            } else if ( isDeep && isObj( cur ) ) {

                return hasDeepTransform( cur );

            } else {
                //i guess no other case is it relevant
                return false;
            }

        } );
    },
    postTransform = ( transformer ) => {

        return ( traverse( transformer, ( value, i, key ) => {

            let val = null;

            if ( isStringOrArr( value ) ) {

                let str = toStr( value );
                val = str.slice( levelOfTransform( str ) * 2 );

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

        let passesTest = value => {

            if ( !isObj( value ) ) {

                if ( isStringOrArr( value ) ) {
                    return levelOfTransform( toStr( value ) ) < 2;

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
        } ).filter( a => a !== false );

    },
    findDeepTransforms = ( transformer, notTransforms = true ) => {

        return traverse( transformer, ( cur, i, value ) => {
            //[boolean checking if immediate values in the object have deeptransforms needed, index]
            return hasDeepTransform( createObj( cur, value ), true ) === notTransforms ? [ cur, value ] : false;

        }, false, true ).filter( a => a ).map( cur => {
            let [ key, val ] = cur

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

                let str = toStr( value ),
                    num = levelOfTransform( str );
                val = [ ( str.slice( num * 2 ) ), num ];

            } else {

                val = deepTraversal( value )[ 0 ];
                val[ 0 ] = `${key},${val[ 0 ]}`;

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

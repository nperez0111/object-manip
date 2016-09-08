import {
    traverse,
    createObj
} from './utils';

import {
    isString,
    isFunc,
    isArray,
    hasOwnProp,
    isObj,
    isCircular,
    isInCorrectFormat,
    is
} from './deps';

export function transformerTypesInCorrect( transformer ) {
    return isInCorrectFormat( transformer, {}, function ( val ) {
        if ( isString( val ) || isFunc( val ) ) {
            return false;
        }
        if ( isArray( val ) ) {
            if ( isString( val[ 0 ] ) ) {
                return false;
            }
            if ( val.length == 2 ) {
                if ( isString( val[ 0 ] ) && isFunc( val[ 1 ] ) ) {
                    return false;
                }
            }
        }
        return true;
    } )
}

export function transformerIsInCorrectFormat( transformer ) {
    if ( checkIfIsCircular( transformer ) || transformerTypesInCorrect( transformer ) ) {
        return false;
    }
    return true;
}

export function onlyPropertiesThatCorrespondBetween( obj, transformer ) {
    let tKeys = Object.keys( transformer ).filter( function ( cur ) {
        return hasOwnProp( obj, cur );
    } );

    return createObj( tKeys, tKeys.map( function ( key ) {
        let val = transformer[ key ];
        if ( isObj( val ) ) {
            return onlyPropertiesThatCorrespondBetween( obj[ key ], val );
        }
        return val;
    } ) );
}

export function dataIsInCorrectFormat( data ) {
    if ( checkIfIsCircular( data ) ) {
        return false;
    }
    return true;
}

function checkIfIsCircular( obj ) {
    if ( isObj( obj ) && isCircular( obj ) ) {
        //just a check as this is a recursive method
        console.warn( 'Circular reference found and is unsupported. exiting...' );
        return true;
    }
    return false;
}

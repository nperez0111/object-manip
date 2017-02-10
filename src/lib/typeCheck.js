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
    return !isInCorrectFormat( transformer, {}, function ( val ) {
        if ( isString( val ) || isFunc( val ) ) {
            return true;
        }
        if ( isArray( val ) ) {
            if ( isString( val[ 0 ] ) ) {
                return true;
            }
            if ( val.length == 2 ) {
                if ( isString( val[ 0 ] ) && isFunc( val[ 1 ] ) ) {
                    return true;
                }
            }
        }
        return false;
    } )
}

export function transformerIsInCorrectFormat( transformer ) {
    return !( checkIfIsCircular( transformer ) || transformerTypesInCorrect( transformer ) )
}

export function onlyPropertiesThatCorrespondBetween( obj, transformer ) {
    let tKeys = Object.keys( transformer ).filter( cur => {
        return hasOwnProp( obj, cur );
    } );

    return createObj( tKeys, tKeys.map( key => {
        let val = transformer[ key ];
        if ( isObj( val ) ) {
            return onlyPropertiesThatCorrespondBetween( obj[ key ], val );
        }
        return val;
    } ) );
}

export function dataIsInCorrectFormat( data ) {
    return !( checkIfIsCircular( data ) )
}

function checkIfIsCircular( obj ) {
    if ( isObj( obj ) && isCircular( obj ) ) {
        //just a check as this is a recursive method
        console.warn( 'Circular reference found and is unsupported. exiting...' );
        return true;
    }
    return false;
}

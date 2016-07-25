import {
    traverse,
    createObj
} from './utils';

const isCircular = require( 'is-circular' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isString = require( 'validate.io-string' ),
    isArray = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' );

export function transformerTypesInCorrect( transformer ) {

    return traverse( transformer, function ( val ) {
        return val;
    } ).some( function ( val, index, key ) {
        if ( isString( val ) ) {
            return false;
        }
        if ( isArray( val ) ) {
            if ( isString( val[ 0 ] ) ) {
                return false;
            }
            if ( isArray( val ) && val.length == 2 ) {
                if ( isString( val[ 0 ] ) && isFunc( val[ 1 ] ) ) {
                    return false;
                }
            }
            console.warn( "Transformer's key:'" + key + "' is not specified properly, must be in the format [String Relocator, Transform Function]. You Specified:" + JSON.stringify( val ) );
            return true;
        }
        if ( isFunc( val ) ) {
            return false;
        }
        if ( isObj( val ) ) {
            return transformerTypesInCorrect( val );
        }
        console.warn( "You specified a type that is not associated with a transformer object. You entered: '" + val + "' with a type of: '" + ( typeof val ) + "' on key:'" + key + "'" );
        return true;
    } );
}

export function transformerIsInCorrectFormat( transformer ) {
    if ( checkIfIsCircular( transformer ) ) {
        return false;
    }
    if ( transformerTypesInCorrect( transformer ) ) {
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

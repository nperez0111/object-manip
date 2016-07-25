import {
    reducer,
    makeObj,
    valueOf,
    createObj
} from './utils';

const isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArray = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    isStringOrArr = function ( a ) {
        return isString( a ) || isArray( a );
    };

export function actualCopy( placement, valueObj ) {
    let get = ( str, obj ) => {

        let arr = str.split( ',' ).map( cur => cur.split( '.' ) ).reduce( ( a, b ) => a.concat( b ), [] ),
            ret = obj;

        if ( !isObj( obj ) ) {
            //if something passed in the second arg return the array they want.
            return arr;

        }

        arr.forEach( cur => {
            ret = ret[ cur ];
        } );

        return ret;

    };
    return reducer( placement.map( function ( cur ) {
        let cal = get( cur[ 0 ] );
        //fix bug where splitting via , shoul be handled seperate from .
        return makeObj( get( cur[ 0 ], valueObj ), cal.slice( cal.length - 1 < cur[ 1 ] ? 0 : cur[ 1 ] ) );
    } ) );
}

export function parseRelocator( str, cur, keys, values, func, thisArg ) {
    let back = false;
    if ( str.charAt( 0 ) == '.' && str.charAt( 1 ) == '/' ) {
        str = str.slice( 2 );
        back = true;
    }

    let props = str.split( '.' ),
        value = func ? valueOf( values[ cur ], func, thisArg ) : values[ cur ];

    if ( back == false ) {

        keys[ cur ] = props.shift();
        values[ cur ] = props.length == 0 ? value : makeObj( value, props );
        return [ keys, values ];

    }

    keys.splice( cur, 1 );
    values.splice( cur, 1 );
    let obj = props.length == 1 ? createObj( str, value ) : makeObj( value, props );
    return [ keys, values, [ obj, props[ 0 ] ] ];

    /*returns in format [keys,values,[optional val to set]]*/

}

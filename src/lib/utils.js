import {
    isArray
} from './deps';

export function createObj( keys, values ) {
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

// makeOBj(123,[a,b,c])=={a:{b:{c:123}}}
export function makeObj( val, props ) {
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

export function reducer( val ) {

    return val.reduce( function ( acc, obj ) {

        if ( isArray( obj ) ) {

            return Object.assign( {}, acc, reducer( obj ) );

        }

        return Object.assign( {}, acc, obj );

    }, {} );
}
export function levelOfTransform( str, num ) {
    var arr = Array.from( str );
    if ( arr.shift() == '.' && arr.shift() == '/' ) {
        return levelOfTransform( arr.join( '' ), ( num || 0 ) + 1 );
    }
    return num || 0;
}

export function traverse( objecto, funct, shouldReduce, useKeys ) {
    let keys = Object.keys( objecto ),
        values = keys.map( function ( cur ) {
            return objecto[ cur ];
        } );
    if ( useKeys ) {
        let temp = values;
        values = keys;
        keys = temp;
        temp = null;
    }
    let mapper = values.map( function ( val, index ) {

        return funct( val, index, keys[ index ] );

    } );

    if ( shouldReduce ) {

        mapper = reducer( mapper );

    }

    return mapper;
}

export function valueOf( val, func, thisArg ) {
    if ( isArray( val ) ) {

        return val.map( ( currentValue, index, arr ) => {
            return func.call( thisArg, currentValue, index, arr );
        } );

    }
    //maybe add another thing into the call

    return func.call( thisArg, val );
}

const isString = require( 'validate.io-string' ),
    curry = require( 'curry' ),
    isFunc = require( 'isfunction' ),
    isObj = require( 'isobject' ),
    isArray = require( 'isarray' ),
    hasOwnProp = require( 'has-own-prop' ),
    isStringOrArr = function ( a ) {
        return isString( a ) || isArray( a );
    };
export {
    isString
};
export {
    curry
};
export {
    isFunc
};
export {
    isArray
};
export {
    hasOwnProp
};
export {
    isStringOrArr
};
export {
    isObj
};

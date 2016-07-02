var man = require( './../index.js' );
var equal = require( 'deep-equal' );

console.assert( equal( man.transform( {
    a: function ( b ) {
        return b + 1;
    }

}, {
    a: 1
} ), { a: 2 } ) );

man.settings.reverse = true;

console.assert( equal( man.transform( {
    a: 1
}, {
    a: function ( b ) {
        return b + 1;
    }

} ), { a: 2 } ) );

man.settings.reverse = false;


console.assert( equal( man.transform( {
    a: {
        b: function ( b ) {
            return b + 1;
        }
    }

}, {
    a: { b: 1 }
} ), { a: { b: 2 } } ) );

console.assert( equal( man.transform( {
    a: function ( b ) {
        return b + 1;
    }

}, {
    a: [ 1 ]
} ), { a: [ 2 ] } ) );

console.assert( equal( man.transform( {
    a: 'b'
}, {
    a: 1
} ), { b: 1 } ) );
console.assert( equal( man.transform( {
    a: 'b.a.c'

}, {
    a: 1
} ), { b: { a: { c: 1 } } } ) );

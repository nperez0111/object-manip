var man = require( './../index.js' );
var equal = require( 'deep-equal' );

console.assert( equal( man.transform( {
    a: function ( b ) {
        return b + 1;
    }

}, {
    a: 1
} ), {
    a: 2
} ) );

man.settings.reverse = true;

console.assert( equal( man.transform( {
    a: 1
}, {
    a: function ( b ) {
        return b + 1;
    }

} ), {
    a: 2
} ) );

man.settings.reverse = false;


console.assert( equal( man.transform( {
    a: {
        b: function ( b ) {
            return b + 1;
        }
    }

}, {
    a: {
        b: 1
    }
} ), {
    a: {
        b: 2
    }
} ) );

console.assert( equal( man.transform( {
    a: function ( b ) {
        return b + 1;
    }

}, {
    a: [ 1 ]
} ), {
    a: [ 2 ]
} ) );

console.assert( equal( man.transform( {
    a: 'b'
}, {
    a: 1
} ), {
    b: 1
} ) );
console.assert( equal( man.transform( {
    a: 'b.a.c'

}, {
    a: 1
} ), {
    b: {
        a: {
            c: 1
        }
    }
} ) );

console.assert( equal( man.transform( {
    a: {
        b: {
            c: function ( a ) {
                return a + 1
            }
        },
        d: function ( s ) {
            return s + 1;
        }
    }

}, {
    a: {
        b: {
            c: [ 1, 2, 3 ]
        },
        d: 3
    }
} ), {
    a: {
        b: {
            c: [ 2, 3, 4 ]
        },
        d: 4
    }
} ) );

console.assert( equal( man.transform( {
    a: [ 'b', function ( a ) {
        return a + 1
    } ]

}, {
    a: 1
} ), {
    b: 2
} ) );
console.assert( equal( man.transform( {
    a: [ 'b', function ( a ) {
        return a + 1
    } ]

}, {
    a: [ 1, 2, 3 ]
} ), {
    b: [ 2, 3, 4 ]
} ) );

console.assert( equal( man.transform( {
    a: [ 'b.c', function ( a ) {
        return a + 1
    } ]

}, {
    a: [ 1, 2, 3 ]
} ), {
    b: {
        c: [ 2, 3, 4 ]
    }
} ) );

console.assert( equal( man.transform( {
    a: {
        b: './c'
    }
}, {
    a: {
        b: 1
    }
} ), {
    a: {},
    c: 1
} ) );

console.assert( equal( man.transform( {
    a: {
        b: [ './c', function ( a ) {
            return a + 1;
        } ]
    }
}, {
    a: {
        b: 1
    }
} ), {
    a: {},
    c: 2
} ) );

console.assert( equal( ( man.transform( {
    a: {
        b: [ './c', function ( a ) {
            return a + 1;
        } ],
        d: 212
    }
}, {
    a: {
        b: 1,
        d: 212
    }
} ) ), {
    a: {
        d: 212
    },
    c: 2
} ) );

console.assert( equal( ( man.transform( {
    a: './b'
}, {
    a: 1
} ) ), {
    b: 1
} ) );

console.assert( equal( ( man.transform( {
    a: {
        c: './c'
    }
}, man.transform( {
    a: {
        d: {
            b: [ './c', function ( a ) {
                return a + 1;
            } ]
        }
    }
}, {
    a: {
        d: {
            b: 1
        }
    }
} ) ) ), {
    a: {},
    c: 2
} ) );

console.assert( man.hasDeepTransform( {
    a: '././a'
} ) );

console.assert( equal( man.findDeepTransforms( {} ), [] ) );
console.assert( equal( ( man.findDeepTransforms( {
    a: '././a'
} ) ), [ {
    a: '././a'
} ] ) );
console.assert( equal( man.findDeepTransforms( {
    a: '././a',
    b: {
        c: '././b'
    }
} ), [ {
    a: '././a'
}, {
    b: {
        c: '././b'
    }
} ] ) );
console.assert( equal( man.findDeepTransforms( {
    a: '././a',
    b: {
        c: '././b',
        e: 2
    },
    l: 3
} ), [ {
    a: '././a'
}, {
    b: {
        c: '././b'
    }
} ] ) );

console.assert( equal( man.findDeepTransforms( {
    a: '././a',
    b: {
        c: '././b',
        e: '././d'
    },
    l: 3
} ), [ {
    a: '././a'
}, {
    b: {
        c: '././b',
        e: '././d'
    }
} ] ) );

//work on multilevel backward movements, possibly
//use a function prior to transform to automagically generate multiple transfroms 

function log( a ) {
    console.log( a );
    return a;
}

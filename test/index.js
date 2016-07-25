var man = require( './../bin/index.js' );
var equal = require( 'deep-equal' );
console.time( 'Test took' );
assert( man.transform( {
    a: function ( b ) {
        return b + 1;
    }

}, {
    a: 1
} ), {
    a: 2
} );

man.settings.reverse = true;

assert( man.transform( {
    a: 1
}, {
    a: function ( b ) {
        return b + 1;
    }

} ), {
    a: 2
} );

man.settings.reverse = false;


assert( man.transform( {
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
} );

assert( man.transform( {
    a: function ( b ) {
        return b + 1;
    }

}, {
    a: [ 1 ]
} ), {
    a: [ 2 ]
} );

assert( man.transform( {
    a: 'b'
}, {
    a: 1
} ), {
    b: 1
} );
assert( man.transform( {
    a: 'b.a.c'

}, {
    a: 1
} ), {
    b: {
        a: {
            c: 1
        }
    }
} );

assert( man.transform( {
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
} );

assert( man.transform( {
    a: [ 'b', function ( a ) {
        return a + 1
    } ]

}, {
    a: 1
} ), {
    b: 2
} );
assert( man.transform( {
    a: [ 'b', function ( a ) {
        return a + 1
    } ]

}, {
    a: [ 1, 2, 3 ]
} ), {
    b: [ 2, 3, 4 ]
} );

assert( man.transform( {
    a: [ 'b.c', function ( a ) {
        return a + 1
    } ]

}, {
    a: [ 1, 2, 3 ]
} ), {
    b: {
        c: [ 2, 3, 4 ]
    }
} );

assert( man.transform( {
    a: {
        b: './c'
    }
}, {
    a: {
        b: 1
    }
} ), {
    c: 1
} );

assert( man.transform( {
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
    c: 2
} );

assert( ( man.transform( {
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
} );

assert( ( man.transform( {
    a: './b'
}, {
    a: 1
} ) ), {
    b: 1
} );

assert( ( man.transform( {
    a: './b.k'
}, {
    a: 1
} ) ), {
    b: {
        k: 1
    }
} );

assert( ( man.transform( {
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
    c: 2
} );

console.assert( man.hasDeepTransform( {
    a: '././a'
} ) );

assert( man.findDeepTransforms( {} ), [] );

assert( ( man.findDeepTransforms( {
    a: '././a'
} ) ), [ {
    a: '././a'
} ] );
assert( man.findDeepTransforms( {
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
} ] );
assert( man.findDeepTransforms( {
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
} ] );

assert( man.findDeepTransforms( {
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
} ] );


assert( man.transform.deep( {
    a: '././b.c',
    q: {
        b: {
            c: [ '././d', function ( a ) {
                return a + 1;
            } ],
            e: function ( w ) {
                return w / 2;
            }
        },
        d: function ( e ) {
            return e - 1;
        }
    },
    e: function ( a ) {
        return a + 1;
    }
}, {
    a: 12,
    q: {
        e: 123,
        b: {
            c: [ 12, 13 ],
            e: 34
        },
        d: 3
    },
    e: 34
} ), {
    q: {
        b: {
            e: 17
        },
        d: 2
    },
    e: 35,
    b: {
        c: 12
    },
    d: [ 13, 14 ]
} );

assert( man.transform.deep( {
    a: 'b',
    q: {
        b: {
            c: [ '././d', function ( a ) {
                return a + 1;
            } ],
            e: function ( w ) {
                return w / 2;
            }
        },
        d: function ( e ) {
            return e - 1;
        }
    },
    e: function ( a ) {
        return a + 1;
    }
}, {
    a: 12,
    q: {
        e: 123,
        b: {
            c: 12,
            e: 34
        },
        d: 3
    },
    e: 34
} ), {
    q: {
        b: {
            e: 17
        },
        d: 2
    },
    e: 35,
    b: 12,
    d: 13
} );

assert( ( man.transform.deep( {
    a: {
        b: {
            d: '././c'
        }
    }
}, {
    a: {
        b: {
            d: 12
        }
    }
} ) ), {
    c: 12
} );
assert( ( man.transform.deep( {
    a: {
        b: {
            d: '././c'
        }
    }
}, {
    a: {
        b: {
            d: [ "ok" ]
        }
    }
} ) ), {
    c: [ "ok" ]
} );

assert( man.transform( {
    a: {
        b: 'c'
    }
}, {
    a: {
        b: 1,
        c: 2
    }
} ), {
    a: {
        c: 1
    }
} );

assert( man.transform( {
    a: {
        b: 'c',
        d: 'c'
    }
}, {
    a: {
        b: 1,
        c: 2,
        d: 3
    }
} ), {
    a: {
        c: 3
    }
} );

man.settings.thisArg = {
    x: 12,
    y: 14
};

assert( man.transform( {
    a: function ( d ) {
        return d + this.x;
    }
}, {
    a: 3
} ), {
    a: 15
} );

assert( man( {
    a: function ( d ) {
        return d;
    },
    e: function ( a ) {
        return a
    }
}, {
    e: 3
} ), {
    e: 3
} )

console.timeEnd( 'Test took' );

function log( a ) {
    console.log( a );
    return a;
}

function assert( a, b ) {
    var bool = equal( a, b );
    if ( !bool ) {
        console.trace( a, b );
    }
    console.assert( bool );
}

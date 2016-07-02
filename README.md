Object-Manip
============

Manipulates POJOs

Usage
=======

##Simple

````JS
var manip = require('object-manip'),
	transformer = {
			a:function(x){
				return x+1;
				}
		},
	original = {
		a:1
	};
	manip(transformer,original)
	//{ a: 2 }

````

##Reverse

````JS

	manip.reverse=true;

	manip(original,transformer)
	//{ a: 2 }

	
````

##Array Transform

````JS
	original = {
		a:[ 1, 2, 3 ]
	}
	transformer = {
		a: function( currentValue, index, arr ){
			return currentValue + index;
		}
	}
	manip(original,transformer)
	//{ a: [ 1, 3, 4 ] }

````

##Relocator Transform

````JS
	original = {
		a: 2
	}
	transformer = {
		a: 'b.c.d'
	}
	manip(original,transformer)
	//{ a: { b: { c: { d: 2 } } } }

````

##Relocator Transform and Transform function

````JS
	original = {
		a: 2
	}
	transformer = {
		a: ['b.c',function (x){return x + 1;}
	}
	manip(original,transformer)
	//{ a: { b: { c: 3 } } }
````

###With Arrays

````JS
	original = {
		a: [ 2, 3, 4 ]
	}
	transformer = {
		a: ['b.c',function ( current, index ){ return current + index; }
	}
	manip(original,transformer)
	//{ a: { b: { c: [ 2, 4, 5 ] } } }

````
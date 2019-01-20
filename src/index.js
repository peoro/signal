
'use strict';

function noop(){}

class Handler {
	constructor( fn, id=fn ) {
		this.fn = fn;
		this.id = id;
	}
}

class Signal {
	constructor( ) {
		this.handlers = [];
	}

	addHandler( fn, {id, n=-1}={} ) {
		const handler = new Handler( fn, id );

		switch( n ) {
			case -1: {
				this.handlers.push( handler );
				break;
			}
			case 0: {
				this.handlers.unshift( handler );
				break;
			}
			default: {
				this.handlers.splice( n, 0, handler );
			}
		}

		return this;
	}

	removeHandler( id, {n=1}={} ) {
		const handlers = this.handlers;
		const len = handlers.length;
		let i = 0, j;

		if( n < 1 ) {
			return 0;
		}

		// removing the first matching handler
		{
			while( i < len) {
				if( handlers[i].id !== id ) {
					++i;
					continue;
				}

				// found a match
				handlers[i].fn = noop;
				break;
			}
		}

		// if we didn't find anytihng, returning now
		if( i === handlers.length ) {
			return 0;
		}

		// if I had to remove more than one, removing the ohters while shifting everything...
		// remember that we already found the first match
		let matches = 1;
		if( n > 1 ) {
			for( j = i+matches; j < len; ++j ) {
				const handler = handlers[j];
				handlers[i] = handler; // shifting the current handler

				if( handler.id !== id ) {
					++i;
					continue;
				}

				// found another match
				handler.fn = noop;
				++matches;
				if( matches === n ) {
					break;
				}
			}
		}

		// shifting the remaining elements
		for( j = i+matches; j < len; ++j, ++i ) {
			handlers[i] = handlers[j]; // shifting the current handler
		}
		handlers.length = i;

		return matches;
	}

	trigger() {
		const handlers = this.handlers;
		const len = handlers.length;

		const handlersCopy = new Array( len );

		let i = len;
		while( i ) {
			-- i;
			handlersCopy[i] = handlers[i];
		}

		while( i < len ) {
			handlersCopy[i].fn( ...arguments );
			++ i;
		}

		return this;
	}
}

module.exports = {
	noop,
	Handler,
	Signal,
};

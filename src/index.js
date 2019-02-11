
'use strict';

const assert = require('assert');
const {noop, destructor, initDestroyable} = require('@peoro/destroy');

const signalRef = Symbol();
const callback = Symbol();

class Handler {
	constructor( signal, fn ) {
		assert.strictEqual( typeof fn, 'function' );
		initDestroyable( this );
		this[signalRef] = signal;
		this[callback] = fn;
	}

	[destructor]() {
		const signal = this[signalRef];
		const {handlers} = signal;
		const len = handlers.length;
		let i = 0;

		while( i < len) {
			if( handlers[i] !== this ) {
				++i;
				continue;
			}

			// handler found
			signal.removeNthHandler( i );
			return;
		}
	}
}

class Signal {
	constructor( ) {
		this.handlers = [];
	}

	addHandler( fn, {n=-1}={} ) {
		const handler = new Handler( this, fn );

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

		return handler;
	}
	// NOTE: returns the removed handler without `destroying()` it!
	removeNthHandler( i ) {
		const {handlers} = this;
		const len = handlers.length;

		assert( i >= 0 && i < len, `${i} ∉ [0..${len})` );

		const handler = handlers[i];
		handler[callback] = noop;

		// shifting all the remaining handlers by one, overriding the current one
		while( i < len ) {
			handlers[i] = handlers[i+1]; // shifting the current handler
			++i;
		}
		handlers.length = len - 1;

		return handler;
	}
	// NOTE: returns the removed handler without `destroying()` it!
	removeHandler( fn ) {
		const {handlers} = this;
		const len = handlers.length;
		let i = 0;

		while( i < len) {
			if( handlers[i][callback] !== fn ) {
				++i;
				continue;
			}
			// handler found
			return this.removeNthHandler( i );
		}
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
			handlersCopy[i][callback]( ...arguments );
			++ i;
		}

		return this;
	}
}

module.exports = {
	noop,

	signalRef,
	callback,

	Handler,
	Signal,
};

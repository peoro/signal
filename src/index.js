
'use strict';

const {noop, destructor, initDestroyable} = require('@peoro/destroy');

const signalRef = Symbol();
const callback = Symbol();

class Handler {
	constructor( signal, fn ) {
		initDestroyable( this );
		this[signalRef] = signal;
		this[callback] = fn;
	}

	[destructor]() {
		this[callback] = noop;

		const {handlers} = this[signalRef];
		let len = handlers.length;
		let i = 0;

		// finding this handler
		while( i < len) {
			if( handlers[i] !== this ) {
				++i;
				continue;
			}
			break;
		}

		// this not found (it was already destroyed)
		if( i >= len ) {
			return;
		}

		// shifting all the remaining handlers by one, overriding the current one
		while( i < len ) {
			handlers[i] = handlers[i+1]; // shifting the current handler
			++i;
		}
		handlers.length = len - 1;
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

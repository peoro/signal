
'use strict';

const assert = require('assert');
const sinon = require('sinon');

const {noop, Handler, Signal} = require('../src/index.js');

describe( `@peoro/signal`, function(){
	describe( `Signal`, function(){
		it(`addHandler()`, function(){
			const spy = sinon.spy();
			const sig = new Signal();

			assert.deepEqual( sig.handlers, [] );

			sig.addHandler( spy );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy),
			]);

			sig.addHandler( spy, {id:`hey`} );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy),
				new Handler(spy, `hey`),
			]);

			sig.addHandler( spy, {id:`yo`, n:0} );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy, `yo`),
				new Handler(spy),
				new Handler(spy, `hey`),
			]);

			sig.addHandler( spy, {id:noop, n:2} );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy, `yo`),
				new Handler(spy),
				new Handler(spy, noop),
				new Handler(spy, `hey`),
			]);

			assert( spy.notCalled );
		});

		it(`removeHandler()`, function(){
			const spy = sinon.spy();
			const sig = new Signal();
			let res;

			sig.addHandler( spy, {id:`x`} )
				.addHandler( spy, {id:`y`} )
				.addHandler( spy )
				.addHandler( spy, {id:`y`} )
				.addHandler( spy, {id:`z`} )
				.addHandler( spy )
				.addHandler( spy, {id:`y`} )
				.addHandler( spy, {id:`y`} )
				.addHandler( spy );

			const startHandlers = [
				new Handler(spy, `x`),
				new Handler(spy, 'y'),
				new Handler(spy),
				new Handler(spy, 'y'),
				new Handler(spy, `z`),
				new Handler(spy),
				new Handler(spy, 'y'),
				new Handler(spy, 'y'),
				new Handler(spy),
			];

			assert.deepStrictEqual( sig.handlers, startHandlers );

			res = sig.removeHandler( `missing` );
			assert.strictEqual( res, 0 );
			assert.deepStrictEqual( sig.handlers, startHandlers );

			res = sig.removeHandler( 'x', {n:0} );
			assert.strictEqual( res, 0 );
			assert.deepStrictEqual( sig.handlers, startHandlers );

			res = sig.removeHandler( 'y' );
			assert.strictEqual( res, 1 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy, `x`),
				new Handler(spy),
				new Handler(spy, 'y'),
				new Handler(spy, `z`),
				new Handler(spy),
				new Handler(spy, 'y'),
				new Handler(spy, 'y'),
				new Handler(spy),
			]);

			res = sig.removeHandler( 'y', {n:2} );
			assert.strictEqual( res, 2 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy, `x`),
				new Handler(spy),
				new Handler(spy, `z`),
				new Handler(spy),
				new Handler(spy, 'y'),
				new Handler(spy),
			]);

			res = sig.removeHandler( spy, {n:Infinity} );
			assert.strictEqual( res, 3 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy, `x`),
				new Handler(spy, `z`),
				new Handler(spy, 'y'),
			]);

			res = sig.removeHandler( `x`, {n:2} );
			assert.strictEqual( res, 1 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(spy, `z`),
				new Handler(spy, 'y'),
			]);
		});

		it(`trigger()`, function(){
			const spies = [sinon.spy(), sinon.spy(), sinon.spy()];
			const sig = new Signal();

			// this should do nothing
			sig.trigger();

			// triggering spies
			sig.addHandler( spies[0] )
				.addHandler( spies[1] )
				.addHandler( spies[1] )
				.addHandler( spies[2] )
				.addHandler( spies[1] )
				.trigger();

			// checking calls
			assert( spies[0].calledOnce );
			assert( spies[1].calledThrice );
			assert( spies[2].calledOnce );

			// checking order
			assert( spies[0].getCall(0).calledImmediatelyBefore( spies[1].getCall(0) ) );
			assert( spies[1].getCall(0).calledImmediatelyBefore( spies[1].getCall(1) ) );
			assert( spies[1].getCall(1).calledImmediatelyBefore( spies[2].getCall(0) ) );
			assert( spies[2].getCall(0).calledImmediatelyBefore( spies[1].getCall(2) ) );
		});

		it(`trigger(args)`, function(){
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const sig = new Signal();

			sig.addHandler( spy1 )
				.addHandler( spy2 )
				.addHandler( spy2 )
				.trigger( `a`, spy1 );

			assert( spy1.alwaysCalledWithExactly(`a`, spy1) );
			assert( spy2.alwaysCalledWithExactly(`a`, spy1) );
		});

		it(`removeHandler() removes immediately`, function(){
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const sig = new Signal();

			sig
				.addHandler( ()=>{
					sig.removeHandler( spy1 );
					sig.removeHandler( spy2 );
				})
				.addHandler( spy1 )
				.addHandler( spy2 )
				.addHandler( spy1 );
			sig.trigger();

			assert( spy1.calledOnce );
			assert( spy2.notCalled );
		});
	});
});

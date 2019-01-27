
'use strict';

const assert = require('assert');
const sinon = require('sinon');

const {destroy} = require('@peoro/destroy');
const {Handler, Signal} = require('../src/index.js');

describe( `@peoro/signal`, function(){
	describe( `Signal`, function(){
		it(`addHandler()`, function(){
			const spy1 = sinon.spy(), spy2 = sinon.spy();
			const sig = new Signal();

			assert.deepEqual( sig.handlers, [] );

			sig.addHandler( spy1 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy1),
			]);

			sig.addHandler( spy2 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy1),
				new Handler(sig, spy2),
			]);

			sig.addHandler( spy2, {n:0} );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy2),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
			]);

			sig.addHandler( spy1 );
			sig.addHandler( spy1 );
			sig.addHandler( spy2 );
			sig.addHandler( spy1 );
			sig.addHandler( spy2 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy2),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
				new Handler(sig, spy1),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
			]);

			assert( spy1.notCalled );
			assert( spy2.notCalled );
		});

		it(`destroy( handler )`, function(){
			const spy1 = sinon.spy(), spy2= sinon.spy();
			const sig = new Signal();

			sig.addHandler( spy1 );
			sig.addHandler( spy1 );
			sig.addHandler( spy2 );
			sig.addHandler( spy1 );
			sig.addHandler( spy2 );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy1),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
			]);

			destroy( sig.handlers[3] );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy1),
				new Handler(sig, spy1),
				new Handler(sig, spy2),
				new Handler(sig, spy2),
			]);

			let handle = sig.handlers[1];
			destroy( handle );
			destroy( handle );
			destroy( handle );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy1),
				new Handler(sig, spy2),
				new Handler(sig, spy2),
			]);

			destroy( sig.handlers[0] );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy2),
				new Handler(sig, spy2),
			]);

			destroy( sig.handlers[0] );
			assert.deepStrictEqual( sig.handlers, [
				new Handler(sig, spy2),
			]);

			destroy( sig.handlers[0] );
			assert.deepStrictEqual( sig.handlers, [] );
		});

		it(`trigger()`, function(){
			const spies = [sinon.spy(), sinon.spy(), sinon.spy()];
			const sig = new Signal();

			// this should do nothing
			sig.trigger();

			// triggering spies
			sig.addHandler( spies[0] );
			sig.addHandler( spies[1] );
			sig.addHandler( spies[1] );
			sig.addHandler( spies[2] );
			sig.addHandler( spies[1] );
			sig.trigger();

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

			sig.addHandler( spy1 );
			sig.addHandler( spy2 );
			sig.addHandler( spy2 );
			sig.trigger( `a`, spy1 );

			assert( spy1.alwaysCalledWithExactly(`a`, spy1) );
			assert( spy2.alwaysCalledWithExactly(`a`, spy1) );
		});

		it(`remove(handler) removes immediately`, function(){
			const spy1 = sinon.spy();
			const spy2 = sinon.spy();
			const sig = new Signal();

			sig.addHandler( ()=>{
				destroy( handle2 );
				destroy( handle3 );
			});
			const handle2 = sig.addHandler( spy1 );
			const handle3 = sig.addHandler( spy2 );
			sig.addHandler( spy1 );
			sig.trigger();

			assert( spy1.calledOnce );
			assert( spy2.notCalled );
		});
	});
});

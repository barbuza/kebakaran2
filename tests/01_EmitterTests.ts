import * as assert from 'power-assert';
import { RefMock } from './support/RefMock';

describe('Emitter', () => {
  it('should handle `on` and `once` listeners', () => {
    const emitter = new RefMock<string>();
    assert.ok(!emitter.isOpen);

    let foo: string | undefined = undefined;
    let bar: string | undefined = undefined;

    emitter.on('value', value => {
      foo = value;
    });
    assert.ok(emitter.isOpen);

    emitter.once('value', value => {
      bar = value;
    });
    emitter.fakeEmit('spam');
    assert.equal(foo, 'spam');
    assert.equal(bar, 'spam');

    emitter.fakeEmit('eggs');
    assert.equal(foo, 'eggs');
    assert.equal(bar, 'spam');
  });

  it('should handle `once` in instant mode', () => {
    const emitter = new RefMock<string>();
    let value: string | undefined = undefined;

    emitter.fakeEmit('foo');

    emitter.once('value', val => {
      value = val;
    });
    assert.equal(value, 'foo');

    emitter.fakeEmit('bar');
    assert.equal(value, 'foo');
  });

  it('should handle invalid event name', () => {
    const emitter = new RefMock<string>();

    assert.throws(() => {
      emitter.on('spam', () => null);
    }, /unknown event/);
  });

  it('should work with promices', done => {
    const emitter = new RefMock<string>();

    emitter.once('value').then(value => {
      assert.equal(value, 'foo');
      done();
    });

    emitter.fakeEmit('foo');
  });

  it('should work with promises in instant mode', done => {
    const emitter = new RefMock<string>();

    emitter.fakeEmit('foo');

    emitter.once('value').then(value => {
      assert.equal(value, 'foo');
      done();
    });
  });
});

import * as assert from 'power-assert';
import { Listener } from '../lib/Listener';

describe('Listener', () => {
  it('stores context as undefined', () => {
    const ok = new Listener<string>(value => assert.equal(value, 'foo'), null);
    assert.equal(ok.getContext(), null);
    ok.call('foo');
  });

  it('handles once param', () => {
    const fail = new Listener<string>(value => assert.equal(value, 'foo'), null, true);
    fail.call('foo');
    assert.throws(() => {
      fail.call('bar');
    }, /twice/);
  });

  it('should provide promises on `once` mode', done => {
    const fail = new Listener<string>(() => undefined, null);
    assert.throws(() => {
      fail.getPromise();
    }, /once/);

    const foo = new Listener<string>(() => done(), null, true);
    assert.ok(foo.getPromise());
    foo.call('bar');
  });
});

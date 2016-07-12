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
});

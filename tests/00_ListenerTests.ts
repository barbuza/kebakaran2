import * as tape from 'tape';
import { Listener } from '../lib/Listener';

tape('Listener', (t: tape.Test) => {
  t.plan(4);

  const ok = new Listener<string>(value => t.equal(value, 'foo'), null);
  t.is(ok.getContext(), undefined);
  ok.call('foo');

  const fail = new Listener<string>(value => t.equal(value, 'foo'), null, true);
  fail.call('foo');

  t.throws(() => {
    fail.call('var');
  }, /twice/);
});
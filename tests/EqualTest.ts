import * as tape from 'tape';
import * as Immutable from 'immutable';

import { Equal } from '../lib/Equal';
import { RefMock } from './RefMock';

tape('Equal basic', (t: tape.Test) => {
  const ref = new RefMock<Array<string>>();
  const eq = new Equal<Array<string>>(ref);
  
  t.plan(2);

  const listener = (value: Array<string>) => {
    t.deepEqual(value, ['foo', 'bar']);
  };

  eq.on('value', listener);

  ref.fakeEmit(['foo', 'bar']);
  ref.fakeEmit(['foo', 'bar']);

  eq.off('value', listener);

  t.false(ref.isOpen);
});

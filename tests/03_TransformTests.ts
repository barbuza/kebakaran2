import * as tape from 'tape';
import { RefMock } from './support/RefMock';
import { Transform } from '../lib/Transform';

tape('Transform basic', (t: tape.Test) => {
  const foo = new RefMock<number>();
  const transform = new Transform<number, number>(foo, x => x + 1);

  let val: number | undefined = undefined;

  const listener = (value: number) => {
    val = value;
  };

  transform.on('value', listener);
  t.true(foo.isOpen);

  foo.fakeEmit(1);
  t.equal(val, 2);

  transform.off('value', listener);
  t.false(foo.isOpen);

  t.end();
});

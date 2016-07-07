import * as tape from 'tape';
import { RefMock } from './support/RefMock';

tape('Emitter', (t: tape.Test) => {
  const emitter = new RefMock<string>();
  t.false(emitter.isOpen);

  let foo: string = undefined;
  let bar: string = undefined;

  emitter.on('value', value => {
    foo = value;
  });

  t.true(emitter.isOpen);

  emitter.once('value', value => {
    bar = value;
  });

  emitter.fakeEmit('spam');

  t.equal(foo, 'spam');
  t.equal(bar, 'spam');

  emitter.fakeEmit('eggs');

  t.equal(foo, 'eggs');
  t.equal(bar, 'spam');

  t.end();
});

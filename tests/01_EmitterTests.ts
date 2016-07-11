import * as tape from 'tape';
import { RefMock } from './support/RefMock';

tape('Emitter basic', (t: tape.Test) => {
  const emitter = new RefMock<string>();
  t.false(emitter.isOpen);

  let foo: string | undefined = undefined;
  let bar: string | undefined = undefined;

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

tape('Emitter once', (t: tape.Test) => {
  const emitter = new RefMock<string>();

  t.plan(1);

  emitter.once('value', value => {
    t.equal(value, 'foo');
  });

  emitter.fakeEmit('foo');
  emitter.fakeEmit('bar');
});

tape('Emitter once instant', (t: tape.Test) => {
  const emitter = new RefMock<string>();

  t.plan(1);

  emitter.fakeEmit('foo');

  emitter.once('value', value => {
    t.equal(value, 'foo');
  });

  emitter.fakeEmit('bar');
});

tape('Emitter invalid event', (t: tape.Test) => {
  const emitter = new RefMock<string>();

  t.throws(() => {
    emitter.on('spam', () => null);
  }, /unknown event/);

  t.end();
});

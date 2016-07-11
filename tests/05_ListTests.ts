import * as tape from 'tape';
import { List } from '../lib/List';
import { RefMock } from './support/RefMock';

tape('List basic', (t: tape.Test) => {
  const keys = new RefMock<Array<number>>();

  const children = [
    new RefMock<string>(),
    new RefMock<string>()
  ];

  const list = new List<number, string>(keys, (key: number) => children[key]);

  let val: Array<string> | undefined = undefined;

  const listener = (value: Array<string>) => {
    val = value;
  };

  list.on('value', listener);

  keys.fakeEmit([0, 1]);
  children[0].fakeEmit('foo');
  children[1].fakeEmit('bar');

  t.deepEqual(val, ['foo', 'bar']);

  list.off('value', listener);

  t.false(keys.isOpen);
  t.false(children[0].isOpen);
  t.false(children[1].isOpen);

  children[1].resetValue();
  val = undefined;

  list.on('value', listener);
  t.false(val);

  children[1].fakeEmit('eggs');
  t.deepEqual(val, ['foo', 'eggs']);

  children[0].fakeEmit('spam');
  t.deepEqual(val, ['spam', 'eggs']);

  t.end();
});

tape('List internals', (t: tape.Test) => {
  const keys = new RefMock<Array<number>>();

  const children = [
    new RefMock<string>(),
    new RefMock<string>()
  ];

  const list = new List<number, string>(keys, key => children[key]);

  let value: Array<string> | undefined = undefined;
  list.on('value', val => {
    value = val;
  });

  children[0].fakeEmit('foo');
  children[1].fakeEmit('bar');

  keys.fakeEmit([0]);
  t.deepEqual(value, ['foo']);

  keys.fakeEmit([0, 1]);
  t.deepEqual(value, ['foo', 'bar']);

  keys.fakeEmit([1]);
  t.deepEqual(value, ['bar']);

  keys.fakeEmit([1, 0]);
  t.deepEqual(value, ['bar', 'foo']);

  t.end();
});

tape('List once', (t: tape.Test) => {
  const keys = new RefMock<Array<number>>();

  const children = [
    new RefMock<string>(),
    new RefMock<string>()
  ];

  const list = new List<number, string>(keys, key => children[key]);
  let value: Array<string> | undefined = undefined;

  children[0].fakeEmit('foo');
  children[1].fakeEmit('bar');

  keys.fakeEmit([0]);
  list.once('value', val => {
    value = val;
  });
  t.deepEqual(value, ['foo']);

  keys.fakeEmit([0, 1]);
  list.once('value', val => {
    value = val;
  });
  t.deepEqual(value, ['foo', 'bar']);

  keys.fakeEmit([1]);
  list.once('value', val => {
    value = val;
  });
  t.deepEqual(value, ['bar']);

  keys.fakeEmit([1, 0]);
  list.once('value', val => {
    value = val;
  });
  t.deepEqual(value, ['bar', 'foo']);

  t.end();
});

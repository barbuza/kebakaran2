import * as tape from 'tape';

import { Struct } from '../lib/Struct';
import { RefMock } from './RefMock';

tape('Struct basic', (t: tape.Test) => {
  const foo = new RefMock<string>();
  const bar = new RefMock<number>();

  interface StructValue {
    foo: string;
    bar: number;
  }

  const struct = new Struct<StructValue>({ foo, bar });

  t.false(foo.isOpen);
  t.false(bar.isOpen);

  let val: StructValue = undefined;

  const listener = (value: StructValue) => {
    val = value;
  };

  struct.on('value', listener);

  t.true(foo.isOpen);
  t.true(bar.isOpen);

  foo.fakeEmit('spam');

  t.false(val);

  bar.fakeEmit(1);

  t.deepEqual(val, { foo: 'spam', bar: 1 });

  struct.off('value', listener);

  t.false(foo.isOpen);
  t.false(bar.isOpen);

  val = undefined;

  struct.on('value', listener);

  t.deepEqual(val, { foo: 'spam', bar: 1 });

  struct.off('value', listener);
  foo.resetValue();
  bar.resetValue();

  val = undefined;

  struct.on('value', listener);

  t.false(val);

  t.end();
});

tape('Struct nested', (t: tape.Test) => {
  const foo = new RefMock<string>();

  interface ChildValue {
    foo: string;
  }

  interface ParentValue {
    child: ChildValue;
  }

  const child = new Struct<ChildValue>({ foo });
  const parent = new Struct<ParentValue>({ child });

  t.false(foo.isOpen);

  let val: ParentValue = undefined;

  const listener = (value: ParentValue) => {
    val = value;
  };

  parent.on('value', listener);

  foo.fakeEmit('bar');

  t.deepEqual(val, { child: { foo: 'bar' } });

  parent.off('value', listener);

  t.false(foo.isOpen);

  t.end();
});

tape('Struct once', (t: tape.Test) => {

  const foo = new RefMock<string>();
  const bar = new RefMock<number>();

  interface StructValue {
    foo: string;
    bar: number;
  }

  const struct = new Struct<StructValue>({ foo, bar });

  foo.fakeEmit('spam');
  bar.fakeEmit(1);

  t.plan(3);

  struct.once('value', val => {
    t.deepEqual(val, {
      foo: 'spam',
      bar: 1
    });
  });

  t.false(foo.isOpen);
  t.false(bar.isOpen);
});
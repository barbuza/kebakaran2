import * as tape from 'tape';
import { Struct } from '../lib/Struct';
import { RefMock } from './support/RefMock';

tape('Struct basic', (t: tape.Test) => {
  const foo = new RefMock<string>();
  const bar = new RefMock<number>();

  interface IStructValue {
    foo: string;
    bar: number;
  }

  const struct = new Struct<IStructValue>({ foo, bar });

  t.false(foo.isOpen);
  t.false(bar.isOpen);

  let val: IStructValue | undefined = undefined;

  const listener = (value: IStructValue) => {
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

  interface IChildValue {
    foo: string;
  }

  interface IParentValue {
    child: IChildValue;
  }

  const child = new Struct<IChildValue>({ foo });
  const parent = new Struct<IParentValue>({ child });

  t.false(foo.isOpen);

  let val: IParentValue | undefined = undefined;

  const listener = (value: IParentValue) => {
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

  interface IStructValue {
    foo: string;
    bar: number;
  }

  const struct = new Struct<IStructValue>({ foo, bar });

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

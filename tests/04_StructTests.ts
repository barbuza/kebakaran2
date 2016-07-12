import * as assert from 'power-assert';
import { Struct } from '../lib/Struct';
import { RefMock } from './support/RefMock';

describe('Struct', () => {
  it('should work with flat refs', () => {
    const foo = new RefMock<string>();
    const bar = new RefMock<number>();

    interface IStructValue {
      foo: string;
      bar: number;
    }

    const struct = new Struct<IStructValue>({ foo, bar });

    assert.ok(!foo.isOpen);
    assert.ok(!foo.isOpen);

    let val: IStructValue | undefined = undefined;

    const listener = (value: IStructValue) => {
      val = value;
    };

    struct.on('value', listener);

    assert.ok(foo.isOpen);
    assert.ok(foo.isOpen);

    foo.fakeEmit('spam');

    assert.ok(!val);

    bar.fakeEmit(1);

    assert.deepEqual(val, { foo: 'spam', bar: 1 });

    struct.off('value', listener);

    assert.ok(!foo.isOpen);
    assert.ok(!bar.isOpen);

    val = undefined;

    struct.on('value', listener);

    assert.deepEqual(val, { foo: 'spam', bar: 1 });

    struct.off('value', listener);
    foo.resetValue();
    bar.resetValue();

    val = undefined;

    struct.on('value', listener);

    assert.ok(!val);
  });

  it('should work with nested structs', () => {
    const foo = new RefMock<string>();

    interface IChildValue {
      foo: string;
    }

    interface IParentValue {
      child: IChildValue;
    }

    const child = new Struct<IChildValue>({ foo });
    const parent = new Struct<IParentValue>({ child });

    assert.ok(!foo.isOpen);

    let val: IParentValue | undefined = undefined;

    const listener = (value: IParentValue) => {
      val = value;
    };

    parent.on('value', listener);

    foo.fakeEmit('bar');

    assert.deepEqual(val, { child: { foo: 'bar' } });

    parent.off('value', listener);

    assert.ok(!foo.isOpen);
  });

  it('should work with `once` listeners', () => {
    const foo = new RefMock<string>();
    const bar = new RefMock<number>();

    interface IStructValue {
      foo: string;
      bar: number;
    }

    const struct = new Struct<IStructValue>({ foo, bar });

    foo.fakeEmit('spam');
    bar.fakeEmit(1);

    let value: IStructValue| undefined = undefined;

    struct.once('value', val => {
      value = val;
    });

    assert.deepEqual(value, {
      foo: 'spam',
      bar: 1
    });

    assert.ok(!foo.isOpen);
    assert.ok(!bar.isOpen);
  });
});

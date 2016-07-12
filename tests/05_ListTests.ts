import * as assert from 'power-assert';
import { List } from '../lib/List';
import { RefMock } from './support/RefMock';

describe('List', () => {
  it('should work with plain refs', () => {
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

    assert.deepEqual(val, ['foo', 'bar']);

    list.off('value', listener);

    assert.ok(!keys.isOpen);
    assert.ok(!children[0].isOpen);
    assert.ok(!children[1].isOpen);

    children[1].resetValue();
    val = undefined;

    list.on('value', listener);
    assert.ok(!val);

    children[1].fakeEmit('eggs');
    assert.deepEqual(val, ['foo', 'eggs']);

    children[0].fakeEmit('spam');
    assert.deepEqual(val, ['spam', 'eggs']);
  });

  it('should handle changing key set', () => {
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
    assert.deepEqual(value, ['foo']);

    keys.fakeEmit([0, 1]);
    assert.deepEqual(value, ['foo', 'bar']);

    keys.fakeEmit([1]);
    assert.deepEqual(value, ['bar']);

    keys.fakeEmit([1, 0]);
    assert.deepEqual(value, ['bar', 'foo']);
  });

  it('should handle `once` listeners', () => {
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
    assert.deepEqual(value, ['foo']);

    keys.fakeEmit([0, 1]);
    list.once('value', val => {
      value = val;
    });
    assert.deepEqual(value, ['foo', 'bar']);

    keys.fakeEmit([1]);
    list.once('value', val => {
      value = val;
    });
    assert.deepEqual(value, ['bar']);

    keys.fakeEmit([1, 0]);
    list.once('value', val => {
      value = val;
    });
    assert.deepEqual(value, ['bar', 'foo']);
  });
});

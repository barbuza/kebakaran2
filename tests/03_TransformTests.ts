import * as assert from 'power-assert';
import { RefMock } from './support/RefMock';
import { Transform } from '../lib/Transform';
import { NestedSnapshotMock } from './support/NestedSnapshotMock';
import { SnapshotMock } from './support/SnapshotMock';

describe('Transform', () => {
  it('should apply basic transformation', () => {
    const foo = new RefMock<number>();
    const transform = new Transform<number, number>(foo, x => x + 1);

    let val: number | undefined = undefined;

    const listener = (value: number) => {
      val = value;
    };

    transform.on('value', listener);
    assert.ok(foo.isOpen);

    foo.fakeEmit(1);
    assert.equal(val, 2);

    transform.off('value', listener);
    assert.ok(!foo.isOpen);
  });

  it('should extract keys with static `keys` method', () => {
    const foo = new RefMock<NestedSnapshotMock<boolean>>();
    const transform = Transform.keys(foo);

    let value: Array<string>| undefined = undefined;

    transform.on('value', val => {
      value = val;
    });

    foo.fakeEmit(new NestedSnapshotMock<boolean>('parent', [
      new SnapshotMock<boolean>('foo', true),
      new SnapshotMock<boolean>('bar', true)
    ]));

    assert.deepEqual(value, ['foo', 'bar']);
  });

  it('should extract values with static `values` method', () => {
    const foo = new RefMock<NestedSnapshotMock<string>>();
    const transform = Transform.values(foo);
    let value: Array<string> | undefined = undefined;

    transform.on('value', val => {
      value = val;
    });

    foo.fakeEmit(new NestedSnapshotMock<string>('parent', [
      new SnapshotMock<string>('0', 'foo'),
      new SnapshotMock<string>('1', 'bar')
    ]));

    assert.deepEqual(value, ['foo', 'bar']);
  });
});

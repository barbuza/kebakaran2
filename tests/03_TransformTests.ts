import * as tape from 'tape';
import { RefMock } from './support/RefMock';
import { Transform } from '../lib/Transform';
import { NestedSnapshotMock } from './support/NestedSnapshotMock';
import { SnapshotMock } from './support/SnapshotMock';

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

tape('Transform keys', (t: tape.Test) => {
  const foo = new RefMock<NestedSnapshotMock<boolean>>();
  const transform = Transform.keys(foo);

  t.plan(1);

  transform.on('value', value => {
    t.deepEqual(value, ['foo', 'bar']);
  });

  foo.fakeEmit(new NestedSnapshotMock<boolean>('parent', [
    new SnapshotMock<boolean>('foo', true),
    new SnapshotMock<boolean>('bar', true)
  ]));
});

tape('Transform values', (t: tape.Test) => {
  const foo = new RefMock<NestedSnapshotMock<string>>();
  const transform = Transform.values(foo);

  t.plan(1);

  transform.on('value', value => {
    t.deepEqual(value, ['foo', 'bar']);
  });

  foo.fakeEmit(new NestedSnapshotMock<string>('parent', [
    new SnapshotMock<string>('0', 'foo'),
    new SnapshotMock<string>('1', 'bar')
  ]));
});

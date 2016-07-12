import * as assert from 'power-assert';
import { Equal } from '../lib/Equal';
import { RefMock } from './support/RefMock';

describe('Equal', () => {
  it('should emit once for similar values', () => {
    const ref = new RefMock<Array<string>>();
    const eq = new Equal<Array<string>>(ref);

    let value: Array<string> | undefined = undefined;
    let count: number = 0;

    const listener = (val: Array<string>) => {
      value = val;
      count += 1;
    };

    eq.on('value', listener);

    ref.fakeEmit(['foo', 'bar']);
    ref.fakeEmit(['foo', 'bar']);

    assert.deepEqual(value, ['foo', 'bar']);
    assert.equal(count, 1);

    eq.off('value', listener);

    assert.ok(!ref.isOpen);
  });
});

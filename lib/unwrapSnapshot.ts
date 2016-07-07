function isSnapshot<T>(value: any): value is kebakaran.ISnapshot<T> {
  return value && typeof value === 'object' && typeof value.val === 'function';
} 

export function unwrapSnapshot<T>(value: T | kebakaran.ISnapshot<T>): T {
  if (isSnapshot(value)) {
    return value.val();
  } else {
    return value;
  }
}

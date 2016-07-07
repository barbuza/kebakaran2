import { SnapshotMock } from './SnapshotMock';

export class NestedSnapshotMock<T> extends SnapshotMock<Array<SnapshotMock<T>>> implements kebakaran.INestedSnapshot<T> {

  forEach(childAction: (child: kebakaran.ISnapshot<T>)=>(void|boolean)): void {
    for (const child of this.val()) {
      if (childAction(child) === true) {
        break;
      }
    }
  }

}

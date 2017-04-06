import { INestedSnapshot } from "../../INestedSnapshot";
import { ISnapshot } from "../../ISnapshot";
import { SnapshotMock } from "./SnapshotMock";

export class NestedSnapshotMock<T> extends SnapshotMock<Array<SnapshotMock<T>>>
  implements INestedSnapshot<T> {

  public forEach(childAction: (child: ISnapshot<T>) => (void | boolean)): void {
    for (const child of this.val()) {
      childAction(child);
    }
  }

}

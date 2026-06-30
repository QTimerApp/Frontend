"use client";

import { AddModal } from "./Add";
import { AverageModal } from "./Average";
import { DeleteModal } from "./Delete";
import { EditSessionModal } from "./EditSession";
import { SolveModal } from "./Solve";
import { ShareModal } from "./Share";

export function ModalContainer() {
  return (
    <>
      <AddModal />
      <AverageModal />
      <DeleteModal />
      <EditSessionModal />
      <SolveModal />
      <ShareModal />
    </>
  );
}

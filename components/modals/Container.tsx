"use client";

import { useModal, ModalType } from "@/lib/contexts/Modal";
import dynamic from "next/dynamic";

const AddModal = dynamic(() => import("./Add").then((m) => ({ default: m.AddModal })), { ssr: false });
const AverageModal = dynamic(() => import("./Average").then((m) => ({ default: m.AverageModal })), { ssr: false });
const DeleteModal = dynamic(() => import("./Delete").then((m) => ({ default: m.DeleteModal })), { ssr: false });
const EditSessionModal = dynamic(() => import("./EditSession").then((m) => ({ default: m.EditSessionModal })), { ssr: false });
const SolveModal = dynamic(() => import("./Solve").then((m) => ({ default: m.SolveModal })), { ssr: false });
const ShareModal = dynamic(() => import("./Share").then((m) => ({ default: m.ShareModal })), { ssr: false });

export function ModalContainer() {
  const { activeModal } = useModal();

  return (
    <>
      {activeModal === ModalType.AddSession && <AddModal />}
      {activeModal === ModalType.AverageDetails && <AverageModal />}
      {activeModal === ModalType.Delete && <DeleteModal />}
      {activeModal === ModalType.EditSession && <EditSessionModal />}
      {activeModal === ModalType.SolveDetails && <SolveModal />}
      {activeModal === ModalType.Share && <ShareModal />}
    </>
  );
}

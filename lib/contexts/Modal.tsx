"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { ModalType, DeleteTarget, type ModalData } from "@/types/modal";

export { ModalType, DeleteTarget };
export type { ModalData };

interface ModalContextValue {
  activeModal: ModalType | null;
  modalData: ModalData;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [modalData, setModalData] = useState<ModalData>({});

  const openModal = useCallback(
    (type: ModalType, data?: ModalData) => {
      setActiveModal(type);
      setModalData(data ?? {});
    },
    [],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalData({});
  }, []);

  const value = useMemo(
    () => ({ activeModal, modalData, openModal, closeModal }),
    [activeModal, modalData, openModal, closeModal],
  );

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within a ModalProvider");
  return ctx;
}

"use client";

import FloatingActionButton from "@/lib/components/commonV2/FloatingActionButton";
import Modal from "@/lib/components/commonV2/Modal";
import Navbar from "@/lib/components/commonV2/Navbar";
import Toaster from "@/lib/components/commonV2/Toaster";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

const Context = createContext({
  modalType: null,
  user: null,
  setModalType: (_modalType: string | null) => {},
  setToasterType: (_toasterType: string | null) => {},
});

export function useAppContext() {
  return useContext(Context);
}

export default function ({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isHydrated, setIsHydrated] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [toasterType, setToasterType] = useState(null);
  const [user, setUser] = useState(null);
  const contextValue = { modalType, user, setModalType, setToasterType };

  useEffect(() => {
    const argonLink = document.getElementById("argon-css");
    const lineAwesomeLink = document.getElementById("line-awesome");
    const storedUser = localStorage.getItem("user");

    if (argonLink) {
      argonLink.remove();
    }

    if (lineAwesomeLink) {
      lineAwesomeLink.remove();
    }

    if (storedUser) {
      const parseStoredUser = JSON.parse(storedUser);
      setUser(parseStoredUser);
    } else {
      setUser(null);
    }

    setIsHydrated(true);
    sessionStorage.removeItem("hasChanges");
  }, [pathname, searchParams]);

  if (!isHydrated) return null;

  return (
    <Context.Provider value={contextValue}>
      <main>
        {modalType && (
          <Modal modalType={modalType} setModalType={setModalType} />
        )}
        {toasterType && (
          <Toaster toasterType={toasterType} setToasterType={setToasterType} />
        )}
        <Navbar />
        <FloatingActionButton />
        {children}
      </main>
    </Context.Provider>
  );
}

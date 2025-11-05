"use client";

import Modal from "@/lib/components/common/Modal";
import Navbar from "@/lib/components/common/Navbar";
import { createContext, useContext, useEffect, useState } from "react";

interface ContextProps {
  modalType: string;
  user: any;
  setModalType: (modalType: string) => void;
}

const Context = createContext<ContextProps>({
  modalType: null,
  user: null,
  setModalType: () => {},
});

export function contextProvider() {
  return useContext(Context);
}

export default function ({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [modalType, setModalType] = useState("");
  const [user, setUser] = useState(null);
  const contextValue = {
    modalType,
    user,
    setModalType,
  };

  useEffect(() => {
    if (isHydrated) return;

    const argonLink = document.getElementById("argon-css");
    const lineAwesomeLink = document.getElementById("line-awesome");
    const user = localStorage.getItem("user");

    if (argonLink) {
      argonLink.remove();
    }

    if (lineAwesomeLink) {
      lineAwesomeLink.remove();
    }

    if (user) {
      setUser(JSON.parse(user));
    }

    setIsHydrated(true);
    sessionStorage.removeItem("hasChanges");
  }, []);

  return (
    <>
      <Context.Provider value={contextValue}>
        <main>
          {isHydrated && (
            <>
              {modalType && (
                <Modal modalType={modalType} setModalType={setModalType} />
              )}
              <Navbar />
              {children}
            </>
          )}
        </main>
      </Context.Provider>
    </>
  );
}

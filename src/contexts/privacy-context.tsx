"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

type PrivacyContextValue = {
  isPrivate: boolean;
  toggle: () => void;
};

const PrivacyContext = createContext<PrivacyContextValue>({
  isPrivate: false,
  toggle: () => {},
});

const STORAGE_KEY = "ic-portal-privacy-mode";

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    setIsPrivate(localStorage.getItem(STORAGE_KEY) === "true");
  }, []);

  const toggle = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  };

  return (
    <PrivacyContext.Provider value={{ isPrivate, toggle }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export const usePrivacy = () => useContext(PrivacyContext);

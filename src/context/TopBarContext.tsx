import { createContext, useContext, useState, ReactNode } from "react";

interface TopBarContextType {
  titleRef: HTMLElement | null;
  setTitleRef: (el: HTMLElement | null) => void;
  backOverride: string | null;
  setBackOverride: (s: string | null) => void;
  actionsRef: HTMLElement | null;
  setActionsRef: (el: HTMLElement | null) => void;
}

const TopBarContext = createContext<TopBarContextType | null>(null);

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [titleRef, setTitleRef] = useState<TopBarContextType['titleRef']>(null);
  const [backOverride, setBackOverride] = useState<TopBarContextType['backOverride']>(null);
  const [actionsRef, setActionsRef] = useState<TopBarContextType['actionsRef']>(null);

  return (
    <TopBarContext.Provider
      value={{
        titleRef,
        setTitleRef,
        backOverride: backOverride,
        setBackOverride: setBackOverride,
        actionsRef,
        setActionsRef,
      }}>
      {children}
    </TopBarContext.Provider>
  );
};

export const useTopBar = () => {
  const context = useContext(TopBarContext);
  if (!context) throw new Error("useTopBar must be used within a TopBarProvider");
  return context;
};
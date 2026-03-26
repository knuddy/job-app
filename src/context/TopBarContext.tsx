import { createContext, useContext, useState, ReactNode } from "react";

interface TopBarContextType {
  titleRef: HTMLElement | null;
  setTitleRef: (el: HTMLElement | null) => void;
  actionsRef: HTMLElement | null;
  setActionsRef: (el: HTMLElement | null) => void;
  actionCount: number;
  notifyActionRegistered: () => void;
  notifyActionUnregistered: () => void;
  backOverride: string | null;
  setBackOverride: (s: string | null) => void;
  iconActionsRef: HTMLElement | null;
  setIconActionsRef: (el: HTMLElement | null) => void;
  iconActionsCount: number;
  notifyIconActionRegistered: () => void;
  notifyIconActionUnregistered: () => void;
}

const TopBarContext = createContext<TopBarContextType | null>(null);

export const TopBarProvider = ({ children }: { children: ReactNode }) => {
  const [titleRef, setTitleRef] = useState<TopBarContextType['titleRef']>(null);
  const [actionsRef, setActionsRef] = useState<TopBarContextType['actionsRef']>(null);
  const [actionCount, setActionCount] = useState(0);
  const [backOverride, setBackOverride] = useState<TopBarContextType['backOverride']>(null);
  const [iconActionsRef, setIconActionsRef] = useState<TopBarContextType['actionsRef']>(null);
  const [iconActionsCount, setIconActionsCount] = useState(0);

  const notifyActionRegistered = () => setActionCount(prev => prev + 1);
  const notifyActionUnregistered = () => setActionCount(prev => prev - 1);

  const notifyIconActionRegistered = () => setIconActionsCount(prev => prev + 1);
  const notifyIconActionUnregistered = () => setIconActionsCount(prev => prev - 1);

  return (
    <TopBarContext.Provider
      value={{
        titleRef,
        setTitleRef,
        actionsRef,
        setActionsRef,
        actionCount,
        notifyActionRegistered,
        notifyActionUnregistered,
        backOverride: backOverride,
        setBackOverride: setBackOverride,
        iconActionsRef,
        setIconActionsRef,
        iconActionsCount,
        notifyIconActionRegistered,
        notifyIconActionUnregistered,
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
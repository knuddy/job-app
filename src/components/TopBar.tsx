import { useLocation, useNavigate } from "react-router-dom";
import { useTopBar } from "@src/context/TopBarContext.tsx";
import { createPortal } from "react-dom";
import { useEffect } from "react";
import {
  IonHeader,
  IonButton,
  IonButtons,
  IonIcon,
  IonToolbar, IonTitle
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';

const TopBarBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { backOverride } = useTopBar();

  if (location.pathname === '/') return null;

  const handleBack = () => {
    if (backOverride) {
      navigate(backOverride);
    } else if (location.key !== 'default') {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  return (
    <IonButton fill="clear" onClick={handleBack}>
      <IonIcon slot="icon-only" icon={arrowBackOutline}/>
    </IonButton>
  )
};

const TopBarAction = ({ icon, onClick }: { icon: string, onClick: () => void }) => {
  return (
    <IonButton fill="clear" onClick={onClick}>
      <IonIcon slot="icon-only" icon={icon}/>
    </IonButton>
  );
};


export const TopBar = () => {
  const { setTitleRef, setActionsRef } = useTopBar();

  return (
    <IonHeader>
      <IonToolbar color="dark">
        <IonButtons slot="start">
          <TopBarBackButton/>
        </IonButtons>
        <IonTitle ref={setTitleRef}/>
        <IonButtons slot="end" ref={setActionsRef}>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
}

TopBar.Title = ({ text }: { text: string }) => {
  const { titleRef } = useTopBar();
  if (!titleRef) return null;
  return createPortal(text, titleRef);
};

TopBar.Action = ({ icon, onClick }: { icon: string, onClick: () => void }) => {
  const { actionsRef } = useTopBar();
  if (!actionsRef) return null;
  return createPortal(<TopBarAction icon={icon} onClick={onClick}/>, actionsRef);
};

TopBar.Back = ({ to }: { to: string }) => {
  const { setBackOverride } = useTopBar();
  useEffect(() => {
    setBackOverride(to);
    return () => setBackOverride(null);
  }, [to, setBackOverride]);
  return null;
};
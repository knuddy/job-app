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
import { arrowBackOutline, ellipsisVertical } from 'ionicons/icons';

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

const TopBarMenuItem = ({ text, onClick }: { text: string, onClick: () => void }) => {
  return (
    <li>
      <button className="dropdown-item" onClick={onClick} type="button">
        {text}
      </button>
    </li>
  );
};


const TopBarIcon = ({ icon, onClick }: { icon: string, onClick: () => void }) => {
  return (
    <IonButton fill="clear" color="dark" onClick={onClick}>
      <IonIcon slot="icon-only" icon={icon}/>
    </IonButton>
  );
};


export const TopBar = () => {
  const { setTitleRef, setActionsRef, actionCount, setIconActionsRef, iconActionsCount } = useTopBar();

  return (
    <IonHeader className="ion-no-border border">
      <IonToolbar>
        <IonButtons slot="start">
          <TopBarBackButton/>
        </IonButtons>
        <IonTitle ref={setTitleRef}/>
        <IonButtons slot="end">
          {iconActionsCount > 0 && (
            <div ref={setIconActionsRef} className="d-flex"></div>
          )}
          {actionCount > 0 && (
            <div className="dropdown ms-1">
              <IonButton fill="clear" color="dark" data-bs-toggle="dropdown">
                <IonIcon slot="icon-only" icon={ellipsisVertical} />
              </IonButton>
              <ul ref={setActionsRef} className="dropdown-menu dropdown-menu-end"></ul>
            </div>
          )}
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

TopBar.IconAction = ({ icon, onClick }: { icon: string, onClick: () => void }) => {
  const { iconActionsRef, notifyIconActionRegistered, notifyIconActionUnregistered } = useTopBar();

  useEffect(() => {
    notifyIconActionRegistered();
    return () => notifyIconActionUnregistered();
  }, []);

  if (!iconActionsRef) return null;

  return createPortal(<TopBarIcon icon={icon} onClick={onClick}/>, iconActionsRef);
};

TopBar.Action = ({ text, onClick }: { text: string, onClick: () => void }) => {
  const { actionsRef, notifyActionRegistered, notifyActionUnregistered } = useTopBar();

  useEffect(() => {
    notifyActionRegistered();
    return () => notifyActionUnregistered();
  }, []);

  if (!actionsRef) return null;

  return createPortal(<TopBarMenuItem text={text} onClick={onClick}/>, actionsRef);
};

TopBar.Back = ({ to }: { to: string }) => {
  const { setBackOverride } = useTopBar();
  useEffect(() => {
    setBackOverride(to);
    return () => setBackOverride(null);
  }, [to, setBackOverride]);
  return null;
};
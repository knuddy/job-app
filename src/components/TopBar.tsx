import { useLocation, useNavigate } from "react-router-dom";
import { useTopBar } from "@src/context/TopBarContext.tsx";
import { createPortal } from "react-dom";
import { useEffect } from "react";

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
    <button className="btn btn-link fs-1 p-0 rounded-0 lh-1 me-2" onClick={handleBack}>
      <i className="bi bi-arrow-left-short align-middle"></i>
    </button>
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


const TopBarIcon = ({ iconName, onClick }: { iconName: string, onClick: () => void }) => {
  return (
    <button className="btn btn-link link-secondary p-0 fs-4 lh-1"  type="button">
      <i onClick={onClick} className={`bi ${iconName}`}></i>
    </button>
  );
};


export const TopBar = () => {
  const { setTitleRef, setActionsRef, actionCount, setIconActionsRef, iconActionsCount } = useTopBar();

  return (
    <header className="d-flex align-items-center py-2 px-3 border-bottom border-opacity-10">
      <TopBarBackButton/>
      <h5 ref={setTitleRef} className="topbar-title display-6 text-truncate me-auto mb-0 lh-base"></h5>
      {iconActionsCount > 0 && (
        <div ref={setIconActionsRef}></div>
      )}
      {actionCount > 0 && (
        <div className="dropdown ms-2">
          <button className="btn btn-link text-dark p-0" type="button" data-bs-toggle="dropdown">
            <i className="bi bi-three-dots-vertical fs-3"></i>
          </button>
          <ul ref={setActionsRef} className="dropdown-menu dropdown-menu-end"></ul>
        </div>
      )}
    </header>
  );
}

TopBar.Title = ({ text }: { text: string }) => {
  const { titleRef } = useTopBar();
  if (!titleRef) return null;
  return createPortal(text, titleRef);
};

TopBar.IconAction = ({ iconName, onClick }: { iconName: string, onClick: () => void }) => {
  const { iconActionsRef, notifyIconActionRegistered, notifyIconActionUnregistered } = useTopBar();

  useEffect(() => {
    notifyIconActionRegistered();
    return () => notifyIconActionUnregistered();
  }, []);

  if (!iconActionsRef) return null;

  return createPortal(<TopBarIcon iconName={iconName} onClick={onClick}/>, iconActionsRef);
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
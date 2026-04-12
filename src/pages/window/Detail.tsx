import { TopBar } from "@src/components/TopBar.tsx";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getWindow, type WindowWithCount } from '@src/db/queries/window.ts';
import { deletePanel, getPanels, type Panel } from '@src/db/queries/panel.ts';
import {
  IonActionSheet,
  IonIcon,
  IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonLabel,
  IonList,
  IonSkeletonText,
} from '@ionic/react';
import * as icons from 'ionicons/icons';
import { useConfirmation } from '@src/hooks/useConfirmation.ts';

export default function Detail() {
  const { windowId } = useParams<{ windowId: string }>();
  const navigate = useNavigate();
  const [window, setWindow] = useState<WindowWithCount | null>();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoading, setShowLoading] = useState(false);

  const windowIdNumber = Number(windowId);

  const refreshPanelList = async () => setPanels(await getPanels(windowIdNumber));

  const {
    selectedItem,
    openConfirmation,
    dismiss,
    executeAction,
    isOpen
  } = useConfirmation<Panel>(async (selected) => {
    await deletePanel(selected.id);
    void refreshPanelList();
  });

  useEffect(() => {
    const timer = setTimeout(() => setShowLoading(true), 200);

    async function loadData() {
      setLoading(true);
      try {
        const [windowQuery, panelsQuery] = await Promise.all([getWindow(windowIdNumber), getPanels(windowIdNumber)]);
        setWindow(windowQuery);
        setPanels(panelsQuery);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        clearTimeout(timer);
      }
    }

    void loadData();
  }, [windowId]);

  if (loading && !showLoading) return null;
  if (loading) return <DetailSkeleton/>;
  if (!window?.id) throw new Response("Window Not Found", { status: 404, statusText: "Window Not Found" });

  return (
    <>
      <TopBar.Title text={`${window.displayText}`}/>

      <IonList lines="full" className="ion-no-padding">
        {panels.map(panel => {
          return (
            <IonItemSliding key={panel.id}>
              <IonItem button detail={false} onClick={() => navigate(`/panel/${panel.id}`)}>
                <IonLabel>{panel.id}</IonLabel>
                <IonIcon slot="end" icon={icons.chevronForwardOutline} color="medium"/>
              </IonItem>
              <IonItemOptions side="end">
                <IonItemOption
                  color="danger"
                  expandable={true}
                  onClick={() => openConfirmation(panel)}
                >
                  <IonIcon slot="icon-only" icon={icons.trashOutline}/>
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          )
        })}
      </IonList>

      <IonActionSheet
        isOpen={isOpen}
        header={`Delete ${selectedItem?.id}?`}
        subHeader="This action cannot be undone."
        onDidDismiss={dismiss}
        buttons={[
          { text: 'Confirm', role: 'destructive', icon: icons.trashOutline, handler: executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: dismiss },
        ]}
      />
    </>
  );
}

function DetailSkeleton() {
  return (
    <IonList>
      <IonItem>
        <IonSkeletonText animated style={{ width: '60%' }}></IonSkeletonText>
      </IonItem>
      <IonItem>
        <IonSkeletonText animated style={{ width: '80%' }}/>
      </IonItem>
    </IonList>
  );
}
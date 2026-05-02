import { TopBar } from "@src/components/TopBar.tsx";
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { getWindow, type WindowWithCount } from '@src/db/queries/window.ts';
import { deletePanel, getPanels, duplicatePanel, type PanelWithOrdinal } from '@src/db/queries/panel.ts';
import {
  IonActionSheet,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonNote,
  IonSegment,
  IonSegmentButton,
} from '@ionic/react';
import * as icons from 'ionicons/icons';
import { useConfirmation } from '@src/hooks/useConfirmation.ts';

export default function Detail() {
  const { windowId } = useParams<{ windowId: string }>();
  const navigate = useNavigate();
  const [window, setWindow] = useState<WindowWithCount | null>();
  const [panels, setPanels] = useState<PanelWithOrdinal[]>([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef<HTMLIonListElement>(null);
  const [activeTab, setActiveTab] = useState<'panels' | 'extras'>('panels');


  const windowIdNumber = Number(windowId);

  const refreshPanelList = async () => {
    if (listRef.current) {
      await listRef.current.closeSlidingItems();
    }
    setPanels(await getPanels(windowIdNumber));
  };

  const deleteAction = useConfirmation<PanelWithOrdinal>(async (selected) => {
    await deletePanel(selected.id);
    void refreshPanelList();
  });

  const duplicateAction = useConfirmation<PanelWithOrdinal>(async (selected) => {
    await duplicatePanel(selected);
    void refreshPanelList();
  });

  useEffect(() => {
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
      }
    }

    void loadData();
  }, [windowId]);

  if (loading) return null;
  if (!window?.id) throw new Response("Window Not Found", { status: 404, statusText: "Window Not Found" });

  return (
    <>
      <TopBar.Title text={`${window.displayText}`}/>

      <IonSegment
        value={activeTab}
        onIonChange={(e) => setActiveTab(e.detail.value as any)}
        style={{ padding: '8px 0' }}
      >
        <IonSegmentButton value="panels">
          <IonLabel>Panels ({panels.length})</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="extras">
          <IonLabel>Extras</IonLabel>
        </IonSegmentButton>
      </IonSegment>

      {activeTab === 'panels' && (
        <IonList ref={listRef} lines="full" className="ion-no-padding">
          {panels.map(panel => {
            return (
              <IonItemSliding key={panel.id}>
                <IonItem button detail={true} onClick={() => navigate(`/panel/${panel.id}`)}>
                  <IonLabel>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ fontWeight: 'bold' }}>Panel {panel.ordinal}</h2>
                    </div>
                    <p style={{ fontSize: '0.85rem' }}>
                      {panel.styleType}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>
                      {panel.safetyType} • {panel.glassType}
                    </p>
                  </IonLabel>

                  <div slot="end" style={{
                    display: 'flex',
                    alignItems: 'center',
                    height: '100%',
                    marginRight: '8px'
                  }}>
                    <IonNote style={{
                      fontSize: '0.95rem',
                      fontWeight: '500',
                      color: 'var(--ion-color-step-800)'
                    }}>
                      {panel.width}×{panel.height}<small style={{ fontSize: '0.7rem', color: 'var(--ion-color-medium)' }}>mm</small>
                    </IonNote>
                  </div>


                </IonItem>

                <IonItemOptions side="start">
                  <IonItemOption
                    color="primary"
                    expandable={true}
                    onClick={() => duplicateAction.openConfirmation(panel)}
                  >
                    <IonIcon slot="icon-only" icon={icons.sparklesSharp}/>
                  </IonItemOption>
                </IonItemOptions>

                <IonItemOptions side="end">
                  <IonItemOption
                    color="danger"
                    expandable={true}
                    onClick={() => deleteAction.openConfirmation(panel)}
                  >
                    <IonIcon slot="icon-only" icon={icons.trashOutline}/>
                  </IonItemOption>
                </IonItemOptions>
              </IonItemSliding>
            )
          })}
        </IonList>
      )}

      {activeTab === 'extras' && (
        <></>
      )}

      <IonActionSheet
        isOpen={duplicateAction.isOpen}
        header={`Duplicate Panel ${duplicateAction.selectedItem?.ordinal}?`}
        subHeader="This will make a copy of this panel and its data"
        onDidDismiss={duplicateAction.dismiss}
        buttons={[
          { text: 'Confirm', role: 'selected', icon: icons.sparklesSharp, handler: duplicateAction.executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: duplicateAction.dismiss },
        ]}
      />

      <IonActionSheet
        isOpen={deleteAction.isOpen}
        header={`Delete Panel ${deleteAction.selectedItem?.ordinal}?`}
        subHeader="This action cannot be undone."
        onDidDismiss={deleteAction.dismiss}
        buttons={[
          { text: 'Confirm', role: 'destructive', icon: icons.trashOutline, handler: deleteAction.executeAction },
          { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: deleteAction.dismiss },
        ]}
      />
    </>
  );
}
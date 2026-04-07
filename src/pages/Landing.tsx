import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopBar } from "@src/components/TopBar.tsx";
import { getAllJobs, deleteJob, type Job } from "@src/db/queries/job.ts";
import {
  IonActionSheet,
  IonFab,
  IonFabButton,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
} from '@ionic/react';
import * as icons from 'ionicons/icons';
import { useConfirmation } from '@src/hooks/useConfirmation.ts';

export default function Landing() {
  const navigate = useNavigate();
  const [data, setData] = useState<Job[]>([]);
  const {
    selectedItem,
    openConfirmation,
    dismiss,
    executeAction,
    isOpen
  } = useConfirmation<Job>(async (selected) => {
    await deleteJob(selected.id);
    setData(prev => prev.filter(j => j.id !== selected.id));
  });

  useEffect(() => {
    getAllJobs().then(setData);
  }, []);


  return (<>
    <TopBar.Title text="Jobs"/>
    <TopBar.Action icon={icons.settingsOutline} onClick={() => navigate('settings')}/>

    <IonList lines="full" className="ion-no-padding">
      {data.map(job => {
        return (
          <IonItemSliding key={job.id}>
            <IonItem button detail={false} onClick={() => navigate(`/job/${job.id}`)}>
              <IonLabel>{job.name}</IonLabel>
              <IonIcon slot="end" icon={icons.chevronForwardOutline} color="medium"/>
            </IonItem>
            <IonItemOptions side="end">
              <IonItemOption
                color="danger"
                expandable={true}
                onClick={() => openConfirmation(job)}
              >
                <IonIcon slot="icon-only" icon={icons.trashOutline}/>
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        )
      })}
    </IonList>

    <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ion-margin">
      <IonFabButton color="primary" onClick={() => navigate('create-job')}>
        <IonIcon icon={icons.add}/>
      </IonFabButton>
    </IonFab>

    <IonActionSheet
      isOpen={isOpen}
      header={`Delete ${selectedItem?.name}?`}
      subHeader="This action cannot be undone."
      onDidDismiss={dismiss}
      buttons={[
        { text: 'Confirm', role: 'destructive', icon: icons.trashOutline, handler: executeAction },
        { text: 'Cancel', role: 'cancel', icon: icons.closeOutline, handler: dismiss },
      ]}
    />
  </>);
}
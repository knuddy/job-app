import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { TopBar } from "@src/components/TopBar.tsx";
import { getAllJobs, deleteJob } from "@src/db/queries/job.ts";
import { type Job } from "@src/db/schema.ts";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonModal,
  IonText,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import * as icons from 'ionicons/icons';

export default function List() {
  const navigate = useNavigate();
  const [data, setData] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  useEffect(() => {
    getAllJobs().then(setData);
  }, []);

  const openConfirm = (job: Job) => {
    setSelectedJob(job);
  };

  const dismissDeleteJobModal = () => {
    setSelectedJob(null);
  }

  async function handleExecuteDelete() {
    if (selectedJob) {
      await deleteJob(selectedJob.id);
      setData(prev => prev.filter(j => j.id !== selectedJob.id));
    }

    dismissDeleteJobModal();
  }

  return (<>
    <TopBar.Title text="Jobs"/>
    <TopBar.IconAction icon={icons.settingsOutline} onClick={() => navigate('settings')}/>

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
                onClick={() => openConfirm(job)}
              >
                <IonIcon slot="icon-only" icon={icons.trashOutline}/>
              </IonItemOption>
            </IonItemOptions>
          </IonItemSliding>
        )
      })}
    </IonList>

    <IonFab vertical="bottom" horizontal="end" slot="fixed" className="ion-margin">
      <IonFabButton color="primary" onClick={() => navigate('job/create')}>
        <IonIcon icon={icons.add}/>
      </IonFabButton>
    </IonFab>

    <IonModal
      isOpen={selectedJob !== null}
      onDidDismiss={dismissDeleteJobModal}
      initialBreakpoint={0.3}
      breakpoints={[0, 0.3]}
      handleBehavior="cycle"
    >
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Delete Job</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={dismissDeleteJobModal}>
              <IonIcon slot="icon-only" icon={icons.closeOutline}/>
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonText color="dark">
          <p className="ion-no-margin ion-margin-bottom">Are you sure you want to delete <strong>{selectedJob?.name}</strong>?</p>
        </IonText>
        <IonButton
          color="danger"
          expand="block"
          fill="solid"
          size="large"
          onClick={handleExecuteDelete}
        >
          Delete Job
        </IonButton>
        <IonButton
          color="medium"
          expand="block"
          fill="clear"
          size="large"
          className="ion-margin-top"
          onClick={dismissDeleteJobModal}
        >
          Cancel
        </IonButton>
      </IonContent>
    </IonModal>
  </>);
}
import { IonContent, IonPage, IonSpinner } from '@ionic/react';

const LoadingScreen = () => (
  <IonPage>
    <IonContent className="ion-padding">
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <IonSpinner name="dots" color="primary" style={{ width: '8rem', height: '8rem' }}/>
      </div>
    </IonContent>
  </IonPage>
);

export default LoadingScreen;
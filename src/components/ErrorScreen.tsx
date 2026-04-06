import {
  IonContent,
  IonPage,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from '@ionic/react';
import { useRouteError, isRouteErrorResponse } from "react-router-dom";
import { FallbackProps } from 'react-error-boundary';

const ErrorScreen = (props: Partial<FallbackProps>) => {
  let routerError;
  try {
    routerError = useRouteError();
  } catch (e) {
    // If we are outside the router, useRouteError will throw.
    // We catch it here and keep routerError as null.
  }
  const displayError = props.error || routerError;

  if (isRouteErrorResponse(displayError)) {
    // Handles the 4xx/5xx
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonGrid style={{ height: '100%' }}>
            <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
              <IonCol size="12">
                <IonText color="step-600" className="ion-text-center" >
                  <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0 }}>{displayError.status}</h1>
                  <p style={{ fontSize: '1.5rem' }}>{displayError.statusText}</p>
                </IonText>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }

  let message = "An unknown error occurred";
  if (displayError instanceof Error) {
    message = displayError.message;
  }

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <IonGrid style={{ height: '100%' }}>
          <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
            <IonCol size="12">
              <div className="ion-margin-bottom">
                <IonText color="danger">
                  <h2 style={{ fontWeight: 'bold' }}>An Error Occurred</h2>
                </IonText>
                <p>Try refreshing your browser. If the problem persists, please get in contact.</p>
              </div>
              <IonCard mode="md" style={{ border: '1px solid var(--ion-color-danger)' }}>
                <IonCardHeader>
                  <IonCardTitle>Message</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <code style={{ color: 'var(--ion-color-danger)' }}>{message}</code>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}

export default ErrorScreen;
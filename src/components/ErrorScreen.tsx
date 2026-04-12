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
  const displayError = routerError || props.error;

  const isRouterRes = isRouteErrorResponse(displayError);
  const isManualRes = displayError instanceof Response;

  if (isRouterRes || isManualRes) {
    const status = isRouterRes ? displayError.status : (displayError as Response).status;
    const statusText = isRouterRes ? displayError.statusText : (displayError as Response).statusText;
    // Handles the 4xx/5x
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <IonGrid style={{ height: '100%' }}>
            <IonRow className="ion-justify-content-center ion-align-items-center" style={{ height: '100%' }}>
              <IonCol size="12" className="ion-text-center">
                <IonText color="step-600">
                  <h1 style={{ fontSize: '4rem', fontWeight: 'bold', margin: 0 }}>{status}</h1>
                  <p style={{ fontSize: '1.5rem' }}>{statusText}</p>
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
              <IonCard mode="md" style={{ border: '1px solid var(--ion-color-danger)' }} className="ion-no-margin">
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
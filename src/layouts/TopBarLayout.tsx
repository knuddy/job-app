import { Outlet } from 'react-router-dom';
import { TopBarProvider } from "@src/context/TopBarContext.tsx";
import { TopBar } from '@src/components/TopBar';
import { IonPage, IonContent } from '@ionic/react';

export default function TopBarLayout() {
  return (
    <TopBarProvider>
      <IonPage>
        <TopBar/>
        <IonContent>
          <Outlet/>
        </IonContent>
      </IonPage>
    </TopBarProvider>
  );
}
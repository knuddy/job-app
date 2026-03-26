import { Outlet } from 'react-router-dom';
import { TopBarProvider } from "@src/context/TopBarContext.tsx";
import { TopBar } from '@src/components/TopBar';

export default function TopBarLayout() {
  return (
    <TopBarProvider>
      <TopBar/>
      <main className="container p-3 d-flex flex-fill position-relative overflow-hidden">
        <Outlet/>
      </main>
    </TopBarProvider>
  );
}
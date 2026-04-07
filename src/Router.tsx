import { createHashRouter } from 'react-router-dom';
import RootLayout from '@src/layouts/RootLayout.tsx';
import TopBarLayout from '@src/layouts/TopBarLayout.tsx';
import ErrorScreen from './components/ErrorScreen';
import Landing from '@src/pages/Landing.tsx';
import Settings from '@src/pages/Settings.tsx';
import JobDetail from '@src/pages/job/Detail.tsx';
import JobForm from '@src/pages/job/Form.tsx';
import RoomDetail from '@src/pages/room/Detail.tsx';
import RoomForm from '@src/pages/room/Form.tsx';


export default createHashRouter([
  {
    path: '/',
    element: <RootLayout/>,
    errorElement: <ErrorScreen/>,
    children: [
      {
        element: <TopBarLayout/>,
        children: [
          { index: true, element: <Landing/> },
          { path: 'settings', element: <Settings/> },

          { path: 'create-job', element: <JobForm/> },
          { path: 'job/:jobId', element: <JobDetail/> },
          { path: 'job/:jobId/update', element: <JobForm/> },
          { path: 'job/:jobId/create-room', element: <RoomForm/> },

          { path: 'room/:roomId', element: <RoomDetail/> },
          { path: 'room/:roomId/update', element: <RoomForm/> },
        ]
      }
    ],
  },
]);
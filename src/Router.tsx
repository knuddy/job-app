import { createHashRouter } from 'react-router-dom';
import RootLayout from '@src/layouts/RootLayout.tsx';
import TopBarLayout from '@src/layouts/TopBarLayout.tsx';
import JobList from '@src/pages/job/List.tsx';
import JobDetail from '@src/pages/job/Detail.tsx';
import JobForm from '@src/pages/job/Form.tsx';
import ErrorScreen from './components/ErrorScreen';
import Settings from "@src/pages/Settings.tsx";

export default createHashRouter([
  {
    path: '/',
    element: <RootLayout/>,
    errorElement: <ErrorScreen/>,
    children: [
      {
        element: <TopBarLayout/>,
        children: [
          { index: true, element: <JobList/> },
          { path: 'job/create', element: <JobForm/> },
          { path: 'job/:jobId', element: <JobDetail/> },
          { path: 'job/:jobId/update', element: <JobForm/> },
          { path: 'settings', element: <Settings/> }
        ]
      }
    ],
  },
]);
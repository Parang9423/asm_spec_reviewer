import { createBrowserRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import { HistoryPage } from '../pages/HistoryPage';
import { SpecDetailPage } from '../pages/SpecDetailPage';
import { SpecListPage } from '../pages/SpecListPage';
import { RootLayout } from './RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'specs', element: <SpecListPage /> },
      { path: 'specs/:aiCode', element: <SpecDetailPage /> },
      { path: 'history', element: <HistoryPage /> },
    ],
  },
]);

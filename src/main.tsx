import React from 'react'
import ReactDOM from 'react-dom/client'
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import App from './App.tsx'
import './index.css'
import { Suspense, lazy } from "react";

import NotFound from "./screens/notFound";
import Loader from './components/loader/loader.tsx';

// Lazy load components for better performance
const Login = lazy(() =>
  wait(800).then(() => import("./screens/Auth/Login.tsx"))
);

const AdminMainContainer = lazy(() =>
  wait(800).then(() => import("./screens/Admin/AdminMainContainer.tsx"))
);

const Dashboard = lazy(() =>
  wait(500).then(() => import("./screens/Admin/Dashboard.tsx"))
);

const AddEntity = lazy(() =>
  wait(500).then(() => import("./screens/Admin/AddEntity-new.tsx"))
);

const Entities = lazy(() =>
  wait(500).then(() => import("./screens/Admin/Entities.tsx"))
);

const ViewEntity = lazy(() =>
  wait(500).then(() => import("./screens/Admin/ViewEntity.tsx"))
);

const EditEntity = lazy(() =>
  wait(500).then(() => import("./screens/Admin/EditEntity.tsx"))
);

const AddQuotation = lazy(() =>
  wait(500).then(() => import("./screens/Admin/AddQuotation.tsx"))
);

const Reports = lazy(() =>
  wait(500).then(() => import("./screens/Admin/Reports.tsx"))
);

const Settings = lazy(() =>
  wait(500).then(() => import("./screens/Admin/Settings.tsx"))
);

const router = createBrowserRouter([
  {
    path: "/react-vite-supreme/",
    element: <App />,
    children: [
      {
        path: "/react-vite-supreme/",
        element: <Navigate to="/react-vite-supreme/login" />,
      },
      {
        path: "/react-vite-supreme/login",
        element: (
          <Suspense fallback={<Loader />}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/react-vite-supreme/admin",
        element: (
          <Suspense fallback={<Loader />}>
            <AdminMainContainer />
          </Suspense>
        ),
        children: [
          {
            path: "/react-vite-supreme/admin/dashboard",
            element: (
              <Suspense fallback={<Loader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/add-entity",
            element: (
              <Suspense fallback={<Loader />}>
                <AddEntity />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/entities",
            element: (
              <Suspense fallback={<Loader />}>
                <Entities />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/entity/:id",
            element: (
              <Suspense fallback={<Loader />}>
                <ViewEntity />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/edit-entity/:id",
            element: (
              <Suspense fallback={<Loader />}>
                <EditEntity />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/add-quotation",
            element: (
              <Suspense fallback={<Loader />}>
                <AddQuotation />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/reports",
            element: (
              <Suspense fallback={<Loader />}>
                <Reports />
              </Suspense>
            ),
          },
          {
            path: "/react-vite-supreme/admin/settings",
            element: (
              <Suspense fallback={<Loader />}>
                <Settings />
              </Suspense>
            ),
          },
        ],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function wait(time: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
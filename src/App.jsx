import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";

// Login is the entry surface — keep it eager for the fastest first paint.
import Login from './login.jsx';

// Everything behind auth is split into its own chunk.
const Home    = lazy(() => import('./home.jsx'));
const Reviews = lazy(() => import('./reviews.jsx'));
const SchoolPage = lazy(() => import('./SchoolPage.jsx'));
const Admin   = lazy(() => import('./Admin.jsx'));
const ErrorPage  = lazy(() => import('./Error.jsx'));

const SCHOOLS = {
  nus: { code: 'NUS', name: 'National University of Singapore', accent: '#EF7C00' },
  ntu: { code: 'NTU', name: 'Nanyang Technological University', accent: '#C0272D' },
  smu: { code: 'SMU', name: 'Singapore Management University',  accent: '#1273B8' },
};

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'grid',
        placeItems: 'center',
        background: '#faf8f2',
        fontFamily: "'Source Serif 4', Georgia, serif",
        fontStyle: 'italic',
        color: '#8a8275',
      }}
    >
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route index element={<Login />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Login />} />
          <Route path="home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          {Object.entries(SCHOOLS).map(([key, s]) => (
            <Route
              key={key}
              path={key}
              element={
                <ProtectedRoute>
                  <SchoolPage code={s.code} schoolKey={key} accent={s.accent} name={s.name} />
                </ProtectedRoute>
              }
            />
          ))}
          <Route path="admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path=":school/:course" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

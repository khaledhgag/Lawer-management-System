import { Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout.jsx';
import AdminShell from './layouts/AdminShell.jsx';

import Home from './pages/public/Home.jsx';
import TrackWelcome from './pages/client/TrackWelcome.jsx';
import TrackLogin from './pages/client/TrackLogin.jsx';
import CaseView from './pages/client/CaseView.jsx';
import BookConsultation from './pages/public/BookConsultation.jsx';
import Contact from './pages/public/Contact.jsx';
import TrackForgot from './pages/client/TrackForgot.jsx';
import ChangePassword from './pages/client/ChangePassword.jsx';
import Calendar from './pages/admin/Calendar.jsx';

import Dashboard from './pages/admin/Dashboard.jsx';
import CasesList from './pages/admin/CasesList.jsx';
import CaseDetail from './pages/admin/CaseDetail.jsx';
import NewCase from './pages/admin/NewCase.jsx';
import Inbox from './pages/admin/Inbox.jsx';
import Settings from './pages/admin/Settings.jsx';

import NotFound from './pages/public/NotFound.jsx';
import Forbidden from './pages/public/Forbidden.jsx';
import ServerError from './pages/public/ServerError.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/track" element={<TrackWelcome />} />
        <Route path="/track/login" element={<TrackLogin />} />
        <Route path="/track/case" element={<CaseView />} />
        <Route path="/book" element={<BookConsultation />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/track/forgot" element={<TrackForgot />} />
        <Route path="/track/password" element={<ChangePassword />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="/admin/login" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<AdminShell />}>
        <Route index element={<Dashboard />} />
        <Route path="cases" element={<CasesList />} />
        <Route path="cases/new" element={<NewCase />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import UpcomingListEntries from './pages/Recipients/UpcomingListEntries';
// import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Compose from './pages/Compose/Compose';
import Recipients from './pages/Recipients/Recipients';
import KPICard from './pages/Dashboard/KPICard';
// import Reports from './pages/Reports';
// import Settings from './pages/Settings';
// import Admin from './pages/Admin';
// import Login from './pages/Login';
import AttachmentsPage from './pages/Attachments/Attachments';
import LiveEditor from './pages/Templates/codespace';
import EmailTemplatesPage from './pages/Templates/Templates';
import TemplateView from './pages/Templates/TemplateView';
import EmailPreview from './pages/Compose/EmailPreview';
import Unsubscribe from './pages/EmailUnsubscribe';
import Home from './pages/Home';
import Login from './pages/Login';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  // const [isAuthenticated, setIsAuthenticated] = useState(true); // For demo purposes
  // if (!isAuthenticated) {
  //   return (
  //     <QueryClientProvider client={queryClient}>
  //       <Login onLogin={() => setIsAuthenticated(true)} />
  //     </QueryClientProvider>
  //   );
  // }

  return (
    <QueryClientProvider client={queryClient}>
    <Router>
      <Routes>

        {/* FULL SCREEN PAGES */}
        <Route path="/" element={<Home />} />
        <Route path="/email-preview" element={<EmailPreview />} />
        <Route path="/email-unsubscribe" element={<Unsubscribe />} />
        <Route path="/login" element={<Login />} />

        {/* APP WITH SIDEBAR */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/compose" element={<Compose />} />
                <Route path="/recipients" element={<Recipients />} />
                <Route path="/lists/:id" element={<UpcomingListEntries />} />
                <Route path="/attachments" element={<AttachmentsPage />} />
                <Route path="/codespace" element={<LiveEditor />} />
                <Route path="/codespace/:slug" element={<LiveEditor />} />
                <Route path="/emailtemplates" element={<EmailTemplatesPage />} />
                <Route path="/template-view/:slug" element={<TemplateView />} />
                <Route path="/kpi" element={<KPICard />} />
                {/* <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin" element={<Admin />} /> */}
              </Routes>
            </Layout>
          }
        />

      </Routes>
    </Router>
    </QueryClientProvider>
  );
}

export default App;
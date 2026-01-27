import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ItineraryProvider } from './contexts/ItineraryContext';
import AppLayout from './components/AppLayout';
import ItineraryListPage from './pages/ItineraryListPage';
import ItineraryFormPage from './pages/ItineraryFormPage';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import Notification from './components/Notification';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ItineraryListPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/new"
        element={
          <ProtectedRoute>
            <AppLayout hideNavBar>
              <ItineraryFormPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <AppLayout hideNavBar>
              <ItineraryFormPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/detail/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ItineraryDetailPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <ItineraryProvider>
          <Router>
            <AppRoutes />
          </Router>
          <Notification />
        </ItineraryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

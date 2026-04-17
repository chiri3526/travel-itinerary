import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import {
  alpha,
  createTheme,
  CssBaseline,
  ThemeProvider,
  type ThemeOptions,
} from '@mui/material';
import { jaJP as coreJaJP } from '@mui/material/locale';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ItineraryProvider } from './contexts/ItineraryContext';
import AppLayout from './components/AppLayout';
import Notification from './components/Notification';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
import ItineraryFormPage from './pages/ItineraryFormPage';
import ItineraryListPage from './pages/ItineraryListPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: '#75543A',
      light: '#957057',
      dark: '#513825',
      contrastText: '#FFFDF8',
    },
    secondary: {
      main: '#596B57',
      light: '#748872',
      dark: '#3C4A3A',
      contrastText: '#FAF8F1',
    },
    background: {
      default: '#F5F0E6',
      paper: '#FFFDF8',
    },
    text: {
      primary: '#2F281F',
      secondary: '#625647',
    },
    divider: alpha('#7A604A', 0.14),
    error: {
      main: '#B15D46',
    },
    warning: {
      main: '#B98A4A',
    },
    success: {
      main: '#5D785F',
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: [
      '"M PLUS 1p"',
      '"Hiragino Kaku Gothic ProN"',
      '"Hiragino Sans"',
      '"Yu Gothic UI"',
      '"Meiryo"',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
      lineHeight: 1.16,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.022em',
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.018em',
      lineHeight: 1.24,
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.014em',
      lineHeight: 1.26,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      lineHeight: 1.28,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.006em',
      lineHeight: 1.3,
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontWeight: 500,
      letterSpacing: '0.02em',
    },
    body1: {
      lineHeight: 1.75,
      letterSpacing: '0.01em',
    },
    body2: {
      lineHeight: 1.7,
      letterSpacing: '0.008em',
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F5F0E6',
          color: '#2F281F',
        },
      },
    },
    MuiContainer: {
      defaultProps: {
        maxWidth: 'xl',
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          border: `1px solid ${alpha('#7A604A', 0.12)}`,
          backgroundImage: 'none',
          boxShadow: '0 8px 18px rgba(79, 58, 40, 0.05)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          minHeight: 42,
          paddingInline: 16,
          boxShadow: 'none',
        },
        contained: {
          boxShadow: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: alpha('#FFFFFF', 0.88),
          '&.Mui-focused': {
            boxShadow: `0 0 0 3px ${alpha('#957057', 0.12)}`,
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        },
      },
    },
  },
};

const theme = createTheme(themeOptions, coreJaJP);

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser } = useAuth();
  return currentUser ? <>{children}</> : <Navigate to="/login" replace />;
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
            <AppLayout>
              <ItineraryFormPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <AppLayout>
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

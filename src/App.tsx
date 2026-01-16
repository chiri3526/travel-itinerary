import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ItineraryProvider } from './contexts/ItineraryContext';
import AppLayout from './components/AppLayout';
import ItineraryListPage from './pages/ItineraryListPage';
import ItineraryFormPage from './pages/ItineraryFormPage';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ItineraryProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<ItineraryListPage />} />
              <Route path="/new" element={<ItineraryFormPage />} />
              <Route path="/edit/:id" element={<ItineraryFormPage />} />
              <Route path="/detail/:id" element={<ItineraryDetailPage />} />
            </Routes>
          </AppLayout>
        </Router>
        <Notification />
      </ItineraryProvider>
    </ThemeProvider>
  );
}

export default App;

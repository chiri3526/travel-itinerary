import React, { useRef } from 'react';
import { Container, Typography, Fab, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryCard from '../components/ItineraryCard';

const ItineraryListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteItinerary, exportItinerary, importItinerary } = useItinerary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNewItinerary = () => {
    navigate('/new');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await importItinerary(file);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: { xs: 2, sm: 0 },
        mb: 3,
        mt: { xs: 2, sm: 3 }
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
          旅行行程表一覧
        </Typography>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handleImportClick}
          fullWidth={false}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          インポート
        </Button>
      </Box>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {state.itineraries.length === 0 ? (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            まだ行程表がありません
          </Typography>
          <Typography variant="body2" color="text.secondary">
            右下のボタンから新しい行程表を作成してください
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
            },
            gap: 3,
            mt: 1,
          }}
        >
          {state.itineraries.map((itinerary) => (
            <ItineraryCard
              key={itinerary.id}
              itinerary={itinerary}
              onDelete={deleteItinerary}
              onExport={exportItinerary}
            />
          ))}
        </Box>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleNewItinerary}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24, md: 32 },
          right: { xs: 16, sm: 24, md: 32 },
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default ItineraryListPage;

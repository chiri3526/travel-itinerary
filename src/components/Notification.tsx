import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import { useItinerary } from '../contexts/ItineraryContext';

const Notification: React.FC = () => {
  const { state, clearNotification } = useItinerary();

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    clearNotification();
  };

  return (
    <Snackbar
      open={state.notification !== null}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert
        onClose={handleClose}
        severity={state.notification?.type || 'info'}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {state.notification?.message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;

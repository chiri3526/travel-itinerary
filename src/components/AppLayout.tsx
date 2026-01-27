import React, { type ReactNode } from 'react';
import { Container, Box } from '@mui/material';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container 
        maxWidth={false}
        sx={{ 
          mt: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 2, sm: 3, md: 4 }, 
          px: 0,
          flexGrow: 1,
          width: '100%'
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;

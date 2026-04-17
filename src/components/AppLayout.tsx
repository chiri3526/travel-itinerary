import { Box, Container, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

const AppLayout = ({ children, sx }: AppLayoutProps) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container
        sx={{
          position: 'relative',
          zIndex: 1,
          ...sx,
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default AppLayout;

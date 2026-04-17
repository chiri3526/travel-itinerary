import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

interface PageSectionProps {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

const PageSection = ({ eyebrow, title, description, action, children, sx }: PageSectionProps) => {
  return (
    <Box
      sx={{
        borderRadius: { xs: 2, md: 3 },
        border: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'rgba(255, 253, 248, 0.9)',
        boxShadow: '0 10px 22px rgba(83, 62, 44, 0.05)',
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 2.5, sm: 3, md: 4 },
        ...sx,
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        sx={{ mb: children ? 3 : 0 }}
      >
        <Box>
          {eyebrow && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {eyebrow}
            </Typography>
          )}
          <Typography variant="h4" sx={{ fontSize: { xs: '1.55rem', md: '2rem' } }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1, maxWidth: 720, lineHeight: 1.8 }}>
              {description}
            </Typography>
          )}
        </Box>
        {action}
      </Stack>
      {children}
    </Box>
  );
};

export default PageSection;

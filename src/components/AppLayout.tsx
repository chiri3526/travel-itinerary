import React, { type ReactNode } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Avatar, Menu, MenuItem, Button, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchIcon from '@mui/icons-material/Search';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

interface AppLayoutProps {
  children: ReactNode;
  hideNavBar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, hideNavBar = false }) => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [bottomNavValue, setBottomNavValue] = React.useState(0);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleClose();
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideNavBar && (
      <AppBar position="sticky" sx={{ backgroundColor: '#fff', boxShadow: 'none', borderBottom: '1px solid #f0f0f0' }}>
        <Toolbar sx={{ px: { xs: 2, sm: 3 }, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo */}
          <Typography
            variant="h6"
            component="div"
            sx={{ 
              cursor: 'pointer',
              fontSize: { xs: '1.125rem', sm: '1.25rem' },
              fontWeight: 600,
              color: '#000',
            }}
            onClick={() => navigate('/')}
          >
            TravelFlow
          </Typography>

          {/* Center Menu */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 3, flex: 1, justifyContent: 'center' }}>
            <Button sx={{ textTransform: 'none', fontSize: '0.95rem', fontWeight: 400, color: '#000' }}>
              ダッシュボード
            </Button>
            <Button sx={{ textTransform: 'none', fontSize: '0.95rem', fontWeight: 400, color: '#000' }}>
              探す
            </Button>
            <Button sx={{ textTransform: 'none', fontSize: '0.95rem', fontWeight: 400, color: '#000' }}>
              お気に入り
            </Button>
          </Box>

          {/* Right Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Dark Mode Toggle */}
            <IconButton
              onClick={toggleDarkMode}
              size="large"
              sx={{ color: '#000' }}
            >
              {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>

            {/* User Menu */}
            {currentUser && (
              <>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: '#000' }}>
                    {currentUser.email?.split('@')[0] || '下'}
                  </Typography>
                  <IconButton
                    size="large"
                    onClick={handleMenu}
                    sx={{ color: '#000' }}
                  >
                    {currentUser.photoURL ? (
                      <Avatar src={currentUser.photoURL} sx={{ width: 32, height: 32 }} />
                    ) : (
                      <Avatar sx={{ width: 32, height: 32 }}>
                        {currentUser.email?.charAt(0).toUpperCase()}
                      </Avatar>
                    )}
                  </IconButton>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleClose}
                >
                  <MenuItem disabled>
                    <Typography variant="body2">{currentUser.email}</Typography>
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>
      )}
      <Container 
        maxWidth={false}
        sx={{ 
          mt: { xs: 2, sm: 3, md: 4 }, 
          mb: { xs: 12, sm: 3, md: 4 }, 
          px: 0,
          flexGrow: 1,
          width: '100%'
        }}
      >
        {children}
      </Container>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNavigation
        value={bottomNavValue}
        onChange={(_, newValue) => {
          setBottomNavValue(newValue);
          if (newValue === 0) navigate('/');
          else if (newValue === 1) navigate('/search');
          else if (newValue === 2) navigate('/favorites');
          else if (newValue === 3) navigate('/profile');
        }}
        sx={{ 
          display: { xs: 'flex', sm: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <BottomNavigationAction label="ダッシュボード" icon={<DashboardIcon />} />
        <BottomNavigationAction label="探す" icon={<SearchIcon />} />
        <BottomNavigationAction label="お気に入り" icon={<FavoriteBorderIcon />} />
        <BottomNavigationAction label="マイページ" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Box>
  );
};

export default AppLayout;

import React, { useRef, useState, useMemo } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Pagination,
  Avatar,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import HomeIcon from '@mui/icons-material/Home';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../contexts/ItineraryContext';
import type { Itinerary } from '../types';

const ItineraryListPage: React.FC = () => {
  const navigate = useNavigate();
  const { state, deleteItinerary, importItinerary } = useItinerary();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const itemsPerPage = 3;

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleView = (id: string) => {
    navigate(`/detail/${id}`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この行程表を削除してもよろしいですか？')) {
      deleteItinerary(id);
    }
  };

  const getIcon = (index: number) => {
    const icons = [FlightTakeoffIcon, DirectionsBoatIcon, HomeIcon];
    const Icon = icons[index % icons.length];
    return <Icon />;
  };

  const calculateDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const calculateTotalBudget = (itinerary: Itinerary): number => {
    return itinerary.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const filteredItineraries = useMemo(() => {
    return state.itineraries.filter((itinerary) =>
      itinerary.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [state.itineraries, searchQuery]);

  const paginatedItineraries = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    return filteredItineraries.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItineraries, page]);

  const totalPages = Math.ceil(filteredItineraries.length / itemsPerPage);

  const totalItineraries = state.itineraries.length;
  const thisMonthItineraries = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    return state.itineraries.filter((itinerary) => {
      const start = new Date(itinerary.startDate);
      return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
    }).length;
  }, [state.itineraries]);

  const totalBudget = useMemo(() => {
    return state.itineraries.reduce((sum, itinerary) => {
      return sum + calculateTotalBudget(itinerary);
    }, 0);
  }, [state.itineraries]);

  return (
    <Box sx={{ display: 'flex', maxWidth: 'lg', mx: 'auto', width: '100%', gap: { xs: 0, md: 3 }, px: { xs: 2, sm: 3 }, flexDirection: { xs: 'column', md: 'row' } }}>
      {/* Sidebar */}
      <Box sx={{ minWidth: 180, display: { xs: 'block', md: 'block' }, pt: 1, mb: { xs: 2, md: 0 }, borderBottom: { xs: '2px solid', md: 'none' }, borderColor: { xs: 'primary.main', md: 'transparent' }, pb: { xs: 2, md: 0 } }}>
        <Typography variant="body2" color="primary.main" sx={{ mb: 2, fontWeight: 700, letterSpacing: 1, fontSize: '0.7rem', textTransform: 'uppercase' }}>
          MY JOURNEYS
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' }, fontWeight: 700, mb: 1 }}>
              行程表一覧
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              作成済みの洗練された旅行プランを管理・整理します。
            </Typography>
          </Box>
          {/* Action Buttons - Right Side */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end', width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<UploadFileIcon />}
              onClick={handleImportClick}
              sx={{ fontSize: '0.875rem', py: 1, px: 2, display: { xs: 'none', sm: 'inline-flex' } }}
            >
              インポート
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNewItinerary}
              sx={{ fontSize: '0.875rem', py: 1, px: 2, flex: { xs: 1, sm: 'unset' }, borderRadius: '50px' }}
            >
              新規作成
            </Button>
          </Box>
        </Box>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="目的地や旅行する下で検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Content */}
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
              上のボタンから新しい行程表を作成してください
            </Typography>
          </Box>
        ) : (
          <>
            {/* Card Grid */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 3, mb: 3 }}>
              {paginatedItineraries.map((itinerary, index) => (
                <Box key={itinerary.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      borderRadius: 3,
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleView(itinerary.id)}
                  >
                    {/* Image Placeholder */}
                    {itinerary.coverImage ? (
                      <Box
                        component="img"
                        src={itinerary.coverImage}
                        alt={itinerary.title}
                        sx={{
                          width: '100%',
                          height: 200,
                          objectFit: 'cover',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      />
                    ) : (
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          background: 'linear-gradient(135deg, #f5e6d3 0%, #e8d4bb 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <Avatar sx={{ bgcolor: 'rgba(25, 118, 210, 0.15)', width: 80, height: 80, color: 'primary.main' }}>
                          {getIcon(index)}
                        </Avatar>
                        {/* Draft Badge */}
                        <Chip
                          label="DRAFT"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 12,
                            left: 12,
                            backgroundColor: 'rgba(0,0,0,0.6)',
                            color: 'white',
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    )}

                    <CardContent sx={{ flex: 1, pb: 1 }}>
                      {/* Title and Actions */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
                          {itinerary.title}
                        </Typography>
                        <Box
                          sx={{ display: 'flex', gap: 0.5 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(itinerary.id);
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(itinerary.id);
                            }}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>

                      {/* Date */}
                      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          📅
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {itinerary.startDate} - {itinerary.endDate}
                        </Typography>
                      </Box>

                      {/* Days */}
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        {calculateDays(itinerary.startDate, itinerary.endDate)} DAYS
                      </Typography>

                      {/* Budget */}
                      <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                          EST. BUDGET
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                          ¥{calculateTotalBudget(itinerary).toLocaleString()}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>

            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
              <Typography variant="body2" color="text.secondary">
                Showing {Math.min(itemsPerPage * (page - 1) + 1, filteredItineraries.length)} of {filteredItineraries.length} trip{filteredItineraries.length !== 1 ? 's' : ''}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>

            {/* Statistics Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
              <Card sx={{ flex: 1, backgroundColor: 'rgba(25, 118, 210, 0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        🗂️
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        総旅行数
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {totalItineraries}件
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, backgroundColor: 'rgba(255, 152, 0, 0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        📅
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        今月の予定
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700}>
                      {thisMonthItineraries}件
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1, backgroundColor: 'rgba(76, 175, 80, 0.05)' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        💰
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                        予算総計
                      </Typography>
                    </Box>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      ¥{totalBudget.toLocaleString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ItineraryListPage;

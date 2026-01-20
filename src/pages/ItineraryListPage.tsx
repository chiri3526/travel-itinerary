import React, { useRef, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
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
import DownloadIcon from '@mui/icons-material/Download';
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

  const getStatusColor = (itinerary: Itinerary): 'success' | 'warning' | 'default' => {
    const now = new Date();
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    
    if (now > end) return 'success';
    if (now >= start && now <= end) return 'warning';
    return 'default';
  };

  const getStatusLabel = (itinerary: Itinerary): string => {
    const now = new Date();
    const start = new Date(itinerary.startDate);
    const end = new Date(itinerary.endDate);
    
    if (now > end) return '確定済み';
    if (now >= start && now <= end) return '計画中';
    return '下書き';
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
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600, mb: 1 }}>
          行程表一覧
        </Typography>
        <Typography variant="body2" color="text.secondary">
          作成済みの旅行プランを管理・編集できます。
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handleImportClick}
        >
          Excelインポート
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
        >
          Excelエクスポート
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleNewItinerary}
        >
          新しい行程表を作成
        </Button>
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
        placeholder="旅行名で検索..."
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

      {/* Table */}
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
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell>旅行名</TableCell>
                  <TableCell>日程</TableCell>
                  <TableCell align="right">予算</TableCell>
                  <TableCell>ステータス</TableCell>
                  <TableCell align="center"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedItineraries.map((itinerary, index) => (
                  <TableRow 
                    key={itinerary.id} 
                    hover
                    onClick={() => handleView(itinerary.id)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'action.hover'
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light' }}>
                          {getIcon(index)}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={500}>
                            {itinerary.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            国内旅行・{itinerary.items.length > 0 ? '観光' : '未設定'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {itinerary.startDate} - {itinerary.endDate}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {calculateDays(itinerary.startDate, itinerary.endDate)}日間
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body1" fontWeight={500}>
                        ¥{calculateTotalBudget(itinerary).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(itinerary)}
                        color={getStatusColor(itinerary)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(itinerary.id);
                        }}
                        sx={{ mr: 1 }}
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="body2" color="text.secondary">
              全 {filteredItineraries.length} 件中 1 から {Math.min(itemsPerPage, filteredItineraries.length)} 件を表示
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
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  総旅行数
                </Typography>
                <Typography variant="h3" fontWeight={600}>
                  {totalItineraries}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  今月の予定
                </Typography>
                <Typography variant="h3" fontWeight={600}>
                  {thisMonthItineraries}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  予算総計 (確定分)
                </Typography>
                <Typography variant="h3" fontWeight={600} color="primary.main">
                  ¥{totalBudget.toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        </>
      )}
    </Container>
  );
};

export default ItineraryListPage;

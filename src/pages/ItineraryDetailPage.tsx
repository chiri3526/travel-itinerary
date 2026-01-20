import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  Avatar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryService from '../services/ItineraryService';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItinerary, exportItinerary } = useItinerary();

  const itinerary = id ? getItinerary(id) : undefined;

  if (!itinerary) {
    return (
      <Container maxWidth="lg">
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            行程表が見つかりません
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/')} 
            sx={{ mt: 2 }}
          >
            一覧に戻る
          </Button>
        </Paper>
      </Container>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年M月d日(E)', { locale: ja });
    } catch {
      return dateStr;
    }
  };

  const groupedItems = ItineraryService.groupItemsByDate(itinerary.items);
  const totalAmount = ItineraryService.calculateTotalAmount(itinerary.items);
  const dayCount = Math.ceil((new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleExport = () => {
    if (id) {
      exportItinerary(id);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      {/* ヘッダー */}
      <Paper elevation={2} sx={{ p: { xs: 3, sm: 4 }, mb: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' }, fontWeight: 600 }}>
            {itinerary.title}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
            <Chip
              label={`${formatDate(itinerary.startDate)} 〜 ${formatDate(itinerary.endDate)}`}
              color="primary"
              variant="outlined"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            />
            <Chip
              label={`${dayCount}日間`}
              color="secondary"
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* 統計情報 */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}>
              <EventNoteIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                総項目数
              </Typography>
              <Typography variant="h6">
                {itinerary.items.length}件
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Avatar sx={{ bgcolor: 'success.light', width: 32, height: 32 }}>
              <AttachMoneyIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                合計金額
              </Typography>
              <Typography variant="h6" color="success.main">
                ¥{totalAmount.toLocaleString()}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <Avatar sx={{ bgcolor: 'info.light', width: 32, height: 32 }}>
              <AccessTimeIcon fontSize="small" />
            </Avatar>
            <Box>
              <Typography variant="body2" color="text.secondary">
                期間
              </Typography>
              <Typography variant="h6">
                {dayCount}日間
              </Typography>
            </Box>
          </Box>
        </Stack>

        {/* アクションボタン */}
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          justifyContent="flex-end"
        >
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            戻る
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            variant="outlined" 
            onClick={handleExport}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            エクスポート
          </Button>
          <Button 
            startIcon={<EditIcon />} 
            variant="contained" 
            onClick={handleEdit}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            編集
          </Button>
        </Stack>
      </Paper>

      {/* 日程詳細 */}
      <Stack spacing={3}>
        {Array.from(groupedItems.entries())
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, items]) => (
            <Card key={date} elevation={2}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ 
                  fontSize: { xs: '1.125rem', sm: '1.25rem' },
                  fontWeight: 600,
                  color: 'primary.main',
                  mb: 2
                }}>
                  {formatDate(date)}
                </Typography>
                <Stack spacing={2}>
                  {items
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((item, index) => (
                      <Box key={item.id}>
                        {index > 0 && <Divider sx={{ my: 1 }} />}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                          <Box sx={{ minWidth: { xs: 'auto', sm: 120 } }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              {item.time || '時間未設定'}
                            </Typography>
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                              {item.content || '内容未設定'}
                            </Typography>
                          </Box>
                          <Box sx={{ minWidth: { xs: 'auto', sm: 100 } }}>
                            <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                              {item.amount ? `¥${item.amount.toLocaleString()}` : '-'}
                            </Typography>
                          </Box>
                          <Box sx={{ minWidth: { xs: 'auto', sm: 150 } }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.note || '-'}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              </CardContent>
            </Card>
          ))}
      </Stack>

      {/* 空の状態 */}
      {itinerary.items.length === 0 && (
        <Card elevation={2}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              まだ行程詳細が登録されていません
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              編集ボタンから行程詳細を追加してください
            </Typography>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={handleEdit}
            >
              編集して追加
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default ItineraryDetailPage;

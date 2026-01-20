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
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryService from '../services/ItineraryService';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { linkifyText } from '../utils/linkify';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItinerary, exportItinerary } = useItinerary();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
      {/* Mobile Header */}
      {isMobile && (
        <Box className="itinerary-detail-header" sx={{ mb: 3 }}>
          <Box className="itinerary-detail-header-top">
            <Box className="itinerary-detail-header-left">
              <IconButton 
                size="small" 
                onClick={handleBack}
                sx={{ mb: 1 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {itinerary.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDate(itinerary.startDate)}
              </Typography>
            </Box>
            <Box className="itinerary-detail-header-actions">
              <IconButton size="small">
                <ShareIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}

      {/* Desktop Header */}
      {!isMobile && (
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
      )}

      {/* Content */}
      <Box sx={{ pb: isMobile ? 12 : 0 }}>
        {/* 日程詳細 */}
        <Stack spacing={3}>
          {Array.from(groupedItems.entries())
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, items]) => (
              <Box key={date}>
                {isMobile ? (
                  // Mobile Timeline View
                  <Box sx={{ position: 'relative', pl: 3 }}>
                    {/* Timeline line */}
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 3,
                        background: 'linear-gradient(to bottom, #2196F3, #1976D2)',
                      }}
                    />
                    {/* Date header */}
                    <Box
                      sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#2196F3',
                        mb: 2,
                        pb: 1,
                        borderBottom: '2px solid #E3F2FD',
                      }}
                    >
                      {formatDate(date)}
                    </Box>
                    {/* Timeline items */}
                    {items
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((item) => (
                        <Box
                          key={item.id}
                          sx={{
                            position: 'relative',
                            mb: 3,
                            pl: 2,
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              left: '-29px',
                              top: '8px',
                              width: 16,
                              height: 16,
                              borderRadius: '50%',
                              background: 'white',
                              border: '3px solid #2196F3',
                              boxShadow: '0 0 0 3px #f5f5f5',
                            },
                          }}
                        >
                          <Box sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#2196F3', mb: 0.5 }}>
                            {item.time || '時間未設定'}
                          </Box>
                          <Box sx={{ fontSize: '1rem', fontWeight: 600, color: '#212121', mb: 0.5 }}>
                            {item.content || '内容未設定'}
                          </Box>
                          {item.note && (
                            <Box sx={{ fontSize: '0.75rem', color: '#757575', mb: 0.5 }}>
                              {linkifyText(item.note)}
                            </Box>
                          )}
                          {item.amount > 0 && (
                            <Box
                              sx={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                color: '#4CAF50',
                                p: '4px 8px',
                                background: '#E8F5E9',
                                borderRadius: '4px',
                                display: 'inline-block',
                              }}
                            >
                              ¥{item.amount.toLocaleString()}
                            </Box>
                          )}
                        </Box>
                      ))}
                  </Box>
                ) : (
                  // Desktop Card View
                  <Card elevation={2}>
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
                                    {item.note ? linkifyText(item.note) : '-'}
                                  </Typography>
                                </Box>
                              </Stack>
                            </Box>
                          ))}
                      </Stack>
                    </CardContent>
                  </Card>
                )}
              </Box>
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
      </Box>

      {/* Mobile Bottom CTA */}
      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            background: 'white',
            borderTop: '1px solid #e0e0e0',
            zIndex: 100,
            boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Button 
            variant="contained" 
            size="large"
            fullWidth
            onClick={handleEdit}
            sx={{ 
              background: 'linear-gradient(135deg, #2196F3, #1976D2)',
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              py: 1.5,
              borderRadius: 1,
            }}
          >
            行程を編集
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ItineraryDetailPage;

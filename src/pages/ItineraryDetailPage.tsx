import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Stack,
  Card,
  CardContent,
  Divider,
  useMediaQuery,
  useTheme,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryService from '../services/ItineraryService';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { linkifyText } from '../utils/linkify';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItinerary, updateItinerary } = useItinerary();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);

  const itinerary = id ? getItinerary(id) : undefined;

  // Initialize cover image from itinerary
  React.useEffect(() => {
    if (itinerary?.coverImage) {
      setCoverImage(itinerary.coverImage);
    }
  }, [itinerary?.coverImage]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && id && itinerary) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setCoverImage(result);
        // Save the image to the itinerary
        updateItinerary(id, { coverImage: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

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
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                {dayCount}日間 • {itinerary.items.length}件 • ¥{totalAmount.toLocaleString()}
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

      {/* Desktop & Mobile Content */}
      <Box sx={{ display: 'flex', gap: 3, pb: isMobile ? 12 : 0 }}>
        {/* Left Sidebar - Desktop only */}
        {!isMobile && (
          <Box sx={{ width: 280, flexShrink: 0 }}>
            {/* Back Button */}
            <Box sx={{ mb: 2 }}>
              <IconButton 
                size="small" 
                onClick={handleBack}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Card */}
            <Card 
              elevation={3}
              sx={{ 
                overflow: 'hidden',
                borderRadius: 2,
              }}
            >
              {/* Image */}
              <Box 
                onClick={handleImageClick}
                sx={{
                  width: '100%',
                  height: 160,
                  background: coverImage 
                    ? `url(${coverImage})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  textAlign: 'center',
                  p: 2,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {/* Overlay for image button feedback */}
                {!coverImage && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.3) 0%, rgba(25, 118, 210, 0.3) 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <CameraAltIcon sx={{ color: 'white', fontSize: '2rem' }} />
                    <Typography sx={{ color: 'white', fontSize: '0.75rem' }}>
                      クリックして画像を追加
                    </Typography>
                  </Box>
                )}
                {coverImage && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  >
                    <CameraAltIcon sx={{ color: 'white', fontSize: '1.5rem' }} />
                  </Box>
                )}
              </Box>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />

              <CardContent sx={{ p: 2.5 }}>
                {/* Trip label */}
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.65rem',
                    letterSpacing: 0.5,
                    display: 'block',
                    mb: 1,
                  }}
                >
                  Upcoming Trip
                </Typography>

                {/* Title */}
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 0.5,
                    fontSize: '1.1rem',
                    lineHeight: 1.3,
                  }}
                >
                  {itinerary.title}
                </Typography>

                {/* Date info */}
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 2,
                    fontSize: '0.875rem',
                  }}
                >
                  {formatDate(itinerary.startDate)}
                  {dayCount > 1 && (
                    <>
                      <br />
                      {dayCount}日間
                    </>
                  )}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Total estimated */}
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      display: 'block',
                      mb: 0.5,
                      fontSize: '0.75rem',
                      fontWeight: 500,
                    }}
                  >
                    Total Estimated
                  </Typography>
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    ¥{totalAmount.toLocaleString()}
                  </Typography>
                </Box>

                {/* Edit Plan Button */}
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={handleEdit}
                  startIcon={<EditIcon />}
                  sx={{ 
                    background: 'linear-gradient(135deg, #2196F3, #1976D2)',
                    fontWeight: 600,
                    textTransform: 'none',
                    fontSize: '0.95rem',
                    py: 1.2,
                    borderRadius: 1,
                  }}
                >
                  Edit Plan
                </Button>
              </CardContent>
            </Card>

            {/* Share & Menu buttons */}
            <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'center' }}>
              <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
                <ShareIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={{ border: '1px solid #e0e0e0' }}>
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* Right Content - Timeline */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* 日程詳細 */}
          <Stack spacing={3}>
            {Array.from(groupedItems.entries())
              .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
              .map(([date, items]) => (
                <Box key={date}>
                  {/* Timeline View */}
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
      </Box>

      {/* Mobile Bottom CTA Button */}
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

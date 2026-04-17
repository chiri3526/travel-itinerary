import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CameraAltOutlinedIcon from '@mui/icons-material/CameraAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryService from '../services/ItineraryService';
import { getSafeCoverImage, validateCoverImageFile } from '../utils/coverImage';
import { linkifyText } from '../utils/linkify';

const formatDate = (value: string, pattern = 'yyyy年M月d日(E)') => {
  try {
    return format(new Date(value), pattern, { locale: ja });
  } catch {
    return value;
  }
};

const ItineraryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItinerary, updateItinerary } = useItinerary();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itinerary = id ? getItinerary(id) : undefined;
  const coverImage = getSafeCoverImage(itinerary?.coverImage);

  if (!itinerary) {
    return (
      <Container>
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5">旅の内容が見つかりませんでした</Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
              一覧に戻って、別の旅を開いてください。
            </Typography>
            <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate('/')}>
              一覧へ戻る
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  const groupedItems = ItineraryService.groupItemsByDate(itinerary.items);
  const totalAmount = ItineraryService.calculateTotalAmount(itinerary.items);
  const dayCount =
    Math.floor(
      (new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) {
      return;
    }

    const validationError = validateCoverImageFile(file);
    if (validationError) {
      window.alert(validationError);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const result = getSafeCoverImage(loadEvent.target?.result as string);
      if (!result) {
        window.alert('画像を読み込めませんでした。PNG か JPEG などをお試しください。');
        return;
      }

      await updateItinerary(id, { coverImage: result });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <Container sx={{ px: { xs: 0, md: 1 } }}>
      <Stack spacing={3} sx={{ pb: isMobile ? 11 : 0 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 1, md: 0 },
          }}
        >
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/')} variant="text">
            一覧へ戻る
          </Button>
          {!isMobile && (
            <Button variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/edit/${id}`)}>
              編集する
            </Button>
          )}
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '320px minmax(0, 1fr)' }, gap: 3 }}>
          <Card sx={{ overflow: 'hidden', alignSelf: 'start' }}>
            <Box
              sx={{
                minHeight: 220,
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                background: coverImage
                  ? `center / cover no-repeat url(${coverImage})`
                  : 'linear-gradient(180deg, rgba(236,229,216,0.95), rgba(245,240,230,0.98))',
                display: 'flex',
                alignItems: 'flex-end',
              }}
            >
              <Button
                size="small"
                variant="outlined"
                startIcon={<CameraAltOutlinedIcon />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ ml: 'auto', backgroundColor: 'rgba(255,255,255,0.72)' }}
              >
                表紙を変更
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </Box>

            <CardContent sx={{ p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                旅の概要
              </Typography>
              <Typography variant="h4" sx={{ fontSize: '1.85rem', mt: 0.75, lineHeight: 1.35 }}>
                {itinerary.title}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5 }}>
                {formatDate(itinerary.startDate)}
                {dayCount > 1 ? ` から ${formatDate(itinerary.endDate)}` : ''}
              </Typography>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 2 }}>
                <Chip label={`${dayCount}日間`} variant="outlined" />
                <Chip label={`予定 ${itinerary.items.length}件`} variant="outlined" />
                <Chip label={`予算 ¥${totalAmount.toLocaleString()}`} variant="outlined" />
              </Stack>

              <Box
                sx={{
                  mt: 3,
                  p: 2.25,
                  borderRadius: 2,
                  backgroundColor: alpha('#FFFFFF', 0.55),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', gap: 1.25 }}>
                    <PlaceOutlinedIcon fontSize="small" sx={{ color: 'secondary.main', mt: 0.25 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        日程
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(itinerary.startDate, 'M月d日')} - {formatDate(itinerary.endDate, 'M月d日')}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1.25 }}>
                    <ReceiptLongOutlinedIcon fontSize="small" sx={{ color: 'secondary.main', mt: 0.25 }} />
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        更新日
                      </Typography>
                      <Typography variant="body1">{formatDate(itinerary.updatedAt, 'yyyy年M月d日')}</Typography>
                    </Box>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Typography variant="body2" color="text.secondary">
                当日の流れ
              </Typography>
              <Typography variant="h4" sx={{ mt: 0.75, fontSize: { xs: '1.55rem', md: '1.95rem' } }}>
                旅程
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                時間、内容、メモを順に追えるように並べています。
              </Typography>

              {itinerary.items.length === 0 ? (
                <Box
                  sx={{
                    mt: 4,
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    py: 7,
                    px: 3,
                    textAlign: 'center',
                    backgroundColor: alpha('#FFFDF8', 0.74),
                  }}
                >
                  <Typography variant="h6">まだ予定が入っていません</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    編集画面から予定を追加すると、ここで順番に確認できます。
                  </Typography>
                  <Button sx={{ mt: 3 }} variant="contained" onClick={() => navigate(`/edit/${id}`)}>
                    予定を追加する
                  </Button>
                </Box>
              ) : (
                <Stack spacing={4} sx={{ mt: 4 }}>
                  {Array.from(groupedItems.entries())
                    .sort(([left], [right]) => left.localeCompare(right))
                    .map(([date, items]) => (
                      <Box key={date} sx={{ position: 'relative', pl: 4 }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            left: 10,
                            top: 8,
                            bottom: 8,
                            width: 2,
                            backgroundColor: alpha('#5F7A65', 0.18),
                          }}
                        />
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            minHeight: 32,
                            px: 1.25,
                            borderRadius: 1,
                            backgroundColor: alpha('#FFFFFF', 0.65),
                            border: '1px solid',
                            borderColor: 'divider',
                            mb: 2.5,
                          }}
                        >
                          {formatDate(date)}
                        </Box>
                        <Stack spacing={2.5}>
                          {[...items]
                            .sort((left, right) => left.time.localeCompare(right.time))
                            .map((item) => (
                              <Box key={item.id} sx={{ position: 'relative' }}>
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    left: -30,
                                    top: 14,
                                    width: 12,
                                    height: 12,
                                    borderRadius: '50%',
                                    backgroundColor: '#FFFDF8',
                                    border: '3px solid',
                                    borderColor: 'secondary.main',
                                  }}
                                />
                                <Box
                                  sx={{
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: alpha('#FFFDF8', 0.9),
                                    p: { xs: 2, md: 2.5 },
                                  }}
                                >
                                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between">
                                    <Box sx={{ minWidth: 0 }}>
                                      <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 700 }}>
                                        {item.time || '時間未設定'}
                                      </Typography>
                                      <Typography variant="h6" sx={{ mt: 0.75, fontSize: '1.1rem', lineHeight: 1.4 }}>
                                        {item.content || '予定未設定'}
                                      </Typography>
                                      {item.note && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.8 }}>
                                          {linkifyText(item.note)}
                                        </Typography>
                                      )}
                                    </Box>
                                    {item.amount > 0 && (
                                      <Chip
                                        label={`¥${item.amount.toLocaleString()}`}
                                        variant="outlined"
                                        sx={{ alignSelf: 'flex-start' }}
                                      />
                                    )}
                                  </Stack>
                                </Box>
                              </Box>
                            ))}
                        </Stack>
                      </Box>
                    ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>
      </Stack>

      {isMobile && (
        <Box
          sx={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            p: 2,
            backgroundColor: alpha('#F5F0E6', 0.96),
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Button fullWidth variant="contained" startIcon={<EditOutlinedIcon />} onClick={() => navigate(`/edit/${id}`)}>
            編集する
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default ItineraryDetailPage;

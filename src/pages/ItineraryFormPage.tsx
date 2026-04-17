/* eslint-disable react-hooks/set-state-in-effect */
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PhotoCameraBackOutlinedIcon from '@mui/icons-material/PhotoCameraBackOutlined';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import {
  alpha,
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ja } from 'date-fns/locale';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageSection from '../components/PageSection';
import TimelineItem from '../components/TimelineItem';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryService from '../services/ItineraryService';
import type { ItineraryItem } from '../types';
import { getSafeCoverImage, validateCoverImageFile } from '../utils/coverImage';

const ItineraryFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { addItinerary, getItinerary, updateItinerary } = useItinerary();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [coverImage, setCoverImage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationError, setShowValidationError] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }

    const itinerary = getItinerary(id);
    if (!itinerary) {
      return;
    }

    setTitle(itinerary.title);
    setStartDate(new Date(itinerary.startDate));
    setEndDate(new Date(itinerary.endDate));
    setItems(itinerary.items);
    setCoverImage(getSafeCoverImage(itinerary.coverImage) || '');
  }, [getItinerary, id]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const generateItemId = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  const handleAddItem = () => {
    setItems((current) => [
      ...current,
      {
        id: generateItemId(),
        date: startDate ? startDate.toISOString().split('T')[0] : '',
        time: '',
        content: '',
        amount: 0,
        note: '',
      },
    ]);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setItems((current) => {
      const oldIndex = current.findIndex((item) => item.id === active.id);
      const newIndex = current.findIndex((item) => item.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = '旅の名前を入力してください。';
    } else if (title.trim().length > 100) {
      nextErrors.title = '旅の名前は100文字以内で入力してください。';
    }

    if (!startDate) {
      nextErrors.startDate = '出発日を選んでください。';
    }

    if (!endDate) {
      nextErrors.endDate = '帰着日を選んでください。';
    }

    if (startDate && endDate) {
      if (!ItineraryService.validateDates(startDate.toISOString(), endDate.toISOString())) {
        nextErrors.dates = '帰着日は出発日以降にしてください。';
      }

      const dayDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (dayDiff > 365) {
        nextErrors.dates = '旅程は1年以内で入力してください。';
      }
    }

    items.forEach((item, index) => {
      if (item.amount < 0) {
        nextErrors[`amount-${index}`] = `${index + 1}件目の金額は0円以上で入力してください。`;
      }
      if (item.content.length > 200) {
        nextErrors[`content-${index}`] = `${index + 1}件目の予定は200文字以内で入力してください。`;
      }
      if (item.note.length > 500) {
        nextErrors[`note-${index}`] = `${index + 1}件目のメモは500文字以内で入力してください。`;
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validate()) {
      setShowValidationError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      const itineraryData = {
        title: title.trim(),
        startDate: startDate!.toISOString().split('T')[0],
        endDate: endDate!.toISOString().split('T')[0],
        items,
        coverImage,
      };

      if (id) {
        await updateItinerary(id, itineraryData);
      } else {
        await addItinerary(itineraryData);
      }

      navigate('/');
    } catch (error) {
      setShowValidationError(true);
      setErrors({
        submit: error instanceof Error ? error.message : '保存中にエラーが発生しました。',
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container sx={{ px: { xs: 0, md: 1 } }}>
        <Stack spacing={3} component="form" onSubmit={handleSubmit}>
          <Box sx={{ px: { xs: 1, md: 0 } }}>
            <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/')} variant="text">
              一覧へ戻る
            </Button>
          </Box>

          <PageSection
            eyebrow={id ? '旅程の編集' : '新しい旅程'}
            title={id ? '旅程を編集する' : '旅程を作成する'}
            description="名前、日程、予定を入力して保存します。"
            action={
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', md: 'auto' } }}>
                <Button variant="outlined" onClick={() => navigate('/')}>
                  戻る
                </Button>
                <Button variant="contained" startIcon={<SaveRoundedIcon />} type="submit">
                  保存する
                </Button>
              </Stack>
            }
          >
            {showValidationError && Object.keys(errors).length > 0 && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setShowValidationError(false)}>
                入力内容を確認してください。
              </Alert>
            )}

            <Stack spacing={3.5}>
              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant="h6">基本情報</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2.5, lineHeight: 1.8 }}>
                    旅の名前と日程を入力します。
                  </Typography>

                  <Stack spacing={2}>
                    <TextField
                      label="旅の名前"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder="例: 初夏の金沢ひとり旅"
                      error={Boolean(errors.title)}
                      helperText={errors.title}
                      fullWidth
                    />

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                      <DatePicker
                        label="出発日"
                        value={startDate}
                        onChange={(value) => setStartDate(value)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(errors.startDate),
                            helperText: errors.startDate,
                          },
                        }}
                      />
                      <DatePicker
                        label="帰着日"
                        value={endDate}
                        onChange={(value) => setEndDate(value)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: Boolean(errors.endDate),
                            helperText: errors.endDate,
                          },
                        }}
                      />
                    </Stack>

                    {errors.dates && (
                      <Typography color="error" variant="caption">
                        {errors.dates}
                      </Typography>
                    )}
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Typography variant="h6">表紙画像</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.8 }}>
                    必要な場合のみ表紙画像を設定できます。
                  </Typography>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} sx={{ mt: 2.5 }}>
                    <Box
                      sx={{
                        width: { xs: '100%', md: 260 },
                        height: 200,
                        borderRadius: 2,
                        overflow: 'hidden',
                        border: '1px dashed',
                        borderColor: errors.coverImage ? 'error.main' : 'divider',
                        background: getSafeCoverImage(coverImage)
                          ? `center / cover no-repeat url(${getSafeCoverImage(coverImage)})`
                          : 'linear-gradient(180deg, rgba(236,229,216,0.95), rgba(245,240,230,0.98))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      {!coverImage && (
                        <>
                          <PhotoCameraBackOutlinedIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                          <Typography variant="body2" color="text.secondary">
                            表紙画像を設定できます
                          </Typography>
                        </>
                      )}
                    </Box>

                    <Stack spacing={1.5} alignItems="flex-start" justifyContent="center">
                      <Button variant="outlined" component="label" startIcon={<PhotoCameraBackOutlinedIcon />}>
                        画像を選ぶ
                        <input
                          hidden
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }

                            const validationError = validateCoverImageFile(file);
                            if (validationError) {
                              setErrors((current) => ({
                                ...current,
                                coverImage: validationError,
                              }));
                              return;
                            }

                            const reader = new FileReader();
                            reader.onload = (loadEvent) => {
                              const nextCoverImage = getSafeCoverImage(loadEvent.target?.result as string);
                              if (!nextCoverImage) {
                                setErrors((current) => ({
                                  ...current,
                                  coverImage: '画像を読み込めませんでした。PNG か JPEG などをお試しください。',
                                }));
                                return;
                              }
                              setCoverImage(nextCoverImage);
                              setErrors((current) => {
                                const next = { ...current };
                                delete next.coverImage;
                                return next;
                              });
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </Button>

                      {coverImage && (
                        <Button
                          variant="text"
                          color="inherit"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => setCoverImage('')}
                        >
                          画像を外す
                        </Button>
                      )}

                      {errors.coverImage && (
                        <Typography variant="caption" color="error">
                          {errors.coverImage}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Card>
                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
                    <Box>
                      <Typography variant="h6">予定の内容</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, lineHeight: 1.8 }}>
                        時間、内容、メモ、予算を追加できます。順番の変更もできます。
                      </Typography>
                    </Box>
                    <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={handleAddItem}>
                      予定を追加
                    </Button>
                  </Stack>

                  <Divider sx={{ my: 3 }} />

                  {items.length === 0 ? (
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        py: 6,
                        px: 3,
                        textAlign: 'center',
                        backgroundColor: alpha('#FFFDF8', 0.75),
                      }}
                    >
                      <Typography variant="h6">まだ予定がありません</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                        予定を追加して旅程を作成します。
                      </Typography>
                      <Button sx={{ mt: 3 }} variant="outlined" startIcon={<AddRoundedIcon />} onClick={handleAddItem}>
                        最初の予定を追加
                      </Button>
                    </Box>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
                        <Box>
                          {items.map((item) => (
                            <TimelineItem
                              key={item.id}
                              item={item}
                              onChange={(itemId, field, value) =>
                                setItems((current) =>
                                  current.map((entry) =>
                                    entry.id === itemId ? { ...entry, [field]: value } : entry,
                                  ),
                                )
                              }
                              onDelete={(itemId) =>
                                setItems((current) => current.filter((entry) => entry.id !== itemId))
                              }
                            />
                          ))}
                        </Box>
                      </SortableContext>
                    </DndContext>
                  )}
                </CardContent>
              </Card>
            </Stack>
          </PageSection>

          <Box
            sx={{
              position: 'sticky',
              bottom: 12,
              zIndex: 3,
              mx: { xs: 1, md: 0 },
            }}
          >
            <Box
              sx={{
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: alpha('#FFFDF8', 0.95),
                boxShadow: '0 10px 22px rgba(91, 65, 46, 0.06)',
                px: 1.25,
                py: 1.25,
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
                <Button fullWidth variant="outlined" onClick={handleAddItem} startIcon={<AddRoundedIcon />}>
                  予定を追加
                </Button>
                <Button fullWidth variant="outlined" onClick={() => navigate('/')}>
                  戻る
                </Button>
                <Button fullWidth variant="contained" type="submit" startIcon={<SaveRoundedIcon />}>
                  保存する
                </Button>
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Container>
    </LocalizationProvider>
  );
};

export default ItineraryFormPage;

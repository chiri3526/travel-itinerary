import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Stack,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useItinerary } from '../contexts/ItineraryContext';
import type { ItineraryItem } from '../types';
import TimelineItem from '../components/TimelineItem';
import ItineraryService from '../services/ItineraryService';

const ItineraryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getItinerary, addItinerary, updateItinerary } = useItinerary();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [items, setItems] = useState<ItineraryItem[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showValidationError, setShowValidationError] = useState(false);

  useEffect(() => {
    if (id) {
      const itinerary = getItinerary(id);
      if (itinerary) {
        setTitle(itinerary.title);
        setStartDate(new Date(itinerary.startDate));
        setEndDate(new Date(itinerary.endDate));
        setItems(itinerary.items);
      }
    }
  }, [id, getItinerary]);

  const generateItemId = () => {
    return `item-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  };

  const handleAddItem = () => {
    const newItem: ItineraryItem = {
      id: generateItemId(),
      date: startDate ? startDate.toISOString().split('T')[0] : '',
      time: '',
      content: '',
      amount: 0,
      note: '',
    };
    setItems([...items, newItem]);
  };

  const handleItemChange = (id: string, field: keyof ItineraryItem, value: string | number) => {
    setItems(items.map(item => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  // ドラッグ&ドロップのセンサー設定
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ終了時の処理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate title
    if (!title.trim()) {
      newErrors.title = '旅行名を入力してください';
    } else if (title.trim().length > 100) {
      newErrors.title = '旅行名は100文字以内で入力してください';
    } else if (title.trim().length < 1) {
      newErrors.title = '旅行名は1文字以上で入力してください';
    }

    // Validate start date
    if (!startDate) {
      newErrors.startDate = '開始日を選択してください';
    } else if (isNaN(startDate.getTime())) {
      newErrors.startDate = '有効な日付を選択してください';
    } else {
      // Check if date is too far in the past or future
      const year = startDate.getFullYear();
      if (year < 1900 || year > 2100) {
        newErrors.startDate = '1900年から2100年の間の日付を選択してください';
      }
    }

    // Validate end date
    if (!endDate) {
      newErrors.endDate = '終了日を選択してください';
    } else if (isNaN(endDate.getTime())) {
      newErrors.endDate = '有効な日付を選択してください';
    } else {
      // Check if date is too far in the past or future
      const year = endDate.getFullYear();
      if (year < 1900 || year > 2100) {
        newErrors.endDate = '1900年から2100年の間の日付を選択してください';
      }
    }

    // Validate date range
    if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];
      if (!ItineraryService.validateDates(startStr, endStr)) {
        newErrors.dates = '終了日は開始日以降の日付を選択してください';
      }
      
      // Check if date range is reasonable (not more than 1 year)
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        newErrors.dates = '旅行期間は1年以内で設定してください';
      }
    }

    // Validate items
    items.forEach((item, index) => {
      if (item.amount < 0) {
        newErrors[`item-${index}-amount`] = `行${index + 1}: 金額は0以上の値を入力してください`;
      }
      if (!Number.isFinite(item.amount)) {
        newErrors[`item-${index}-amount`] = `行${index + 1}: 有効な金額を入力してください`;
      }
      if (item.amount > 10000000) {
        newErrors[`item-${index}-amount`] = `行${index + 1}: 金額は10,000,000以下で入力してください`;
      }
      if (item.content && item.content.length > 200) {
        newErrors[`item-${index}-content`] = `行${index + 1}: 内容は200文字以内で入力してください`;
      }
      if (item.note && item.note.length > 500) {
        newErrors[`item-${index}-note`] = `行${index + 1}: 備考は500文字以内で入力してください`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      setShowValidationError(true);
      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setShowValidationError(false);

    try {
      const itineraryData = {
        title,
        startDate: startDate!.toISOString().split('T')[0],
        endDate: endDate!.toISOString().split('T')[0],
        items,
      };

      if (id) {
        updateItinerary(id, itineraryData);
      } else {
        addItinerary(itineraryData);
      }

      navigate('/');
    } catch (error) {
      // Error will be handled by context and shown in notification
      setShowValidationError(true);
      const errorMessage = error instanceof Error ? error.message : '保存中にエラーが発生しました';
      setErrors({ submit: errorMessage });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
            {id ? '行程表を編集' : '新しい行程表を作成'}
          </Typography>

          {showValidationError && Object.keys(errors).length > 0 && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setShowValidationError(false)}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                入力内容に誤りがあります
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {Object.values(errors).map((error, index) => (
                  <li key={index}>
                    <Typography variant="body2">{error}</Typography>
                  </li>
                ))}
              </Box>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <TextField
                label="旅行名"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                fullWidth
                required
                error={!!errors.title}
                helperText={errors.title}
                sx={{ mb: { xs: 2, sm: 2 } }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2, sm: 2 }}>
                <DatePicker
                  label="開始日"
                  value={startDate}
                  onChange={(date) => setStartDate(date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.startDate,
                      helperText: errors.startDate,
                    },
                  }}
                  sx={{ width: '100%' }}
                />
                <DatePicker
                  label="終了日"
                  value={endDate}
                  onChange={(date) => setEndDate(date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!errors.endDate,
                      helperText: errors.endDate,
                    },
                  }}
                  sx={{ width: '100%' }}
                />
              </Stack>
              {errors.dates && (
                <Typography color="error" variant="caption" sx={{ mt: 1, display: 'block' }}>
                  {errors.dates}
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }}>
                行程詳細
              </Typography>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <Box sx={{ position: 'relative' }}>
                  <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                    {items.map((item) => (
                      <TimelineItem
                        key={item.id}
                        item={item}
                        onChange={handleItemChange}
                        onDelete={handleDeleteItem}
                      />
                    ))}
                  </SortableContext>
                </Box>
              </DndContext>

              <Button
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                variant="contained"
                fullWidth
                sx={{ 
                  mt: 2,
                }}
              >
                行を追加
              </Button>
            </Box>

            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2} 
              justifyContent="flex-end"
            >
              <Button 
                variant="outlined" 
                onClick={handleCancel}
                fullWidth={false}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                キャンセル
              </Button>
              <Button 
                type="submit" 
                variant="contained"
                fullWidth={false}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                保存
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default ItineraryFormPage;

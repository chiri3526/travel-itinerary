import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import {
  alpha,
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';
import { useState } from 'react';
import type { ItineraryItem } from '../types';

interface TimelineItemProps {
  item: ItineraryItem;
  onChange: (id: string, field: keyof ItineraryItem, value: string | number) => void;
  onDelete: (id: string) => void;
}

const TimelineItem = ({ item, onChange, onDelete }: TimelineItemProps) => {
  const [amountError, setAmountError] = useState('');

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const handleAmountChange = (value: string) => {
    if (value === '') {
      setAmountError('');
      onChange(item.id, 'amount', 0);
      return;
    }

    const amount = Number(value);
    if (Number.isNaN(amount)) {
      setAmountError('金額は数字で入力してください。');
      return;
    }
    if (amount < 0) {
      setAmountError('金額は 0 円以上で入力してください。');
      return;
    }
    if (!Number.isFinite(amount)) {
      setAmountError('有効な金額を入力してください。');
      return;
    }

    setAmountError('');
    onChange(item.id, 'amount', amount);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{ display: 'flex', gap: { xs: 1.5, md: 2 }, alignItems: 'stretch', mb: 2.5 }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
        <IconButton
          size="small"
          {...attributes}
          {...listeners}
          sx={{
            cursor: isDragging ? 'grabbing' : 'grab',
            backgroundColor: 'rgba(255,255,255,0.84)',
            border: '1px solid',
            borderColor: 'divider',
            color: 'secondary.main',
          }}
        >
          <DragIndicatorRoundedIcon fontSize="small" />
        </IconButton>
        <Box
          sx={{
            flex: 1,
            width: 2,
            minHeight: 56,
            mt: 1,
            borderRadius: 99,
            backgroundColor: alpha('#5F7A65', 0.22),
          }}
        />
      </Box>

      <Card
        sx={{
          flex: 1,
          backgroundColor: alpha('#FFFDF8', 0.96),
          borderStyle: 'dashed',
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 }, '&:last-child': { pb: { xs: 2, md: 2.5 } } }}>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  日付
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={item.date}
                  onChange={(event) => onChange(item.id, 'date', event.target.value)}
                />
              </Box>
              <Box sx={{ flex: { xs: 1, sm: '0 0 180px' } }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  時間
                </Typography>
                <TextField
                  type="time"
                  fullWidth
                  size="small"
                  value={item.time}
                  onChange={(event) => onChange(item.id, 'time', event.target.value)}
                />
              </Box>
            </Stack>

            <Box>
              <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                予定
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={item.content}
                placeholder="例: 駅に到着してホテルへ移動"
                onChange={(event) => onChange(item.id, 'content', event.target.value)}
              />
            </Box>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
              <Box sx={{ width: { xs: '100%', sm: 180 } }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  使った予算
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={item.amount || ''}
                  onChange={(event) => handleAmountChange(event.target.value)}
                  error={Boolean(amountError)}
                  helperText={amountError || '未入力でも大丈夫です'}
                  inputProps={{ min: 0 }}
                />
              </Box>
              <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700 }}>
                  メモ
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  size="small"
                  value={item.note}
                  placeholder="待ち合わせ場所や持ち物などを残せます"
                  onChange={(event) => onChange(item.id, 'note', event.target.value)}
                />
              </Box>
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <IconButton color="error" onClick={() => onDelete(item.id)} aria-label="行を削除">
                <DeleteOutlineIcon />
              </IconButton>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimelineItem;

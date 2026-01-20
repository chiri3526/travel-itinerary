import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ItineraryItem } from '../types';

interface TimelineItemProps {
  item: ItineraryItem;
  onChange: (id: string, field: keyof ItineraryItem, value: string | number) => void;
  onDelete: (id: string) => void;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ item, onChange, onDelete }) => {
  const [amountError, setAmountError] = useState<string>('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleAmountChange = (value: string) => {
    if (value === '') {
      setAmountError('');
      onChange(item.id, 'amount', 0);
      return;
    }

    const numValue = Number(value);

    if (isNaN(numValue)) {
      setAmountError('数値を入力してください');
      return;
    }

    if (numValue < 0) {
      setAmountError('0以上の値を入力してください');
      return;
    }

    if (!Number.isFinite(numValue)) {
      setAmountError('有効な数値を入力してください');
      return;
    }

    setAmountError('');
    onChange(item.id, 'amount', numValue);
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        gap: { xs: 1, sm: 2 },
        mb: { xs: 2, sm: 3 },
        alignItems: 'flex-start',
      }}
    >
      {/* Timeline dot and line */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        <IconButton
          size="small"
          {...attributes}
          {...listeners}
          sx={{
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'primary.main',
            p: 0.5,
            mb: 1,
          }}
        >
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'inherit',
            }}
          />
        </IconButton>
        <Box
          sx={{
            position: 'absolute',
            left: '50%',
            top: '100%',
            width: 2,
            height: { xs: 'calc(100% + 1rem)', sm: 'calc(100% + 1.5rem)' },
            backgroundColor: '#e0e0e0',
            transform: 'translateX(-50%)',
          }}
        />
      </Box>

      {/* Card content */}
      <Card
        sx={{
          flex: 1,
          mb: { xs: 0, sm: 0 },
          backgroundColor: '#fafafa',
          border: '1px solid #e8e8e8',
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 }, '&:last-child': { pb: 2 } }}>
          {/* Date & Time Row */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                textTransform: 'uppercase',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              DATE & TIME
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1, sm: 2 }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <TextField
                type="date"
                value={item.date}
                onChange={(e) => onChange(item.id, 'date', e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 140 },
                  '& input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
              <TextField
                type="time"
                value={item.time}
                onChange={(e) => onChange(item.id, 'time', e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: '100%', sm: 120 },
                  '& input': {
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                  },
                }}
              />
            </Stack>
          </Box>

          {/* Activity Row */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                textTransform: 'uppercase',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              ACTIVITY
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 1 }} alignItems="flex-start">
              <TextField
                value={item.content}
                onChange={(e) => onChange(item.id, 'content', e.target.value)}
                placeholder="活動内容を入力"
                size="small"
                fullWidth
                sx={{
                  flex: { xs: 'unset', sm: 1 },
                  '& input::placeholder': {
                    opacity: 0.6,
                  },
                }}
              />
              <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                <TextField
                  type="number"
                  value={item.amount || ''}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0"
                  size="small"
                  error={!!amountError}
                  helperText={amountError}
                  inputProps={{ min: 0 }}
                  sx={{
                    flex: 1,
                    minWidth: 80,
                    '& input::placeholder': {
                      opacity: 0.6,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    pt: 1,
                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                    minWidth: 'fit-content',
                  }}
                >
                  JPY
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* Notes Row */}
          <Box sx={{ mb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: 'text.secondary',
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                textTransform: 'uppercase',
                fontWeight: 600,
                mb: 0.5,
              }}
            >
              NOTES / REMARKS
            </Typography>
            <TextField
              value={item.note}
              onChange={(e) => onChange(item.id, 'note', e.target.value)}
              placeholder="詳細、チケット、方向などを追加..."
              size="small"
              fullWidth
              multiline
              rows={2}
              sx={{
                '& .MuiOutlinedInput-input::placeholder': {
                  opacity: 0.5,
                },
              }}
            />
          </Box>

          {/* Delete button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
            <IconButton
              onClick={() => onDelete(item.id)}
              color="error"
              size="small"
              sx={{
                p: 0.5,
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default TimelineItem;

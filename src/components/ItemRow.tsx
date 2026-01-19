import React, { useState } from 'react';
import { TableRow, TableCell, TextField, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ItineraryItem } from '../types';

interface ItemRowProps {
  item: ItineraryItem;
  onChange: (id: string, field: keyof ItineraryItem, value: string | number) => void;
  onDelete: (id: string) => void;
}

const ItemRow: React.FC<ItemRowProps> = ({ item, onChange, onDelete }) => {
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
    // Allow empty string for clearing the field
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
    <TableRow ref={setNodeRef} style={style}>
      <TableCell sx={{ px: { xs: 0.5, sm: 1 }, width: 40 }}>
        <IconButton
          size="small"
          {...attributes}
          {...listeners}
          sx={{ 
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main' }
          }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
        <TextField
          type="date"
          value={item.date}
          onChange={(e) => onChange(item.id, 'date', e.target.value)}
          size="small"
          fullWidth
          sx={{ minWidth: { xs: 110, sm: 140 } }}
        />
      </TableCell>
      <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
        <TextField
          type="time"
          value={item.time}
          onChange={(e) => onChange(item.id, 'time', e.target.value)}
          size="small"
          fullWidth
          sx={{ minWidth: { xs: 90, sm: 120 } }}
        />
      </TableCell>
      <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
        <TextField
          value={item.content}
          onChange={(e) => onChange(item.id, 'content', e.target.value)}
          placeholder="内容"
          size="small"
          fullWidth
          sx={{ minWidth: { xs: 140, sm: 180 } }}
        />
      </TableCell>
      <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
        <TextField
          type="number"
          value={item.amount}
          onChange={(e) => handleAmountChange(e.target.value)}
          placeholder="金額"
          size="small"
          fullWidth
          error={!!amountError}
          helperText={amountError}
          inputProps={{ min: 0 }}
          sx={{ minWidth: { xs: 90, sm: 120 } }}
        />
      </TableCell>
      <TableCell sx={{ px: { xs: 1, sm: 2 } }}>
        <TextField
          value={item.note}
          onChange={(e) => onChange(item.id, 'note', e.target.value)}
          placeholder="備考"
          size="small"
          fullWidth
          sx={{ minWidth: { xs: 110, sm: 140 } }}
        />
      </TableCell>
      <TableCell sx={{ px: { xs: 0.5, sm: 2 } }}>
        <IconButton onClick={() => onDelete(item.id)} color="error" size="small">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ItemRow;

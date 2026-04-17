import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import { IconButton, TableCell, TableRow, TextField } from '@mui/material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import type { ItineraryItem } from '../types';

interface ItemRowProps {
  item: ItineraryItem;
  onChange: (id: string, field: keyof ItineraryItem, value: string | number) => void;
  onDelete: (id: string) => void;
}

const ItemRow = ({ item, onChange, onDelete }: ItemRowProps) => {
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
      setAmountError('数字で入力してください');
      return;
    }
    if (amount < 0) {
      setAmountError('0 以上を入力してください');
      return;
    }
    if (!Number.isFinite(amount)) {
      setAmountError('有効な金額を入力してください');
      return;
    }

    setAmountError('');
    onChange(item.id, 'amount', amount);
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell sx={{ width: 52 }}>
        <IconButton {...attributes} {...listeners} sx={{ cursor: isDragging ? 'grabbing' : 'grab' }}>
          <DragIndicatorRoundedIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell>
        <TextField
          type="date"
          fullWidth
          size="small"
          value={item.date}
          onChange={(event) => onChange(item.id, 'date', event.target.value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="time"
          fullWidth
          size="small"
          value={item.time}
          onChange={(event) => onChange(item.id, 'time', event.target.value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          fullWidth
          size="small"
          value={item.content}
          placeholder="予定"
          onChange={(event) => onChange(item.id, 'content', event.target.value)}
        />
      </TableCell>
      <TableCell>
        <TextField
          type="number"
          fullWidth
          size="small"
          value={item.amount || ''}
          placeholder="0"
          onChange={(event) => handleAmountChange(event.target.value)}
          error={Boolean(amountError)}
          helperText={amountError}
          inputProps={{ min: 0 }}
        />
      </TableCell>
      <TableCell>
        <TextField
          fullWidth
          size="small"
          value={item.note}
          placeholder="メモ"
          onChange={(event) => onChange(item.id, 'note', event.target.value)}
        />
      </TableCell>
      <TableCell sx={{ width: 64 }}>
        <IconButton color="error" onClick={() => onDelete(item.id)}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
};

export default ItemRow;

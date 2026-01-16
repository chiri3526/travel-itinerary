import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import { useNavigate } from 'react-router-dom';
import type { Itinerary } from '../types';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary, onDelete, onExport }) => {
  const navigate = useNavigate();

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年M月d日', { locale: ja });
    } catch {
      return dateStr;
    }
  };

  const handleDetail = () => {
    navigate(`/detail/${itinerary.id}`);
  };

  const handleEdit = () => {
    navigate(`/edit/${itinerary.id}`);
  };

  const handleDelete = () => {
    if (window.confirm(`「${itinerary.title}」を削除しますか？`)) {
      onDelete(itinerary.id);
    }
  };

  const handleExport = () => {
    onExport(itinerary.id);
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography 
          variant="h6" 
          component="div" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
            wordBreak: 'break-word'
          }}
        >
          {itinerary.title}
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Chip
            label={`${formatDate(itinerary.startDate)} 〜 ${formatDate(itinerary.endDate)}`}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ 
              fontSize: { xs: '0.65rem', sm: '0.75rem' },
              height: { xs: 24, sm: 28 }
            }}
          />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          作成日: {formatDate(itinerary.createdAt.split('T')[0])}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          行程数: {itinerary.items.length}件
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <IconButton size="small" onClick={handleDetail} title="詳細">
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleEdit} title="編集">
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleExport} title="エクスポート">
          <DownloadIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleDelete} color="error" title="削除">
          <DeleteIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ItineraryCard;

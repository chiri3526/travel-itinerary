import React, { useRef } from 'react';
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
import { useItinerary } from '../contexts/ItineraryContext';
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
  const { updateItinerary } = useItinerary();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleEditImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64String = e.target?.result as string;
        // Update the itinerary with the new cover image
        try {
          await updateItinerary(itinerary.id, {
            ...itinerary,
            coverImage: base64String,
          });
        } catch (error) {
          console.error('Failed to update image:', error);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {itinerary.coverImage && (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: 200,
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={itinerary.coverImage}
            alt={itinerary.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          {window.innerWidth <= 768 && (
            <IconButton
              size="small"
              onClick={handleEditImageClick}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </Box>
      )}
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

import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PhotoCameraBackOutlinedIcon from '@mui/icons-material/PhotoCameraBackOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  alpha,
  Box,
  Card,
  CardActions,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useItinerary } from '../contexts/ItineraryContext';
import type { Itinerary } from '../types';

interface ItineraryCardProps {
  itinerary: Itinerary;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

const formatDate = (value: string) => {
  try {
    return format(new Date(value), 'yyyy年M月d日', { locale: ja });
  } catch {
    return value;
  }
};

const ItineraryCard = ({ itinerary, onDelete, onExport }: ItineraryCardProps) => {
  const navigate = useNavigate();
  const { updateItinerary } = useItinerary();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = () => {
    if (window.confirm(`「${itinerary.title}」を削除しますか？`)) {
      onDelete(itinerary.id);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (loadEvent) => {
      const result = loadEvent.target?.result as string;
      await updateItinerary(itinerary.id, { coverImage: result });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box
        sx={{
          height: 180,
          background: itinerary.coverImage
            ? `center / cover no-repeat url(${itinerary.coverImage})`
            : `linear-gradient(145deg, ${alpha('#EFE0C7', 0.94)}, ${alpha('#D7B89A', 0.86)})`,
          position: 'relative',
          p: 2,
        }}
      >
        {!itinerary.coverImage && (
          <Stack spacing={1} sx={{ maxWidth: 180 }}>
            <Chip label="旅の下書き" size="small" sx={{ width: 'fit-content', bgcolor: alpha('#fff', 0.72) }} />
            <Typography variant="h6">{itinerary.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              ページをめくるように予定を育てられます。
            </Typography>
          </Stack>
        )}
        <IconButton
          size="small"
          onClick={(event) => {
            event.stopPropagation();
            fileInputRef.current?.click();
          }}
          sx={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            bgcolor: alpha('#fff', 0.82),
          }}
        >
          <PhotoCameraBackOutlinedIcon fontSize="small" />
        </IconButton>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </Box>

      <CardContent sx={{ flex: 1 }}>
        <Stack spacing={1.25}>
          <Typography variant="h6">{itinerary.title}</Typography>
          <Chip
            label={`${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`}
            variant="outlined"
            size="small"
            sx={{ width: 'fit-content' }}
          />
          <Typography variant="body2" color="text.secondary">
            予定数 {itinerary.items.length} 件
          </Typography>
          <Typography variant="body2" color="text.secondary">
            作成日 {formatDate(itinerary.createdAt)}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={() => navigate(`/detail/${itinerary.id}`)}>
            <VisibilityOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => navigate(`/edit/${itinerary.id}`)}>
            <EditOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => onExport(itinerary.id)}>
            <DownloadRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>
        <IconButton size="small" color="error" onClick={handleDelete}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default ItineraryCard;

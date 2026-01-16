import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Chip,
  Box,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useItinerary } from '../contexts/ItineraryContext';
import ItineraryService from '../services/ItineraryService';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

const ItineraryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItinerary, exportItinerary } = useItinerary();

  const itinerary = id ? getItinerary(id) : undefined;

  if (!itinerary) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h6">行程表が見つかりません</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>
          一覧に戻る
        </Button>
      </Container>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'yyyy年M月d日', { locale: ja });
    } catch {
      return dateStr;
    }
  };

  const groupedItems = ItineraryService.groupItemsByDate(itinerary.items);
  const totalAmount = ItineraryService.calculateTotalAmount(itinerary.items);

  const handleEdit = () => {
    navigate(`/edit/${id}`);
  };

  const handleExport = () => {
    if (id) {
      exportItinerary(id);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
      <Paper elevation={2} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h4" gutterBottom sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            {itinerary.title}
          </Typography>
          <Chip
            label={`${formatDate(itinerary.startDate)} 〜 ${formatDate(itinerary.endDate)}`}
            color="primary"
            variant="outlined"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.8125rem' } }}
          />
        </Box>

        {Array.from(groupedItems.entries())
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([date, items]) => (
            <Accordion key={date} defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                  {formatDate(date)}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 0, sm: 2 } }}>
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: { xs: 500, sm: 'auto' } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ minWidth: { xs: 80, sm: 'auto' } }}>時間</TableCell>
                        <TableCell sx={{ minWidth: { xs: 150, sm: 'auto' } }}>内容</TableCell>
                        <TableCell align="right" sx={{ minWidth: { xs: 100, sm: 'auto' } }}>金額</TableCell>
                        <TableCell sx={{ minWidth: { xs: 120, sm: 'auto' } }}>備考</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item) => (
                          <TableRow key={item.id}>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {item.time || '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {item.content}
                            </TableCell>
                            <TableCell align="right" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {item.amount ? `¥${item.amount.toLocaleString()}` : '-'}
                            </TableCell>
                            <TableCell sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                              {item.note}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}

        <Box sx={{ mt: { xs: 2, sm: 3 }, p: { xs: 1.5, sm: 2 }, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            合計金額: ¥{totalAmount.toLocaleString()}
          </Typography>
        </Box>

        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          sx={{ mt: { xs: 2, sm: 3 } }} 
          justifyContent="flex-end"
        >
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={handleBack}
            fullWidth={false}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            戻る
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            variant="outlined" 
            onClick={handleExport}
            fullWidth={false}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            エクスポート
          </Button>
          <Button 
            startIcon={<EditIcon />} 
            variant="contained" 
            onClick={handleEdit}
            fullWidth={false}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            編集
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default ItineraryDetailPage;

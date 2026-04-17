import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageSection from '../components/PageSection';
import { useItinerary } from '../contexts/ItineraryContext';
import type { Itinerary } from '../types';

const ITEMS_PER_PAGE = 6;

const formatDate = (value: string) => {
  try {
    return format(new Date(value), 'M月d日(E)', { locale: ja });
  } catch {
    return value;
  }
};

const formatCurrency = (value: number) => `¥${value.toLocaleString()}`;

const calculateBudget = (itinerary: Itinerary) =>
  itinerary.items.reduce((sum, item) => sum + (item.amount || 0), 0);

const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return diff + 1;
};

const ItineraryListPage = () => {
  const navigate = useNavigate();
  const { state, deleteItinerary, importFromMarkdown, downloadTemplate } = useItinerary();
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const mdFileInputRef = useRef<HTMLInputElement>(null);

  const filteredItineraries = useMemo(() => {
    return state.itineraries.filter((itinerary) =>
      itinerary.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, state.itineraries]);

  const totalPages = Math.max(1, Math.ceil(filteredItineraries.length / ITEMS_PER_PAGE));
  const paginatedItineraries = filteredItineraries.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const totalBudget = useMemo(
    () => state.itineraries.reduce((sum, itinerary) => sum + calculateBudget(itinerary), 0),
    [state.itineraries],
  );

  const thisMonthCount = useMemo(() => {
    const now = new Date();
    return state.itineraries.filter((itinerary) => {
      const start = new Date(itinerary.startDate);
      return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth();
    }).length;
  }, [state.itineraries]);

  const handleDelete = async (id: string) => {
    const target = state.itineraries.find((itinerary) => itinerary.id === id);
    if (target && window.confirm(`「${target.title}」を削除しますか？`)) {
      await deleteItinerary(id);
    }
  };

  return (
    <Stack spacing={3}>
      <PageSection
        eyebrow="旅の一覧"
        title="旅程を一覧で確認する"
        description="登録した旅程の日程、件数、予算を確認できます。"
        action={
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ width: { xs: '100%', md: 'auto' } }}>
            <Button
              variant="outlined"
              startIcon={<FileUploadOutlinedIcon />}
              onClick={() => mdFileInputRef.current?.click()}
            >
              Markdownを取り込む
            </Button>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={downloadTemplate}>
              テンプレートを保存
            </Button>
            <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => navigate('/new')}>
              新しい旅を作る
            </Button>
          </Stack>
        }
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ xs: 'stretch', lg: 'center' }}>
          <TextField
            fullWidth
            placeholder="旅の名前で検索"
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon />
                </InputAdornment>
              ),
            }}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} sx={{ minWidth: { lg: 420 } }}>
            {[
              { label: '登録済みの旅', value: `${state.itineraries.length}件` },
              { label: '今月の予定', value: `${thisMonthCount}件` },
              { label: '見込み予算', value: formatCurrency(totalBudget) },
            ].map((stat) => (
              <Box
                key={stat.label}
                sx={{
                  flex: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  px: 2,
                  py: 1.5,
                  backgroundColor: 'rgba(255,255,255,0.42)',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
                <Typography variant="h6" sx={{ mt: 0.5 }}>
                  {stat.value}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Stack>
      </PageSection>

      <input
        ref={mdFileInputRef}
        type="file"
        accept=".md,.markdown"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            await importFromMarkdown(file);
            event.target.value = '';
          }
        }}
        style={{ display: 'none' }}
      />

      {state.itineraries.length === 0 ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            backgroundColor: 'rgba(255,253,248,0.82)',
            px: { xs: 3, md: 6 },
            py: { xs: 6, md: 8 },
            textAlign: 'center',
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: '1.6rem', md: '2rem' } }}>
            まだ旅の予定はありません
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 1.5, maxWidth: 520, mx: 'auto', lineHeight: 1.9 }}>
            旅程を登録すると、日程や予算を一覧で確認できます。
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            startIcon={<AddRoundedIcon />}
            onClick={() => navigate('/new')}
          >
            最初の旅を作る
          </Button>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
              gap: 2.5,
            }}
          >
            {paginatedItineraries.map((itinerary) => {
              const hasCover = Boolean(itinerary.coverImage);
              const totalBudgetForCard = calculateBudget(itinerary);
              const days = calculateDays(itinerary.startDate, itinerary.endDate);

              return (
                <Box
                  key={itinerary.id}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'rgba(255,253,248,0.95)',
                    boxShadow: '0 8px 18px rgba(91, 65, 46, 0.05)',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/detail/${itinerary.id}`)}
                >
                  <Box
                    sx={{
                      minHeight: 188,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      background: hasCover
                        ? `center / cover no-repeat url(${itinerary.coverImage})`
                        : 'linear-gradient(180deg, rgba(236,229,216,0.95), rgba(245,240,230,0.98))',
                      px: 2.5,
                      py: 2,
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                      <Chip
                        label="旅程"
                        size="small"
                        variant="outlined"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.78)' }}
                      />
                      <Stack direction="row" spacing={0.5} onClick={(event) => event.stopPropagation()}>
                        <IconButton size="small" onClick={() => navigate(`/edit/${itinerary.id}`)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(itinerary.id)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        mt: 7,
                        minWidth: 0,
                        width: 'fit-content',
                        maxWidth: '100%',
                        px: hasCover ? 1.5 : 0,
                        py: hasCover ? 1 : 0,
                        borderRadius: hasCover ? 2 : 0,
                        backgroundColor: hasCover ? 'rgba(28, 23, 18, 0.54)' : 'transparent',
                        backdropFilter: hasCover ? 'blur(6px)' : 'none',
                      }}
                    >
                      <Typography
                        variant="h5"
                        sx={{ lineHeight: 1.35, color: hasCover ? 'common.white' : 'text.primary' }}
                      >
                        {itinerary.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: hasCover ? 'rgba(255,255,255,0.88)' : 'text.secondary' }}
                      >
                        {formatDate(itinerary.startDate)} - {formatDate(itinerary.endDate)}
                      </Typography>
                    </Box>
                  </Box>

                  <Stack spacing={2} sx={{ p: 2.5, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip label={`${days}日間`} variant="outlined" />
                      <Chip label={`予定 ${itinerary.items.length}件`} variant="outlined" />
                      <Chip label={`予算 ${formatCurrency(totalBudgetForCard)}`} variant="outlined" />
                    </Stack>

                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                        gap: 1,
                        pt: 1.5,
                        borderTop: '1px dashed',
                        borderColor: 'divider',
                      }}
                    >
                      {[
                        { label: '出発', value: formatDate(itinerary.startDate) },
                        { label: '帰着', value: formatDate(itinerary.endDate) },
                        { label: '更新', value: formatDate(itinerary.updatedAt) },
                      ].map((info) => (
                        <Box key={info.label} sx={{ minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary">
                            {info.label}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {info.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {filteredItineraries.length}件の旅を表示しています
            </Typography>
            <Pagination count={totalPages} page={page} onChange={(_, value) => setPage(value)} />
          </Stack>

          <PageSection
            eyebrow="補助機能"
            title="ファイル操作"
            description="Markdownの取り込みとテンプレート保存ができます。"
          >
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'rgba(255,255,255,0.42)',
                }}
              >
                <EventNoteRoundedIcon color="secondary" />
                <Typography variant="h6" sx={{ mt: 1.5 }}>
                  Markdownから取り込む
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                  Markdownファイルから旅程を取り込めます。
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" onClick={() => mdFileInputRef.current?.click()}>
                  ファイルを選ぶ
                </Button>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2.5,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'rgba(255,255,255,0.42)',
                }}
              >
                <DownloadRoundedIcon color="secondary" />
                <Typography variant="h6" sx={{ mt: 1.5 }}>
                  テンプレートから始める
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.8 }}>
                  入力用のテンプレートを保存できます。
                </Typography>
                <Button sx={{ mt: 2 }} variant="outlined" onClick={downloadTemplate}>
                  テンプレートを保存
                </Button>
              </Box>
            </Stack>
          </PageSection>
        </>
      )}
    </Stack>
  );
};

export default ItineraryListPage;

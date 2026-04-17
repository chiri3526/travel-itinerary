import GoogleIcon from '@mui/icons-material/Google';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('ログインできませんでした。メールアドレスとパスワードをご確認ください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      setError('Googleでのログインに失敗しました。時間をおいてお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 0.92fr' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Card sx={{ minHeight: { lg: 560 } }}>
          <CardContent sx={{ p: { xs: 3, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary">
              保存した旅程を開いて編集できます。
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, mt: 1.5 }}>
              保存した旅程を
              <br />
              開きます。
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 520, lineHeight: 1.9 }}>
              旅程、予算、画像を前回の状態のまま確認できます。
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 'auto', pt: 5 }}>
              {[
                '予定を時系列で確認できます。',
                'Markdownの取り込みとテンプレート保存に対応しています。',
                'スマートフォンでも確認できます。',
              ].map((point) => (
                <Box
                  key={point}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    px: 2,
                    py: 1.5,
                    backgroundColor: 'rgba(255,255,255,0.45)',
                  }}
                >
                  <Typography variant="body2">{point}</Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ alignSelf: 'center' }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4">ログイン</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              保存していた旅の内容を開きます。
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2.5 }}>{error}</Alert>}

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="メールアドレス"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="パスワード"
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                ログインする
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }}>または</Divider>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              Googleでログイン
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              はじめての方は{' '}
              <Link component={RouterLink} to="/signup" underline="hover">
                新規登録
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;

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

type FirebaseLikeError = {
  code?: string;
};

const SignupPage = () => {
  const navigate = useNavigate();
  const { signup, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('確認用パスワードが一致していません。');
      return;
    }
    if (password.length < 6) {
      setError('パスワードは6文字以上で入力してください。');
      return;
    }

    setLoading(true);

    try {
      await signup(email, password);
      navigate('/');
    } catch (error) {
      const firebaseError = error as FirebaseLikeError;
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('このメールアドレスはすでに使用されています。');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('メールアドレスの形式をご確認ください。');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('パスワードが短すぎます。6文字以上で入力してください。');
      } else {
        setError('登録できませんでした。時間をおいてお試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
      navigate('/');
    } catch {
      setError('Googleでの登録に失敗しました。時間をおいてお試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container sx={{ py: { xs: 3, md: 6 } }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '0.92fr 1fr' },
          gap: 3,
          alignItems: 'stretch',
        }}
      >
        <Card sx={{ alignSelf: 'center', order: { xs: 2, lg: 1 } }}>
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h4">新規登録</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              旅の予定を保存できるように設定します。
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
                helperText="6文字以上で入力してください"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <TextField
                label="パスワード（確認）"
                type="password"
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                登録する
              </Button>
            </Stack>

            <Divider sx={{ my: 3 }}>または</Divider>

            <Button
              variant="outlined"
              size="large"
              fullWidth
              startIcon={<GoogleIcon />}
              onClick={handleGoogleSignup}
              disabled={loading}
            >
              Googleで登録
            </Button>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              すでに登録済みの方は{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                ログイン
              </Link>
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ minHeight: { lg: 560 }, order: { xs: 1, lg: 2 } }}>
          <CardContent sx={{ p: { xs: 3, md: 5 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="body2" color="text.secondary">
              旅程を保存するためのアカウントを作成します。
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.95rem', md: '2.8rem' }, mt: 1.5 }}>
              旅程データを
              <br />
              保存する準備。
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, maxWidth: 520, lineHeight: 1.9 }}>
              日程、予定、予算などの情報を旅ごとに保存できます。
            </Typography>

            <Stack spacing={1.5} sx={{ mt: 'auto', pt: 5 }}>
              {[
                '旅ごとの情報を一覧で確認できます。',
                '予定の追加と並べ替えができます。',
                '必要な項目を入力して保存できます。',
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
      </Box>
    </Container>
  );
};

export default SignupPage;

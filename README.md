# Travel Itinerary App

旅行行程表を管理するWebアプリケーションです。Firebase認証とFirestoreを使用して、ユーザーごとにデータを管理します。

## 機能

- ユーザー認証（メール/パスワード、Google認証）
- 旅行行程表の作成・編集・削除
- 行程詳細の管理（日付、時間、内容、金額、備考）
- データのインポート/エクスポート
- レスポンシブデザイン

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Firebaseプロジェクトの作成

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. Webアプリを追加
4. Firebase SDKの設定情報を取得

### 3. Firestoreの設定

1. Firebase Consoleで「Firestore Database」を選択
2. 「データベースを作成」をクリック
3. テストモードで開始（後で本番モードに変更可能）
4. ロケーションを選択（asia-northeast1推奨）

### 4. 認証の設定

1. Firebase Consoleで「Authentication」を選択
2. 「Sign-in method」タブを開く
3. 「メール/パスワード」を有効化
4. 「Google」を有効化（オプション）

### 5. Firestoreセキュリティルールの設定

Firebase Consoleの「Firestore Database」→「ルール」タブで以下のルールを設定：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /itineraries/{itineraryId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 6. 環境変数の設定

`.env.example`をコピーして`.env`ファイルを作成し、Firebaseの設定情報を入力：

```bash
cp .env.example .env
```

`.env`ファイルを編集：

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 7. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開きます。

## ビルド

```bash
npm run build
```

ビルドされたファイルは`dist`ディレクトリに出力されます。

## デプロイ

### Firebase Hostingへのデプロイ

1. Firebase CLIをインストール：

```bash
npm install -g firebase-tools
```

2. Firebaseにログイン：

```bash
firebase login
```

3. Firebaseプロジェクトを初期化：

```bash
firebase init hosting
```

4. デプロイ：

```bash
npm run build
firebase deploy
```

## 技術スタック

- React 18
- TypeScript
- Material-UI (MUI)
- Firebase Authentication
- Cloud Firestore
- Vite
- React Router

## ライセンス

MIT

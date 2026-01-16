# 設計書

## 概要

旅行行程表WEBアプリケーションは、Reactを使用したシングルページアプリケーション（SPA）として実装します。Material UIをUIフレームワークとして採用し、モダンで使いやすいインターフェースを提供します。データはブラウザのローカルストレージに保存され、完全にオフラインで動作します。

## アーキテクチャ

### システム構成

```
┌─────────────────────────────────────┐
│         ブラウザ環境                 │
│  ┌───────────────────────────────┐  │
│  │   Presentation Layer          │  │
│  │   (React Components + MUI)    │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │   State Management Layer      │  │
│  │   (React Context/Hooks)       │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │   Service Layer               │  │
│  │  - StorageService             │  │
│  │  - ItineraryService           │  │
│  │  - FileService                │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │   LocalStorage (Data Layer)   │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

### 技術スタック

- **フロントエンド**: React 18+
- **UIフレームワーク**: Material UI (MUI) v5
- **ルーティング**: React Router v6
- **状態管理**: React Context API + useReducer
- **データ保存**: LocalStorage API
- **ファイル操作**: File API, Blob API
- **日付処理**: date-fns
- **ビルドツール**: Vite
- **言語**: TypeScript

## コンポーネントとインターフェース

### 1. データモデル（TypeScript型定義）

#### Itinerary（行程表）

```typescript
interface Itinerary {
  id: string;              // UUID
  title: string;           // 旅行名
  startDate: string;       // 開始日 (ISO 8601形式)
  endDate: string;         // 終了日 (ISO 8601形式)
  items: ItineraryItem[];  // 行程アイテムの配列
  createdAt: string;       // 作成日時
  updatedAt: string;       // 更新日時
}
```

#### ItineraryItem（行程アイテム）

```typescript
interface ItineraryItem {
  id: string;        // UUID
  date: string;      // 日付 (ISO 8601形式)
  time: string;      // 時間 (HH:mm形式)
  content: string;   // 内容
  amount: number;    // 金額
  note: string;      // 備考
}
```

### 2. Reactコンポーネント構成

#### コンポーネントツリー

```
App
├── AppLayout (MUI Container + AppBar)
│   ├── Header (AppBar + Toolbar)
│   └── Router
│       ├── ItineraryListPage
│       │   ├── ItineraryCard (複数)
│       │   └── Fab (新規作成ボタン)
│       ├── ItineraryFormPage
│       │   ├── BasicInfoForm
│       │   │   ├── TextField (旅行名)
│       │   │   ├── DatePicker (開始日)
│       │   │   └── DatePicker (終了日)
│       │   └── ItemsForm
│       │       ├── ItemRow (複数)
│       │       └── Button (行追加)
│       ├── ItineraryDetailPage
│       │   ├── DetailHeader
│       │   ├── ItemsTable
│       │   └── ActionButtons
│       └── NotFoundPage
└── ItineraryProvider (Context)
```

#### 主要コンポーネント

**App.tsx**
- アプリケーションのルートコンポーネント
- MUIのThemeProviderでテーマを提供
- ItineraryProviderで状態管理を提供

**AppLayout.tsx**
- 共通レイアウト（ヘッダー、ナビゲーション）
- MUI Container, AppBar, Toolbarを使用

**ItineraryListPage.tsx**
- 保存された行程表の一覧を表示
- MUI Grid, Cardを使用
- 各カードに編集、削除、エクスポートボタン

**ItineraryFormPage.tsx**
- 新規作成・編集フォーム
- MUI TextField, DatePicker, Button, IconButtonを使用
- 動的に行を追加・削除

**ItineraryDetailPage.tsx**
- 行程表の詳細表示
- MUI Table, TableContainer, Paperを使用
- 日付ごとにグループ化して表示

**ItineraryCard.tsx**
- 行程表のカード表示
- MUI Card, CardContent, CardActionsを使用

**ItemRow.tsx**
- 行程アイテムの入力行
- MUI TextField, IconButtonを使用

### 3. 状態管理（React Context）

**ItineraryContext**

```typescript
interface ItineraryContextType {
  itineraries: Itinerary[];
  loading: boolean;
  error: string | null;
  addItinerary: (itinerary: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItinerary: (id: string, itinerary: Partial<Itinerary>) => void;
  deleteItinerary: (id: string) => void;
  getItinerary: (id: string) => Itinerary | undefined;
  exportItinerary: (id: string) => void;
  importItinerary: (file: File) => Promise<void>;
}
```

**useItinerary Hook**
- Context APIを使用した状態管理
- useReducerでアクションを管理
- LocalStorageとの同期

### 4. サービス層

**StorageService.ts**

```typescript
class StorageService {
  private readonly STORAGE_KEY = 'travel_itineraries';
  
  getAllItineraries(): Itinerary[];
  getItinerary(id: string): Itinerary | null;
  saveItinerary(itinerary: Itinerary): void;
  deleteItinerary(id: string): void;
  clearAll(): void;
}
```

**ItineraryService.ts**

```typescript
class ItineraryService {
  createItinerary(data: Omit<Itinerary, 'id' | 'createdAt' | 'updatedAt'>): Itinerary;
  validateDates(startDate: string, endDate: string): boolean;
  calculateTotalAmount(items: ItineraryItem[]): number;
  groupItemsByDate(items: ItineraryItem[]): Map<string, ItineraryItem[]>;
}
```

**FileService.ts**

```typescript
class FileService {
  exportToJSON(itinerary: Itinerary): void;
  importFromJSON(file: File): Promise<Itinerary>;
  validateImportData(data: any): boolean;
}
```

## 画面設計（Material UI）

### 1. 入力画面（ItineraryFormPage）

**MUIコンポーネント:**
- Container (maxWidth="md")
- Paper (elevation={3})
- Typography (variant="h4") - ページタイトル
- Box - セクション区切り
- TextField - 旅行名入力
- DatePicker (MUI X Date Pickers) - 開始日・終了日
- Divider - セクション区切り線
- Table + TableBody - 行程アイテム入力
- IconButton (DeleteIcon) - 行削除
- Button (startIcon={<AddIcon />}) - 行追加
- Stack (direction="row", spacing={2}) - ボタン配置
- Button (variant="contained") - 保存
- Button (variant="outlined") - キャンセル

**レイアウト構成:**
```
Container
└── Paper
    ├── Typography (タイトル)
    ├── Box (基本情報)
    │   ├── TextField (旅行名)
    │   ├── DatePicker (開始日)
    │   └── DatePicker (終了日)
    ├── Divider
    ├── Box (行程アイテム)
    │   ├── Table
    │   │   └── TableBody
    │   │       └── ItemRow (複数)
    │   └── Button (行追加)
    └── Stack (アクションボタン)
        ├── Button (保存)
        └── Button (キャンセル)
```

### 2. 閲覧画面（ItineraryListPage）

**MUIコンポーネント:**
- Container (maxWidth="lg")
- Typography (variant="h4") - ページタイトル
- Grid (container, spacing={3}) - カードレイアウト
- Card - 各行程表
- CardContent - カード内容
- CardActions - アクションボタン
- Chip - 日付表示
- IconButton - 編集、削除、エクスポート
- Fab (position="fixed") - 新規作成ボタン
- Dialog - 削除確認ダイアログ
- Snackbar + Alert - 成功・エラーメッセージ

**レイアウト構成:**
```
Container
├── Typography (タイトル)
├── Grid (container)
│   └── Grid (item) × N
│       └── Card
│           ├── CardContent
│           │   ├── Typography (旅行名)
│           │   ├── Chip (期間)
│           │   └── Typography (作成日)
│           └── CardActions
│               ├── IconButton (詳細)
│               ├── IconButton (編集)
│               ├── IconButton (削除)
│               └── IconButton (エクスポート)
└── Fab (新規作成)
```

### 3. 詳細表示画面（ItineraryDetailPage）

**MUIコンポーネント:**
- Container (maxWidth="lg")
- Paper (elevation={2})
- Box - ヘッダー部分
- Typography (variant="h4") - 旅行名
- Chip - 期間表示
- TableContainer + Paper - 行程テーブル
- Table (stickyHeader)
- TableHead + TableBody
- TableRow + TableCell
- Accordion - 日付ごとのグループ化
- AccordionSummary + AccordionDetails
- Typography (variant="h6") - 合計金額
- Stack - アクションボタン
- Button (startIcon={<EditIcon />}) - 編集
- Button (startIcon={<DownloadIcon />}) - エクスポート
- Button (startIcon={<ArrowBackIcon />}) - 戻る

**レイアウト構成:**
```
Container
└── Paper
    ├── Box (ヘッダー)
    │   ├── Typography (旅行名)
    │   └── Chip (期間)
    ├── Accordion × N (日付ごと)
    │   ├── AccordionSummary (日付)
    │   └── AccordionDetails
    │       └── TableContainer
    │           └── Table
    │               ├── TableHead
    │               └── TableBody
    ├── Box (合計)
    │   └── Typography (合計金額)
    └── Stack (アクションボタン)
        ├── Button (編集)
        ├── Button (エクスポート)
        └── Button (戻る)
```

### 4. 共通コンポーネント

**Header (AppBar)**
- AppBar (position="sticky")
- Toolbar
- Typography (variant="h6") - アプリ名
- IconButton - メニュー（将来の拡張用）

**LoadingSpinner**
- Backdrop
- CircularProgress

**ConfirmDialog**
- Dialog
- DialogTitle
- DialogContent
- DialogActions

## データフロー

### 新規作成フロー

```
ユーザー入力（ItineraryFormPage）
  ↓
フォーム送信イベント
  ↓
Context: addItinerary()
  ↓
ItineraryService.createItinerary()
  ↓
StorageService.saveItinerary()
  ↓
LocalStorage
  ↓
Context: state更新（useReducer）
  ↓
Snackbar表示（成功メッセージ）
  ↓
React Router: navigate('/') で閲覧画面へ遷移
```

### 閲覧フロー

```
ItineraryListPage マウント
  ↓
useEffect: Context.itinerariesを取得
  ↓
StorageService.getAllItineraries()
  ↓
LocalStorage
  ↓
Context: state更新
  ↓
コンポーネント再レンダリング
  ↓
Grid + Card で表示
```

### 編集フロー

```
編集ボタンクリック（ItineraryCard）
  ↓
React Router: navigate(`/edit/${id}`)
  ↓
ItineraryFormPage マウント（編集モード）
  ↓
useEffect: Context.getItinerary(id)
  ↓
useState: フォームに既存データをセット
  ↓
ユーザー編集
  ↓
フォーム送信
  ↓
Context: updateItinerary(id, data)
  ↓
StorageService.saveItinerary()
  ↓
LocalStorage
  ↓
Context: state更新
  ↓
React Router: navigate('/') で閲覧画面へ遷移
```

### エクスポート/インポートフロー

**エクスポート:**
```
エクスポートボタンクリック
  ↓
Context: exportItinerary(id)
  ↓
FileService.exportToJSON()
  ↓
Blob作成
  ↓
document.createElement('a') + click()
  ↓
ファイルダウンロード
  ↓
Snackbar表示（成功メッセージ）
```

**インポート:**
```
ファイル選択（input type="file"）
  ↓
onChange イベント
  ↓
Context: importItinerary(file)
  ↓
FileService.importFromJSON(file)
  ↓
FileReader.readAsText()
  ↓
JSON.parse() + バリデーション
  ↓
StorageService.saveItinerary()
  ↓
LocalStorage
  ↓
Context: state更新
  ↓
コンポーネント再レンダリング
  ↓
Snackbar表示（成功メッセージ）
```

### 削除フロー

```
削除ボタンクリック
  ↓
ConfirmDialog表示
  ↓
確認ボタンクリック
  ↓
Context: deleteItinerary(id)
  ↓
StorageService.deleteItinerary(id)
  ↓
LocalStorage
  ↓
Context: state更新
  ↓
コンポーネント再レンダリング
  ↓
Snackbar表示（成功メッセージ）
```

## エラーハンドリング

### LocalStorageエラー

- **容量超過**: ユーザーに警告を表示し、古いデータの削除を提案
- **アクセス拒否**: プライベートモードの可能性を通知
- **データ破損**: バックアップからの復元を提案

### 入力検証エラー

- **必須フィールド**: 赤枠表示とエラーメッセージ
- **日付の妥当性**: 終了日が開始日より前の場合はエラー
- **金額の形式**: 数値以外の入力を拒否

### ファイル操作エラー

- **インポート失敗**: JSON形式が不正な場合はエラーメッセージ
- **エクスポート失敗**: ブラウザの制限を通知

## テスト戦略

### 単体テスト（Vitest + React Testing Library）

**サービス層:**
- **StorageService**: LocalStorageのモックを使用したCRUD操作のテスト
- **ItineraryService**: ビジネスロジック（日付検証、合計計算）のテスト
- **FileService**: エクスポート/インポート機能のテスト

**コンポーネント:**
- **ItineraryCard**: プロパティの表示、ボタンクリックのテスト
- **ItemRow**: 入力フィールド、削除ボタンのテスト
- **ItineraryFormPage**: フォーム送信、バリデーションのテスト

**カスタムフック:**
- **useItinerary**: Context APIの動作テスト

### 統合テスト

- **データフロー**: 入力から保存、閲覧までの一連の流れ
- **ルーティング**: ページ遷移の確認
- **エクスポート/インポート**: データの整合性確認
- **Context + LocalStorage**: 状態管理とデータ永続化の連携

### E2Eテスト（Playwright - オプション）

- **ユーザーシナリオ**: 新規作成→保存→閲覧→編集→削除
- **エクスポート/インポート**: ファイルダウンロード・アップロードの動作確認
- **エラーハンドリング**: 不正なデータ入力時の挙動

### ブラウザテスト

- **対応ブラウザ**: Chrome, Firefox, Safari, Edge（最新版）
- **LocalStorage**: 各ブラウザでの動作確認
- **オフライン**: ネットワークを切断した状態での動作確認

### レスポンシブテスト

- **ブレークポイント**: xs, sm, md, lg, xl（MUIのブレークポイント）
- **デバイス**: モバイル（375px）、タブレット（768px）、デスクトップ（1280px）
- **MUI Grid**: レイアウトの崩れがないか確認

## セキュリティ考慮事項

- **XSS対策**: ユーザー入力をエスケープ処理
- **データ検証**: インポート時のJSON構造検証
- **LocalStorage**: 機密情報は保存しない（ブラウザのストレージは暗号化されていない）

## パフォーマンス最適化

### React最適化
- **React.memo**: 不要な再レンダリングを防ぐ（ItineraryCard, ItemRowなど）
- **useMemo**: 高コストな計算結果をキャッシュ（合計金額、日付グループ化）
- **useCallback**: 関数の再生成を防ぐ（イベントハンドラー）
- **React.lazy + Suspense**: ルートベースのコード分割

### データ最適化
- **仮想化**: 大量の行程表がある場合はreact-windowを使用
- **ページネーション**: MUI Paginationコンポーネントで実装
- **デバウンス**: 検索・フィルター機能での入力処理

### ビルド最適化
- **Vite**: 高速なビルドと開発サーバー
- **Tree Shaking**: 未使用コードの削除
- **コード分割**: React Routerのルートごとに分割
- **最小化**: Terserによる本番ビルドの最小化

## 将来の拡張性

### 機能拡張
- **PWA対応**: Service Workerを追加してオフライン機能を強化
- **同期機能**: Firebase/Supabaseとの同期オプション
- **印刷機能**: react-to-printで行程表のPDF出力
- **多言語対応**: react-i18nextライブラリの導入
- **テーマ**: MUIのダークモード対応（useMediaQuery + createTheme）
- **共有機能**: URLでの行程表共有
- **地図統合**: Google Maps APIで場所の表示

### UI/UX改善
- **ドラッグ&ドロップ**: react-beautiful-dndで行程の並び替え
- **検索・フィルター**: 旅行名、日付での絞り込み
- **ソート**: 作成日、旅行日でのソート
- **統計表示**: 総費用、日数などのダッシュボード
- **テンプレート**: よく使う行程のテンプレート保存

### 技術的改善
- **状態管理**: 複雑化した場合はZustand/Jotaiへの移行
- **フォーム管理**: React Hook Formでバリデーション強化
- **API統合**: バックエンドAPIとの連携準備
- **認証**: Firebase Authenticationでユーザー管理

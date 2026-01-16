# 実装タスクリスト

- [x] 1. プロジェクトのセットアップと基本構成



  - Viteを使用してReact + TypeScriptプロジェクトを初期化
  - Material UI、React Router、date-fnsなどの依存関係をインストール
  - プロジェクトのディレクトリ構造を作成（src/components, src/services, src/contexts, src/pages, src/types）
  - _要件: 7.1, 7.2_

- [x] 2. TypeScript型定義とデータモデルの作成


  - src/types/index.tsにItinerary型とItineraryItem型を定義
  - 型定義にはid、title、startDate、endDate、items、createdAt、updatedAtを含める
  - _要件: 1.3, 2.2, 3.5_

- [x] 3. StorageServiceの実装


  - src/services/StorageService.tsを作成
  - getAllItineraries、getItinerary、saveItinerary、deleteItineraryメソッドを実装
  - LocalStorageへのデータ保存・読み込み処理を実装
  - エラーハンドリング（容量超過、アクセス拒否）を実装
  - _要件: 3.1, 3.2, 3.4, 4.2_

- [x] 4. ItineraryServiceの実装


  - src/services/ItineraryService.tsを作成
  - createItineraryメソッドを実装（UUID生成、タイムスタンプ追加）
  - validateDatesメソッドを実装（開始日と終了日の妥当性検証）
  - calculateTotalAmountメソッドを実装（行程アイテムの合計金額計算）
  - groupItemsByDateメソッドを実装（日付ごとのグループ化）
  - _要件: 1.4, 2.1_

- [x] 5. FileServiceの実装


  - src/services/FileService.tsを作成
  - exportToJSONメソッドを実装（Blob作成、ファイルダウンロード）
  - importFromJSONメソッドを実装（FileReader、JSON解析）
  - validateImportDataメソッドを実装（インポートデータの検証）
  - ファイル名に旅行名と日付を含める処理を実装
  - _要件: 6.1, 6.2, 6.3, 6.4_

- [x] 6. ItineraryContextとProviderの実装


  - src/contexts/ItineraryContext.tsxを作成
  - React ContextとuseReducerを使用した状態管理を実装
  - addItinerary、updateItinerary、deleteItinerary、getItinerary、exportItinerary、importItineraryアクションを実装
  - loading、errorステートを管理
  - useItineraryカスタムフックを実装
  - _要件: 3.2, 3.5, 5.3_

- [x] 7. AppLayoutとHeaderコンポーネントの実装



  - src/components/AppLayout.tsxを作成
  - MUI AppBar、Toolbar、Containerを使用したレイアウトを実装
  - アプリタイトルとナビゲーションを表示
  - _要件: 1.1_

- [x] 8. ルーティングの設定


  - src/App.tsxにReact Routerを設定
  - ルート定義: / (一覧), /new (新規作成), /edit/:id (編集), /detail/:id (詳細)
  - MUI ThemeProviderとItineraryProviderでアプリをラップ
  - _要件: 1.1, 4.1, 5.1_

- [x] 9. ItemRowコンポーネントの実装








  - src/components/ItemRow.tsxを作成
  - MUI TextField（日付、時間、内容、金額、備考）を配置
  - MUI IconButton（削除ボタン）を実装
  - 各フィールドのonChange処理を実装
  - _要件: 2.2, 2.5_

- [x] 10. ItineraryFormPageの実装


  - src/pages/ItineraryFormPage.tsxを作成
  - MUI Container、Paper、Typography、TextField、DatePickerを使用
  - 旅行名、開始日、終了日の入力フォームを実装
  - 行程アイテムの動的追加・削除機能を実装（ItemRowコンポーネントを使用）
  - 「行を追加」ボタンを実装
  - フォーム送信処理（新規作成・編集の判定）を実装
  - 日付の妥当性検証を実装
  - 保存ボタンとキャンセルボタンを実装
  - _要件: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 3.2_

- [x] 11. ItineraryCardコンポーネントの実装


  - src/components/ItineraryCard.tsxを作成
  - MUI Card、CardContent、CardActions、Chip、IconButtonを使用
  - 旅行名、期間、作成日を表示
  - 詳細表示、編集、削除、エクスポートボタンを実装
  - 各ボタンのクリックイベントハンドラーを実装
  - _要件: 4.3, 4.4, 5.1, 6.2_

- [x] 12. ItineraryListPageの実装


  - src/pages/ItineraryListPage.tsxを作成
  - MUI Container、Typography、Grid、Fabを使用
  - ItineraryContextから行程表リストを取得
  - ItineraryCardコンポーネントを使用してカード形式で表示
  - 新規作成ボタン（Fab）を実装
  - 行程が存在しない場合のメッセージ表示を実装
  - _要件: 4.1, 4.2, 4.3, 4.5_

- [x] 13. ItineraryDetailPageの実装


  - src/pages/ItineraryDetailPage.tsxを作成
  - MUI Container、Paper、Typography、Chip、Accordion、Table、TableContainer、Buttonを使用
  - URLパラメータから行程IDを取得
  - 行程の詳細情報を表示（旅行名、期間）
  - 日付ごとにAccordionでグループ化して行程アイテムを表示
  - 合計金額を計算して表示
  - 編集、エクスポート、戻るボタンを実装
  - _要件: 4.4, 5.1, 6.2_

- [ ] 14. 削除確認ダイアログの実装
  - src/components/ConfirmDialog.tsxを作成
  - MUI Dialog、DialogTitle、DialogContent、DialogActionsを使用
  - 削除確認メッセージを表示
  - キャンセルと確認ボタンを実装
  - ItineraryCardコンポーネントに統合
  - _要件: 4.3_

- [x] 15. 通知機能の実装







  - src/components/Notification.tsxを作成
  - MUI Snackbar、Alertを使用
  - 成功メッセージ（保存、削除、エクスポート、インポート）を表示
  - エラーメッセージ（保存失敗、インポート失敗）を表示
  - ItineraryContextに通知ステートを追加
  - _要件: 3.3, 3.4_

- [x] 16. インポート機能の実装













  - ItineraryListPageにファイルアップロードボタンを追加
  - MUI Button、input type="file"を使用
  - FileServiceのimportFromJSONメソッドを呼び出し
  - インポート成功時に行程リストを更新
  - インポート失敗時にエラーメッセージを表示
  - _要件: 6.4_

- [x] 17. レスポンシブデザインの調整









  - MUI Gridのブレークポイント（xs, sm, md, lg）を設定
  - モバイル、タブレット、デスクトップでのレイアウト確認
  - フォームの入力フィールドをレスポンシブに調整
  - _要件: 1.1, 4.1_

- [x] 18. エラーハンドリングの強化









  - LocalStorageのエラー（容量超過、アクセス拒否）のハンドリング
  - フォーム入力の検証エラー表示（必須フィールド、日付の妥当性、金額の形式）
  - ファイルインポートのエラーハンドリング（JSON形式不正）
  - エラーメッセージをユーザーフレンドリーに表示
  - _要件: 1.4, 3.4_

- [ ]* 19. パフォーマンス最適化
  - React.memoをItineraryCard、ItemRowに適用
  - useMemoで合計金額計算、日付グループ化をメモ化
  - useCallbackでイベントハンドラーをメモ化
  - _要件: 4.3, 4.4_

- [ ]* 20. アプリケーションの統合とテスト
  - 全ての画面遷移が正しく動作することを確認
  - 新規作成→保存→閲覧→編集→削除の一連のフローをテスト
  - エクスポート→インポートの動作確認
  - オフライン環境での動作確認
  - 各ブラウザ（Chrome、Firefox、Safari、Edge）での動作確認
  - _要件: 7.1, 7.2, 7.3, 7.4_

# WebXR Sandbox 実機検証ログ

このファイルは Quest Browser 実機での検証結果を記録するためのテンプレートです。
1回の検証につき1セクションを追記してください。未実施の項目は「未実施」と明記し、推測で埋めないでください。

## テンプレート

```
### 検証日: 
- Quest機種: 
- Meta OS version: 
- Quest Browser version: 
- Three.js version: 
- 配信URL / HTTPS有無: 
- Vercel URL: 
- Production / Preview: 
- Deployment Protection: なし / あり / 不明

### 対象STEP: 
- 期待結果: 
- 実際の結果: 

### HUD表示方式: 
- world-fixed / camera-forward / camera-add / xr-camera-add のいずれか
- HUD parent 表示値: 

### inputSources結果: 
- 

### buttons / axes結果: 
- 

### 採用判断: 
- 

### ArchView360へ戻すかどうか: 
- 
```

## 検証記録

### 検証日: 2026-07-07
- Quest機種: 未実施（実機未確認）
- Meta OS version: 未実施（実機未確認）
- Quest Browser version: 未実施（実機未確認）
- Three.js version: `three@0.169.0`（`npm ls three` で確認、vite@5.4.21）
- 配信URL / HTTPS有無: 未実施。ローカル環境で `npm run dev -- --host 0.0.0.0` によるHTTP配信の起動とHTTP応答(200)のみ確認。HTTPS配信およびQuest実機からのアクセスは未実施。

### 対象STEP: STEP1 / STEP2
- 期待結果: Quest Browserでimmersive-vr開始後、赤いCubeとDebug Panel(HUD)が表示される
- 実際の結果: 未実施。本セッションはAIエージェントによる自動作業環境で実行されており、物理的なQuestヘッドセットにアクセスできないため、実機での目視確認・Controller接続確認は行っていない。確認できたのは以下のみ：
  - `npm install` 成功
  - `npm run build` 成功（`vite build` がエラーなく完了）
  - `npm run dev -- --host 0.0.0.0` でdev server起動、`http://localhost:<port>/` へのHTTPリクエストでHTTP 200を確認
  - コード上、`renderer.xr.getSession()` / `session.inputSources` の安全な参照、HUDモード4種の切り替えロジック、Debug Panelへの追加表示項目（session/error/HUD parent/カメラ姿勢）が構文・ロジックエラーなく動作すること（ブラウザのWebXR APIが存在しない環境でのフォールバック含む）

### HUD表示方式: world-fixed / camera-forward / camera-add / xr-camera-add
- 4方式とも実機での見え方（見える/見えない/追従する/位置がおかしい/片目だけ見える）は未実施。`?hud=` パラメータでの切り替え自体はコードレベルで実装済み。

### inputSources結果: 
- 未実施（Controller未接続・実機未確認のため）

### buttons / axes結果: 
- 未実施（Controller未接続・実機未確認のため）

### 採用判断: 
- 保留。実機検証（人間によるQuest実機でのテスト）が必要。本エントリは自動環境での事前チェック(build/dev起動)のみを記録するものであり、STEP1/STEP2の採用可否を判断する材料にはならない。

### ArchView360へ戻すかどうか: 
- 未定。実機での視認性・Controller入力確認が完了するまで判断不可。

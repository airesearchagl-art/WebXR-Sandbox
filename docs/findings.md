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

---

### 検証日: 2026-07-07（人間によるQuest実機検証）
- Quest機種: 未記録（今回の報告にQuest機種の記載なし。推測で埋めない）
- Meta OS version: 未記録（今回の報告に記載なし）
- Quest Browser version: 未記録（今回の報告に記載なし）
- Three.js version: `three@0.169.0`（コード変更なし、前回検証と同一）
- 配信URL / HTTPS有無: 未記録（今回の報告にURL/HTTPS有無の詳細記載なし）
- Vercel URL: 未記録
- Production / Preview: 未記録
- Deployment Protection: 不明

### 対象STEP: STEP1〜STEP4相当（VR開始・赤Cube表示・Debug Panel表示・HUD4方式表示・Controller inputSources取得）
- 期待結果: Quest Browserでimmersive-vr開始後、赤Cube・Debug Panelが表示され、HUD4方式すべてが表示可能であり、`session.inputSources` から左右Controllerの情報（gamepad, profiles等）が取得できる
- 実際の結果（実機確認済み）:
  - WebXR VR開始 成功
  - 赤Cube表示 成功
  - Debug Panel表示 成功
  - HUD 4方式すべて表示成功
  - `session.inputSources` で左右Controller取得成功（`inputSources: 2`）
  - `XRInputSource.gamepad` 取得成功（`gp: yes`）
  - `profiles: meta-quest-touch-plus` 取得成功
  - `ray: tracked-pointer`
  - `last error: none`

### HUD表示方式: world-fixed / camera-forward / camera-add / xr-camera-add
- `world-fixed`: 表示成功 / HUD parent: `scene`
- `camera-forward`: 表示成功 / HUD parent: `camera(main)`
- `camera-add`: 表示成功。HUD parentは再確認対象（未確定）
- `xr-camera-add`: 表示成功。ただし `HUD parent: camera(main)` となっており、意図していたXRサブカメラ（`renderer.xr.getCamera().cameras[0]`）へのattachができていない。`sessionstart`後の再attach処理を実装済みだが、実機でも`camera(main)`フォールバックのままであることを確認。

### inputSources結果: 
- `inputSources: 2`（left / right 両方取得）
- 両Controllerとも `ray: tracked-pointer` / `gp: yes` / `profiles: meta-quest-touch-plus`

### buttons / axes結果: 
- 未実施。本PR（`test: add Quest controller button diagnostics`）でDebug Panelに button/axes 詳細表示（pressed/touched/value>0.05一覧、axes主要値、直近押下button）を追加した。次回の実機検証で実測値を記録予定。

### 採用判断: 
- HUD表示方式は `camera-forward` を推奨方式として採用する（実機でHUD parentが`camera(main)`として意図通り追従することを確認済み）。
- `xr-camera-add` は実験的方式のまま据え置き、**ArchView360への採用候補からは除外する**。理由: 実機でも `HUD parent` が `camera(main)` に留まり、意図したXRサブカメラへのattachが機能していないことを確認したため。

### ArchView360へ戻すかどうか: 
- STEP1/STEP2（赤Cube表示・Debug Panel表示、`camera-forward`によるHUD追従）は実機確認済みのため、ArchView360へ持ち帰る候補とする。
- Controller button/axes の具体的なmapping値は次回実機検証で実測後に判断する。

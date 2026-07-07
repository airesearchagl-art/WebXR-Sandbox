# WebXR Sandbox

このリポジトリは **ArchView360 本体ではありません**。
ArchView360 の VR 不具合切り分けのために作られた、Three.js + WebXR の技術検証専用 Sandbox です。

## 目的

Quest Browser（Meta Quest 内蔵ブラウザ）上で WebXR を正しく扱う方法を、最小構成で確立することが目的です。
ここで実証できた方式（HUD の付け方、Controller 入力の取り方など）のみを ArchView360 本体へ持ち帰ります。
本体の複雑な描画・UIロジックを含んだまま検証すると原因切り分けが難しくなるため、意図的に最小構成にしています。

## 現在のステップ

- **STEP1**: Quest Browser で VR を開始すると、赤い Cube が表示される
- **STEP2**: `PlaneGeometry` + `CanvasTexture` による VR 空間内 HUD / Debug Panel が表示される
- Controller 入力は、情報表示（handedness / profiles / targetRayMode / gamepad有無 / buttons.length / axes.length）に加え、実測した Quest Touch Plus のbutton mappingを使ったダミーシーン切り替え・HUD/Debug表示切り替えまで実装済み（詳細は下記「Controller操作表」参照）。
- **STEP7相当（Controller操作によるダミーシーン切替）**: Quest実機で成功を確認済み（詳細は `docs/findings.md` 参照）。

## ローカル起動方法

```bash
npm install
npm run dev
```

デフォルトでは `http://localhost:5173` で開発サーバーが起動します。

ビルド確認:

```bash
npm run build
```

## Quest Browser 実機で確認する場合の注意

- WebXR (`immersive-vr`) は **HTTPS** または `localhost` でのみ有効になるのが一般的です。Quest 実機から PC の dev server にアクセスする場合、`localhost` は使えないため、HTTPS 配信（トンネリングサービス、または `vite` を HTTPS 設定で起動するなど）が必要になる可能性が高いです。
- `npm run dev -- --host 0.0.0.0` でLAN内公開はできますが、その場合も `http://` 経由でのWebXR起動は多くの環境でブロックされるため、HTTPS化の検証が別途必要です。
- Quest Browser は Console が確認しづらいため、重要な状態（`xr.isPresenting` や `inputSources` など）は本 Sandbox のように **画面内 Debug Panel** に表示する方針を取っています。
- Debug Panel には `sessionstart`/`sessionend`/`inputsourceschange` の発生回数、直近のイベント名、直近のエラーメッセージ、現在のHUD parent、カメラのワールド座標・クォータニオンの短縮表示も含まれます。実機検証時はこれらの値も `docs/findings.md` に記録してください。
- Debug Panel には左右Controllerごとの `pressed`/`touched`/`value > 0.05` のbutton index一覧、axesの主要値、直近に押されたbutton（handedness/index/value）も表示されます。Quest Touch Plus Controllerのbutton/axes mapping実測に使用してください。
- Vercelでホスティングしている場合、Deployment Protection / Vercel Authentication が有効なURLはQuest Browserからログインなしでアクセスできないことがあります。実機検証では、それらが **OFF のURL、または Production URL** を使用してください。

## HUD 表示方式

`src/main.js` の `HUD_MODES` に定義された4方式を切り替えられます（URL の `?hud=` パラメータ、または開発中はキーボードの `H` キーでも切り替え可能）。

- `world-fixed`: シーン内の固定座標に配置（カメラに追従しない）
- `camera-forward`: **【推奨・ArchView360へ戻す推奨HUD方式】** カメラの子要素として、常に正面に固定表示。Quest Browser実機検証でHUD parentが`camera(main)`として意図通りに追従することを確認済み。
- `camera-add`: カメラの子要素として、コーナー寄せのHUD風に配置
- `xr-camera-add`: （実験的・非推奨。**主要操作/採用候補としては不採用**）`renderer.xr.getCamera()` が返す XR 用サブカメラに直接アタッチしようとする方式。実機検証では表示自体は成功するが `HUD parent` が `camera(main)` のままとなり、意図したXRサブカメラへのattachができていないことを確認済み。詳細は `docs/findings.md` 参照

初期値は `camera-forward` です（Quest Browser で見えやすいことを優先、かつ実機で追従が確認できている推奨方式のため）。

## Controller操作表

Quest Touch Plus Controllerで実機実測したbutton mappingに基づき、以下の操作を割り当てています（`pressed`の立ち上がりエッジで発火。押しっぽなしで連続実行はされません）。**以下の操作はいずれもQuest実機で動作成功を確認済みです**（`docs/findings.md` 参照）。

| 操作 | Controller | button index | 実測ボタン名 | 実機確認 |
| :--- | :--- | :--- | :--- | :--- |
| Next scene (`nextScene`) | Right | `#4` | Right A | 成功 |
| Previous scene (`prevScene`) | Left | `#4` | Left X | 成功 |
| HUD ON/OFF (`toggleHud`) | Right | `#5` | Right B | 成功 |
| Debug detail toggle (`toggleDebugDetail`) | Left | `#5` | Left Y | 成功 |

- Trigger（`#0`）・Grip（`#1`）は現時点では未割り当てで、将来の拡張用に予約しています。
- Left Menu（`#12`）はDebug Panelの取得ログ（pressed/touched一覧）には表示されますが、**主要操作としては採用していません**。
- ダミーシーンは3種類（Scene 1: 赤Cube / Scene 2: 青Cube / Scene 3: 緑Cube＋背景色変更）で、別々のTHREE.Sceneを持つのではなく、単一シーン内でCubeの色と背景色を切り替える方式です。Cube色が赤→青→緑と切り替わること、押しっぽなしで連続切替されないこと、実機で確認済みです。

## 推奨Controller入力方式（ArchView360へ戻す実装方針）

実機検証の結果、以下の方式をArchView360側のController実装の推奨方式とします。

- `session.inputSources` のポーリング（毎フレーム走査）で接続中のControllerを検出する
- 各`XRInputSource.gamepad.buttons`を参照し、`pressed`の**立ち上がりエッジ検知**（前フレームの状態をhandedness+button indexをキーに保持し、falseからtrueへの変化を検出）でアクションを発火する
- こうすることで、押しっぽなし状態でアクションが連続実行されることを防げる（本Sandboxで実機確認済み）

## 検証ロードマップ（STEP1〜STEP7・予定）

1. STEP1: VR開始後に赤いCubeが表示されることの確認
2. STEP2: VR空間内にCanvasTexture製のDebug Panel/HUDが表示されることの確認
3. STEP3: HUD表示方式（world-fixed / camera-forward / camera-add / xr-camera-add）ごとの見え方の比較
4. STEP4: Controller (inputSources) の handedness / profiles / gamepad情報の実機取得確認
5. STEP5: Controller ボタン・軸入力を使った簡単なインタラクション（HUDモード切替など）
6. STEP6: 複数オブジェクト・シーン切り替えの検証
7. STEP7: ArchView360本体へ戻す方式の確定と移植方針の整理（Controllerによるダミーシーン切替は実機確認済み）

※ 各STEPの内容は検証結果に応じて前後する可能性があります。

## 実機検証ログの書き方

実機で確認した内容は `docs/findings.md` に追記してください。書式はテンプレートに従い、以下を必ず埋めてください。

- 検証日 / Quest機種 / Meta OS version / Quest Browser version / Three.js version
- 配信URL（伏字可）とHTTPS有無
- 対象STEP、期待結果、実際の結果
- 使用したHUD表示方式
- inputSources / buttons / axes の実際の値
- 採用判断（この方式を採用するか）
- ArchView360へ戻すかどうか

**未確認の実機結果を確認済みとして書かないでください。** 未実施の場合は「未実施」と明記してください。

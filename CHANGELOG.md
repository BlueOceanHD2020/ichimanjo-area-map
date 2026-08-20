# CHANGELOG

このファイルには、利用者または運用へ影響する変更を記録する。

## Unreleased

### Documentation

- プロジェクト名を「一万城区域デジタル管理プロジェクト」として定義
- `PROJECT.md`、`TODO.md`、`CHANGELOG.md`、`DECISIONS.md` を追加
- 今後の機能追加時にCHANGELOGとTODOを同時更新する運用を開始

## 2026-08-19

### Added

- My Maps由来KMLをLeaflet上に表示する静的Webアプリを作成
- サンライズ平江（427-M01）のマンションピンを追加
- マンションカードからGoogle Sheets「部屋管理」を開く導線を追加
- 部屋管理の午前・午後欄をチェックボックス化
- 写真付き「訪問しない家」サンプルピンを追加
- すべて、マンション、訪問しない家のピン表示切替を追加
- 区域境界の表示・非表示を追加
- M001〜M280を登録したGoogle Sheets「区域管理」を作成
- グループ保管、貸出状態、進捗、4か月判定、6色表示を追加
- M170、M175、M178の区域状態を地図へ表示
- Google Apps Scriptの読み取り専用APIを追加
- 起動時、手動更新時、60秒ごとの区域状態同期を追加
- GitHub Pagesへ公開

### Changed

- 訪問しない家ピンをマンションピンと重ならない位置へ移動
- 静的な区域状態スナップショットからApps Script同期へ拡張

### Security

- Apps Script APIの返却項目を区域IDと表示用状態に限定
- 担当者、日付、メモを公開APIから除外
- Apps ScriptのGoogle Sheets権限を読み取り専用に限定


# Changelog

---
## [1.1.1] - 2025-06-21
- (修正) バブル幅や入力欄の背景色・文字色などで、設定値がnullの場合に意図せず透明になる不具合を修正。設定未指定時はChatGPTのデフォルトデザインが適用されるように変更。
- (仕様変更) バブル幅、バブル背景色、入力欄の各プロパティについて、値がnullまたは未設定の場合はCSS自体を出力しない方式に統一。

## [1.1.0] - 2025-06-21
- (変更) パフォーマンスと保守性向上のため、アバターの挿入ロジックを大幅にリファクタリング。
- (変更) 立ち絵を従来の`<img>`タグによる描画から、`<div>`要素の`background-image`プロパティを用いる方式に変更。
- (変更) `defaultSet`で`bubblePadding`,`bubbleBorderRadius`を指定。
- (機能追加) 立ち絵の実装変更に伴い、`standingImage`プロパティで従来の画像URLに加え`linear-gradient()`などのCSS関数をサポート。これにより、グラデーションなども表示可能。

## [1.0.4] - 2025-06-10
- スクリプトのアイコンにChatGPTのアイコンを設定
- ChatGPTのUI変更に伴い、サイドバーの幅取得のセレクタを変更

## [1.0.3] - 2025-06-01
- 開発版では正規表現のフラグに "i" を自動付与していたが、リリース時に削除したつもりのコードが残っていたため、今回完全に削除した。

## [1.0.2] - 2025-05-31
- 立ち絵のz-index調整(autoで様子見。他のscriptとの表示上の競合を考慮したもの)

## [1.0.1] - 2025-05-30
- 不適切なサンプル（コード埋め込み）を修正

## [1.0.0] - 2025-05-28
- 一般公開
# ChatGPT Project Theme Automator

![license](https://img.shields.io/badge/license-MIT-green)
![userscript](https://img.shields.io/badge/userscript-Tampermonkey-blueviolet)
![platform](https://img.shields.io/badge/platform-ChatGPT-lightgrey)
![topic](https://img.shields.io/badge/topic-theme_automator-ff69b4)
![topic](https://img.shields.io/badge/topic-ui_enhancement-9cf)

[![Download](https://img.shields.io/badge/Download-ChatGPT_Project_Theme_Automator.user.js-blue?style=flat-square\&logo=download)](https://github.com/p65536/ChatGPT-Project-Theme-Automator/raw/main/ChatGPT%20Project%20Theme%20Automator.user.js)

![version](https://img.shields.io/badge/version-1.1.1-blue)  
最終更新日: **2025年6月21日**  
[変更履歴はこちら](./CHANGELOG_ja.md)

[English README is here.](./README.md)

---

## 概要

**ChatGPT Project Theme Automator**は、ChatGPTのUIに「プロジェクト名ごとのテーマ自動切り替え」機能を追加するTampermonkeyユーザースクリプトです。
各プロジェクトごとに、**ユーザー名／アシスタント名・文字色・アイコン画像・吹き出しスタイル・背景画像・スタンディング画像**などを柔軟にカスタマイズできます。

* テーマ適用先はプロジェクト名だけではなく、**カスタムGPT名やチャット名**にもマッチします。そのため**フリーユーザーでも利用できます。**
* **設定はJSONで管理・エクスポート／インポート可／エディタで編集も推奨**

  >### 関連スクリプト
  >**[ChatGPT Quick Text Buttons](https://github.com/p65536/ChatGPT-Quick-Text-Buttons)**  
  ChatGPTのチャット画面に「定型文クイック挿入ボタン」を追加するユーザースクリプトです。

---

## 主な機能

* 指定のプロジェクト/カスタムGPT/チャット名ごとにテーマ（配色、名前、アイコン、背景など）を自動切替
* ユーザー／アシスタントそれぞれの **「立ち絵（スタンディングイメージ）」を左右に別々に表示可能**
* ユーザー／アシスタントの表示名・アイコン・文字色をカスタマイズ可能
* ユーザー／アシスタントのアイコンをSVG・PNG・JPEG・Base64データ・外部URL等で指定可能
* テーマ適用先のプロジェクト名・カスタムGPT名・チャット名を**正規表現**で指定
* 設定をエクスポート／インポート可能（JSON形式）
* 設定サンプルあり。JSONに不慣れな人でも始めやすい。

---

## 実行イメージ

### 1. テーマ適用例(特定のプロジェクトに紐付かない場合に適用されるデフォルトテーマを設定可能)

![デフォルテーマの適用イメージ](./docs/cpta_theme_sample_default.webp)

### 2. 特定のプロジェクト名/カスタムGPT名/チャット名に適用するテーマをいくつでも作成可能

![テーマサンプル#1](./docs/cpta_theme_sample_theme1.webp)

### 3. 別のテーマ例

![テーマサンプル#2](./docs/cpta_theme_sample_theme2.webp)

### 4. "立ち絵"やアイコンを活用すればこんなこともできる

![テーマサンプル#3](./docs/cpta_theme_sample_game.webp)

### 5. パーソナルアシスタントとの会話も捗る(以下の画像は作者のパーソナルアシスタント)

![テーマサンプル#4](./docs/cpta_theme_sample_haruna.webp)

### 6. カスタマイズ可能項目の例（詳細は[`説明`](./docs/manual_json.md)参照）

![カスタマイズ可能項目](./docs/cpta_customizable_items.webp)

---

## インストール方法

1. [Tampermonkey](https://www.tampermonkey.net/) をブラウザに導入
2. 本リポジトリの最新版
   [`ChatGPT Project Theme Automator.user.js`](./ChatGPT%20Project%20Theme%20Automator.user.js) をダウンロード
3. Tampermonkeyの新規スクリプト作成で貼り付けて保存
   または `.user.js` ファイルをTampermonkeyへドラッグ＆ドロップ

---

## 更新方法

1. 念のため**設定をエクスポート**しておく
2. Tampermonkeyのダッシュボードで本スクリプトを開き、最新版に**全文置換**して保存

---

## 使い方

* 画面右上の歯車アイコンから**設定画面を開く**
* 各プロジェクトごとのテーマ／デフォルトテーマを**JSON形式で指定**  
  推奨：**エディタでJSON編集し、コピー＆貼り付け**、または編集したファイルを"Import"

---

## サンプル設定

一番簡単な始め方は、[`samples`](./samples) フォルダのサンプルをコピーして、プロパティを書き換えてみることです。  
以下いずれかの方法でサンプルJSONを取り込んでください。  
なおサンプルではGoogle Fontsの公開SVGアイコンを利用しています。
* サンプルJSONのテキストを全文コピーして、設定画面のテキストエリアに貼り付けて`Save`
* サンプルJSONをダウンロードして、設定画面で`Import`して`Save`

設定適用後、JSON設定の`defaultSet`の設定が適用されるはずです。  
では次に特定のプロジェクト／カスタムGPT／チャットに対するテーマ適用を確認するために、以下を試してください。
* チャット名を`[Theme1]`で始まる名前にする->`[Theme1]`用のテーマが適用される
* チャット名を`[Theme2]`で始まる名前にする->`[Theme2]`用のテーマが適用される
* チャット名を`[Game]`で始まる名前にする->`[Game]`用のテーマが適用される

サンプルで用意しているテーマは default(1) + 特定テーマ(3) の4つです。  
まずはこれらの設定内容を好きな値に書き換えてみてください。  
JSON書式や設定項目については **[`ChatGPT Project Theme Automator 設定JSON：全項目解説とサンプル`](./docs/manual_json_ja.md)** 参照。

---

## SVGエスケープ用ブックマークレット

アイコンにSVGコードを設定できますが、JSONに記述する際にはSVGコードの `"` を `\"` にエスケープする必要があります。  
手作業でエスケープするのは面倒くさいので、簡単に変換できるツールを用意しました。**ブックマークレット**です。  
ブックマークレットとは、ブックマークにJavaScriptのコードを登録し、そのコードを簡単に実行できるようにする機能です。  
以下の手順でブックマークに追加してください。

### 1. 以下のテキストを全て選択（トリプルクリック）して**ブックマークバーにドラッグ＆ドロップ**してください。

```js
javascript:(async()=>{function e(s){return s.replace(/\\/g,"\\\\").replace(/"/g,'\\"').replace(/\n/g,"");}try{const t=await navigator.clipboard.readText();if(!t.trim().startsWith("<svg")){alert("クリップボードにSVGコードがありません。");return;}const a=e(t);await navigator.clipboard.writeText(a);alert("SVGをエスケープしてクリップボードにコピーしました！icon項目に貼ってください。");}catch(r){alert("失敗: "+r.message);}})()
```

### 2. ブックマーク追加のダイアログが表示されます。**任意の名前**を付けて保存してください。例：`SVG変換`  

  #### ブックマーク登録画面（画像はFirefoxの場合）

  ![ブックマーク登録画面](./docs/cpta_a001.png)

  #### 任意の名前を付けて保存（画像はFirefoxの場合）

  ![ブックマーク登録画面](./docs/cpta_a002_ja.png)

  #### ブックマークに登録された（画像はFirefoxの場合）

  ![ブックマーク登録画面](./docs/cpta_a004_ja.png)

### 3. 使い方

 1. SVGを公開しているサイト（ここでは [Google Fonts](https://fonts.google.com/icons) を例にします）で任意のアイコンのSVGコードをコピー。

    ![Google Fontsのアイコン例](./docs/cpta_a003.png)

 2. 先に作成したブックマークレット **`SVG変換`** を実行（ブックマークをクリック）

    ![ブックマーク登録画面](./docs/cpta_a004_ja.png)

 3. 変換後のSVGコードがクリップボードにコピーされる。

    ![ブックマーク登録画面](./docs/cpta_a005_ja.png)

 4. クリップボードのテキストを設定ファイル(JSON)の `icon` 項目の `""`内に貼り付ける。

     ```json
     "icon": "ここに貼り付け"
     ```
 
---

## 推奨運用・カスタマイズ例

* アイコンや名前を設定することで自分専用アシスタント感倍増
* プロジェクトごとに文字色やアイコンが変わることで、現在何をしているか視覚的に分かりやすくなる
* 複数業務プロジェクト・TRPGセッションごとにキャラクター設定
* 自作アイコンやGoogle FontsのSVG利用による個性演出
* フォント・配色テーマもCSS追加で柔軟拡張可能
* テーマを適用先を正規表現で柔軟にマッチできる

## 注意事項・制限

* スクリプト自体に自動アップデート機能はありませんが、[Greasy Fork](https://greasyfork.org/ja/scripts/537656-chatgpt-project-theme-automator) でもスクリプトを公開しています。  
  スクリプトを自動更新したい方は、 Greasy Fork からインストールしてください。  
  スクリプトを手動更新したい方は、手動でスクリプトを差し替えてください。  
* ChatGPT側のUIが大幅に変更された場合、動作しなくなる可能性があります。
* Firefoxで動作確認しています。Chrome系ブラウザでも多分動きますが未検証です。

---

## ライセンス

MIT License

---

## 作者

* [p65536](https://github.com/p65536)

---

## 既知の問題

* アシスタントがテーブルを出力した場合にチャットバブルをはみ出て表示される。チャットバブルの横幅を調整している場合に特に目立つ。（どうやって対処しようか考え中。スクロールバー設置かな。）


## 今後の予定

### 優先的に検討中の項目（作者が実装したいと考えている）

* ユーザー名/アシスタント名をアイコンの下に折り返して表示しているが、折り返しなしで表示できるようにする。
* プロジェクト選択画面（サイドバーでプロジェクトを選択した直後の状態）でのテーマ適用調整（今はチャットリストやプロジェクトファイル等へのテーマ適用を考慮していない）
* ユーザー名/アシスタント名の背景にマスク設定（今は透過しているため、背景画像や背景色によっては名前が見えにくいことがある）

### 検討はしているが、現状では必要性を感じていない項目

* 設定画面のGUI化（JSON編集でよくね？）
* スクリプトの自動更新（自動更新したい方は [Greasy Fork](https://greasyfork.org/ja/scripts/537656-chatgpt-project-theme-automator) からインストールしてください）
* クラウド経由での設定同期（export/importによるローカル管理で十分）
* サイドバーへのテーマ適用（要らないよな？）
* 入力エリアのフォント変更（要るか？）
* ツールバー（画面上部のプロジェクト名やチャット名、アカウントアイコン等が表示されるエリア）へのテーマ適用on/off切り替え（初めはツールバーを除外してテーマ適用していたのだが、思ったよりツールバーが目立つから今のように全面適用にした）
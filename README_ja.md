# ChatGPT Project Theme Automator
![license](https://img.shields.io/badge/license-MIT-green)
![userscript](https://img.shields.io/badge/userscript-Tampermonkey-blueviolet)
![platform](https://img.shields.io/badge/platform-ChatGPT-lightgrey)
![topic](https://img.shields.io/badge/topic-theme_automator-ff69b4)
![topic](https://img.shields.io/badge/topic-ui_enhancement-9cf)

[![Download](https://img.shields.io/badge/Download-ChatGPT_Project_Theme_Automator.user.js-blue?style=flat-square&logo=download)](https://github.com/p65536/ChatGPT-Project-Theme-Automator/raw/main/ChatGPT%20Project%20Theme%20Automator.user.js)

[English README is here.](./README.md)

---

## 概要

ChatGPTのUIに「プロジェクト名ごとのテーマ自動切り替え」機能を追加するTampermonkeyユーザースクリプトです。  
各プロジェクトごとに、ユーザー名・アシスタント名・文字色・アイコン画像などを自由にカスタマイズできます。

「プロジェクトごと」と書きましたが、実際にはプロジェクト名のほかにページタイトルでもチェックしているため、**カスタムGPT名にもマッチします**。

ChatGPTのプロジェクト機能を使えるのはPlusユーザー以上（2025年5月現在）ですが、FreeユーザーでもカスタムGPTは使えるため、デフォルト設定のテーマを反映させることと、カスタムGPTへのテーマ適用はできます。

---

## 主な機能

* プロジェクトごとに独自のテーマ（配色・表示名・アイコンなど）を適用
* ユーザー／アシスタントの表示名・アイコン・文字色の変更
* テーマはプロジェクト名の**完全一致**または**正規表現**で切り替え可能
* テーマ自動切り替えはページ遷移・プロジェクト名変更・新チャット作成にも対応
* SVG/PNG/JPEG/Base64画像・外部URL等、様々な形式でアイコン指定が可能
* 日本語・英語両対応のドキュメント

---

## 実行イメージ

### 1. フリーユーザーの場合や特定のプロジェクトに紐づかないチャットの場合
本スクリプトで設定したデフォルトのテーマが適用される
![フリーユーザーの実行イメージ](/docs/cpta_001.png)

### 2. プロジェクト名「Tampermonkey Scripts」に対するテーマ設定をして同プロジェクトのチャットを開いた場合
プロジェクト「Tampermonkey Scripts」用のテーマが適用される（デフォルトのテーマとは異なるアイコン・色が使われているのが分かる）
![Plusユーザーの実行イメージ(Tampermonkey Scripts)](/docs/cpta_002.png)

### 3. プロジェクト名「Dungeon Master」に対するテーマ設定をして同プロジェクトのチャットを開いた場合
プロジェクト「Dungeon Master」用のテーマが適用される（デフォルトや他プロジェクトのテーマとは異なるアイコン・色が使われているのが分かる）
![Plusユーザーの実行イメージ(Dungeon Master)](/docs/cpta_003.png)

---

## インストール方法

1. [Tampermonkey 拡張](https://www.tampermonkey.net/) をお使いのブラウザにインストール
2. このリポジトリの最新版スクリプト
   [`ChatGPT Project Theme Automator.user.js`](./ChatGPT%20Project%20Theme%20Automator.user.js) をダウンロード
3. Tampermonkey のダッシュボードで「新規スクリプト作成」→ スクリプト内容を貼り付けて保存
   または `.user.js` ファイルを Tampermonkey にドラッグ＆ドロップ

---

## 更新方法

あらかじめ、自分のテーマ設定は退避（別テキストに保存）しておいてください。  
**テーマ設定はスクリプト埋め込みのため、最新版の上書きで消えてしまいます。**  
（設定の外部化は今のところ予定がありません。元々自分用スクリプトで、特定プロジェクトのテーマ変更が目的だったため）

1. Tampermonkey のダッシュボードから本スクリプトを開く
2. 最新版 [`ChatGPT Project Theme Automator.user.js`](./ChatGPT%20Project%20Theme%20Automator.user.js) の内容で全文置換
3. 退避していた自分のテーマ設定を、スクリプトの該当箇所に貼り付け
4. スクリプトを保存 (Ctrl+S)

---

## 使い方

1. スクリプト先頭付近の設定部分、`CHATGPT_PROJECT_THEME_CONFIG`内（`themeSets` / `defaultSet`）を編集し、
   プロジェクト名と適用したいテーマ（ユーザー名・アイコン・文字色など）を定義してください。

2. **プロジェクト名**は**完全一致の文字列**または**正規表現**で指定できます。  
   おすすめは正規表現です。プロジェクトに属するチャットはプロジェクト名を取得できるのですが、カスタムGPTの場合はタイトルと比較することになります。  
   ところがチャットのタイトルは状況に応じて変わります。例えば以下。
     * **{CustomGPTName} - {ChatName}**  
     * **ChatGPT - {CustomGPTName}**  
     * **ChatGPT**  
     カスタムGPTで新規チャットを開始すると、タイトルにカスタムGPT名が含まれない状況もあり得ます。この場合はサイドバーから該当チャットの名前を変更すると後ろにカスタムGPT名が付くようになると思います。

   このようにタイトルは不安定ですので、広くマッチするように正規表現で **/^.*CustomGPTName.*$/** または **/CustomGPTName/** と指定するとよいでしょう。
   
   例1（完全一致）：
   ```js
   projects: ['MyProject', 'Project Alpha']
   ``` 
   例2（正規表現）：
   ```js
   // 几帳面な人向け
   projects: [/^.*CustomGPTName.*$/]
   // 大雑把な人向け
   projects: [/CustomGPTName/]
   ``` 

3. **ユーザー名・アシスタント名**は任意の文字列を指定可能。
   長すぎる場合は自動で折り返されます。

4. **アイコン画像**は以下を使用できます。
   * 画像ファイルのURL（[https://...）](https://...）)
   * base64埋め込み画像データ（自作アイコンをローカルのみで使いたい場合等）
   * SVGコード（例： [Google Fonts](https://fonts.google.com/icons) で公開されているアイコン）

5. **文字色（textcolor）** はCSSカラーコード（例：`#b0c4de`）で指定します。未指定の場合、元の色が維持されます。

6. **アイコンサイズ**を指定できます。テーマコンフィグの下にある`ICON_SIZE`を書き換えてください。推奨値は以下。
   * 64 ... デフォルトサイズ。おすすめ。
   * 96 ... キャラクターアイコンを大きく見せたい場合にはありかも。
   * 128 ... これより大きいと邪魔になりそう。

7. テーマ設定の各項目は省略可能です。`name`,`icon`,`textcolor`のうち、必要な項目だけ設定してください。  
   各プロジェクトのテーマで設定を省略した項目は、デフォルトのテーマの同項目が使われます。

---

## アイコンサイズのイメージ感

### ICON_SIZE = 64
```js
const ICON_SIZE = 64;
```
![ICON_SIZE = 64](/docs/cpta_iconsize_64.png)

### ICON_SIZE = 96
```js
const ICON_SIZE = 96;
```
![ICON_SIZE = 96](/docs/cpta_iconsize_96.png)

### ICON_SIZE = 128
```js
const ICON_SIZE = 128;
```
![ICON_SIZE = 128](/docs/cpta_iconsize_128.png)

---

## サンプル設定

アイコンは [Google Fonts](https://fonts.google.com/icons) で公開されているアイコンを使用しています。

```js
const CHATGPT_PROJECT_THEME_CONFIG = {
    themeSets: [
        {
            // 'project1'に対するテーマ設定
            projects: ['project1'],
            // user について特定の設定をしない場合 -> name, icon, textcolor は defaultSet の設定が使われる
            user: {
            },
            // assistant について textcolor のみ変更する場合 -> name, icon は defaultSet の設定が使われる
            assistant: {
                textcolor: '#FF9900'
            }
        },
        {          
            // 'project2'に対するテーマ設定
            projects: ['project2'],
            // user について name, icon, textcolor すべて設定する場合
            user: {
                name: 'User',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 16c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2zm-.01-14C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>',
                textcolor: '#f0e68c'
            },
            // assistant について name, icon のみ設定する場合 -> textcolor は defaultset の設定が使われる
            assistant: {
                name: 'CPU',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M12 14c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5zm-.01-12C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>'
            }
        }
    ],
    defaultSet: {
      // name, icon のみ指定してテキストカラーは変更しない -> textcolor は変わらない（本スクリプト未使用時と同じ）
        user: {
            name: 'You',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><path d="M0 0h24v24H0V0z" fill="none"/><path d="M12 6c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2m0 10c2.7 0 5.8 1.29 6 2H6c.23-.72 3.31-2 6-2m0-12C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 10c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'
        },
        assistant: {
            name: 'ChatGPT',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#e3e3e3"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M19.94,9.06C19.5,5.73,16.57,3,13,3C9.47,3,6.57,5.61,6.08,9l-1.93,3.48C3.74,13.14,4.22,14,5,14h1l0,2c0,1.1,0.9,2,2,2h1 v3h7l0-4.68C18.62,15.07,20.35,12.24,19.94,9.06z M14.89,14.63L14,15.05V19h-3v-3H8v-4H6.7l1.33-2.33C8.21,7.06,10.35,5,13,5 c2.76,0,5,2.24,5,5C18,12.09,16.71,13.88,14.89,14.63z"/><path d="M12.5,12.54c-0.41,0-0.74,0.31-0.74,0.73c0,0.41,0.33,0.74,0.74,0.74c0.42,0,0.73-0.33,0.73-0.74 C13.23,12.85,12.92,12.54,12.5,12.54z"/><path d="M12.5,7c-1.03,0-1.74,0.67-2,1.45l0.96,0.4c0.13-0.39,0.43-0.86,1.05-0.86c0.95,0,1.13,0.89,0.8,1.36 c-0.32,0.45-0.86,0.75-1.14,1.26c-0.23,0.4-0.18,0.87-0.18,1.16h1.06c0-0.55,0.04-0.65,0.13-0.82c0.23-0.42,0.65-0.62,1.09-1.27 c0.4-0.59,0.25-1.38-0.01-1.8C13.95,7.39,13.36,7,12.5,7z"/></g></g></svg>'
        }
    }
};
```

---

## 注意事項・制限

* **自動アップデート機能はありません。**
  新バージョンが公開された際は、手動でスクリプトを差し替えてください。
* **テーマ設定はスクリプト埋め込みです。**
  新バージョンが公開された際は、更新前にあらかじめ自分のテーマ設定を退避してください。
* ChatGPT側のUIが大幅に変更された場合、動作しなくなる可能性があります。

---

## ライセンス

MIT License

---

## 作者

* [p65536](https://github.com/p65536)

---

# 利益職人 Web公開用

これは「利益職人」をURLで開けるWebアプリとして公開するためのセットです。

## 入っているもの
- index.html
- style.css
- script.js
- manifest.json
- sw.js
- icon.svg
- vercel.json
- _redirects

## おすすめ公開方法
### 1. Vercelで公開
1. GitHubにこのフォルダをアップロード
2. VercelでNew Project
3. GitHubのリポジトリを選択
4. Deploy
5. 発行されたURLでアプリを開く

### 2. Netlifyで公開
1. Netlifyにログイン
2. Add new site
3. このフォルダをアップロード
4. 発行されたURLでアプリを開く

## スマホでアプリ風に使う
iPhone:
1. SafariでURLを開く
2. 共有ボタン
3. ホーム画面に追加

Android:
1. ChromeでURLを開く
2. メニュー
3. ホーム画面に追加

## 注意
Google Maps APIや印影保存を安定させるには、file:// ではなく https:// のURLで開く必要があります。

## 今後の販売版で必要なもの
- ログイン機能
- クラウド保存
- 会社ごとの単価管理
- 印影クラウド保存
- Google Maps APIキーのサーバー管理
- 見積書・請求書のPDFサーバー生成

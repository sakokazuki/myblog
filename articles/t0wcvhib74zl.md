---
title: DropBoxPaperとVuePressでブログ運用
date: 2019-11-31
meta:
  - name: description
    content: DropBoxPaperとVuePressでブログ運用ブログを作ろうと思い、自分が気軽にブログを書き続けるにはどうすればいいのか考えると、自分で投稿の仕組みからつくるしかないということになり自分で運用することにした。
  - name: keywords
    content: Vue,Javascript,Web
  - name: og:title
    content: DropBoxPaperとVuePressでブログ運用
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: https://paper-attachments.dropbox.com/s_C9B73BF881BE8D80F5BA5CF564AE2E17DD6C9FCC0134961D23E81B9FD9AC4094_1575110971250_2019-11-30_19-49-08.png
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [Vue,Javascript,Web] 
type: tech
emoji: 💛
published: true
---
ブログを作ろうと思い、自分が気軽にブログを書き続けるにはどうすればいいのか考えると、自分で投稿の仕組みからつくるしかないということになり自分で運用することにした。
既存のサービス(はてな, Qiitaなど)も前に試したことがあるが途中で更新が止まってしまった。noteは試していないが技術的なこと中心にしたいので選択肢からははずした。


## まとめ

これからどうやってブログシステムを作ったか解説するが若干長くなる可能性があるので概要だけ先にまとめてみた。


- ブログはDropBox Paperで書く
- dropboxのAPIでマークダウンを取得
- (少し整形して)VuePressにマークダウンを入れる
- ビルド
- デプロイ

1年くらいまえから技術とかをメモするのをくせにしようとしていてDropBox Paperに文章をいくつか書いていて、ブログをつくるならこのメモをそのまま公開したいなという希望があった。

これを手動でQiitaなりにコピペして整形して投稿すればいいのだが間違いを見つけたときにPaperとQiitaをどっちも更新しないといけないとうことになり面倒だとおもったので色々考えた結果出来上がったシステムである。ちなみにPaperは外部に公開みたいな設定があるがあれ、見た人の足跡?が残ったりしてブログとは言えないなと思い却下した。

メリットとして

- とりあえずPaperに何でも書いて公開するかは後で考える
- プライベート/パブリックなドキュメントが1つにまとまる
- あと地味に便利なのが画像もそのままPaperでつかってるのものを使える
- 自分用にカスタマイズできる

デメリットとして

- つくるのとか最初の設定が非常に面倒
- 公開も若干面倒
- Paperの気分次第で不可能になることもある？

が挙げられる。

以下、各トピックに関して少し詳細に書いておく


## DropBox Paperで書いてExportする

DropBoxにはAPIがあり、それを使ってなんとかマークダウンを取得する。
この記事とか参考になる気がする

*Dropbox PaperからAPIでダウンロード*
https://qiita.com/SaitoTsutomu/items/6f48b93b2a64faa26447

こういうconfigファイルを作成して
node.jsのaxiosでリクエスト→記事をmarkdownとして保存する。
idにpaperのurl末尾のidを入れる。
apiで日付が取れないので妥協点としてここに公開日とか書いておくことにした。
tagは将来使うかなと思って一応書いておく。

paper.config.js


````javascript
module.exports = {
  articles: [
    {
      "id": "xxxxxxxxx", //ブログ作りました
      "date": "2019-11-01",
      "tags": [
        "雑記",
      ],
    },
    {
      ...
    }
  ]
}

````

そうすると以下のようなmarkdownが取得できる



````md
# ブログつくりました
いわゆる技術ブログというものをつくってみました。
...
..
.
````

## マークダウンを整形する

このあと触れるがVuePressを用いてブログを構築するのでそれ用にマークダウンを若干整形する必要があった。

以下のように、ymlのブロックにタイトルを入れて`paper.config.js`の日付をそのまま記入した。地味なテキスト処理。



````md
---
title: ブログつくりました
date: 2019-11-01
---
いわゆる技術ブログというものをつくってみました。

````

あと、技術ブログなのでコードはきれいに表示したくVuePressはPrism.jsというライブラリを標準装備していて以下のように書けばその言語のコードハイライトをしてくれたりするらしい。


````md
```javascript
var x = 10;
var y = 1;
```

````

しかしPaperでダウンロードしてきたMarkdownは仕様上そうなってないのでこれは個人ルールとして”<.js>”と<>で囲った下のコードブロックを変形させるみたいな地味な処理を追加した。
ダウンロードしたマークダウンを1行ずつ読んでいってマッチした行を変換していくという泥臭い手法。
この辺はしょうがないかなと思う。

Paperで以下のようにかいたものが上のように変換される。


````md
<.js>
```
var x = 10;
var y = 1;
```
````

## VuePressについて

そもそもこの構成はVuePressを知っていたから思いついたもので、知らない人はなにかと便利なので覚えても損はないと思う。

VuePressとはVueの静的サイトジェネレーターである。Nuxt.jsのようなもの。
https://vuepress.vuejs.org/

webサイトを作りまくってた時代に試行錯誤した結果、VuePressをゴリゴリにカスタマイズして静的サイトをつくり納品するという手法をとっていた。それに関しては内容が古いバージョンのものであるが以前にQiitaでこんな記事をかいた。

*webサイト制作環境が変わる！VuePress入門*
https://qiita.com/sa-k0/items/4e0fca341b91c1fefe54

それはさておき今回はマークダウンをディレクトリに保存するとそのまま静的サイトとしてビルドができるというVuePressらしい使い方をしていて、Paperからダウンロードしたマークダウンを上に述べたような整形をして、VuePressのディレクトリ以下に保存している。ディレクトリ名はpaperのidを短縮して使用した。


![](https://paper-attachments.dropbox.com/s_C9B73BF881BE8D80F5BA5CF564AE2E17DD6C9FCC0134961D23E81B9FD9AC4094_1575110971250_2019-11-30_19-49-08.png)













このようにすると、`localhost:8000/id/index.html`というサイトができあがる。

そんなVuePress、開発がバリバリ進んでいるようで1.0からblogという機能ができた。
blogとは他の人がつくったテンプレートをconfigに書くとそのデザインが使えるというものである。

オリジナルデザインを作ろと思えば作れるのだがある程度見やすくて記事かければいいので今回はこちらのテーマをしようさせてもらった。

https://github.com/viko16/vuepress-theme-simple

しかし、フォントが中国ベースだったりしたので、若干cssを上書きしたくこの記事の方法で自分でも少しcssをいじった

VuePressで作ったblogに配布されているテーマを設定する
https://qiita.com/tomopict/items/9da7cf28c9bcd5f933cb



## Netlifyでホスティング

この時点で
ブログを書く→ダウンロードして整形→VuePressで確認
という開発フローがととのった。

あとはこれを簡単に更新してビルドする方法を模索するかである。

これに関してはNetlifyでやってみることにした。
実は半年前くらいにベースはつくっていたのでNetlifyにしたが、
今ならGithub Actionsを使用してGithub Pagesでホストするという方法でGithubで完結するかもしれないと思う。

Netlifyに関してはほぼ覚えていないし適宜ぐぐるとなんかでてくるのでやっていることを記述しておく。

- Githubにpushされたのを監視する
    - よってローカルからのpushもそうだが、
    - Github上で`paper.config.js`を編集してpushして更新することも
    - 実質Githubがオンラインエディタ..?
- NetfilyのCI動く(ローカル上でやっていたことをCIに任せる)
    - paper APIにリクエスト
    - テキスト整形
    - VuePressビルド
    - ビルド内容をデプロイ
- サイトはNetlifyがホスティングしてくれる

あとは独自ドメインとか取得&設定してSSLもNetlifyにまかせておしまい。

*お名前.comで取得したドメインを、Netlify に設定する方法*
https://note.com/koushikagawa/n/n407cde93bdca
*Netlifyで公開しているサイトをSSL化する方法*
https://note.com/koushikagawa/n/n23c0783bf05e


## 更新方法
- とりあえずPaperに書く
- 公開したい記事の末尾のidをコピー
- Githubもしくはローカルで`paper.config.js`を更新
- git push
- 確認


# Blog Generator from DropBox Paper

## 概要

ブログをDropBox Paperで運用する

## Dev Setup

1. Dropboxのアクセストークンを取得し、ルートディレクトリにaccess-token.txtという名前で保存
1. papger/paper.config.jsにブログ化したいPaperの記事のid(urlのhash部分)と日付、タグを書く。
    - id間違えると以下のコマンドでエラーになる


```
yarn paper
```

blog/ディレクトリ以下にhash_idを短縮したフォルダとindex.mdができる。

```
yarn dev
```

で新規機能などを開発

## Build

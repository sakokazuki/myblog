---
title: ステンシルバッファ
topics: [GraphicsPrograming]
type: tech
emoji: 💛
published: true
---

## 概念

[【Unity】ステンシルバッファの復習 - Qiita](https://qiita.com/r-ngtm/items/ec738be7780ccaabf606)

## 出てくる用語

- ステンシルバッファ: デプスバッファと一緒に使う。FormatはD24_U8とかD32_U8X24とかよく見る
- Mask: StencilRefにマスクをすることができる。0と255しかみたことないけど。0は無効化される。255はなにもしない。
- Func: 現在のステンフィルバッファとStencilRefを比較して、大きければ通すとか小さければ通すとか常に合格するとかの条件を決める
- FailOp: 失敗したときにStencilRefの値をどうするか(書き込む?インクリメント?そのまま?など)
- PassOp: 成功したときにどうるすか

基本的には現在のステンシルバッファとStencilRefを比較して、描画するorしないを評価したりステンシルに書き込みをするかどうかを決めたりする。
---
title: Depth Bounds Test
topics: [Direct3D12]
type: tech
emoji: 🔍
published: true
---


調べてるときに知らない用語出てきたのでメモ

[Depth Bounds Test(1)](https://shikihuiku.wordpress.com/2012/06/27/depth-bounds-test1/)

ざっくりいうと特定のレンダリングパスにおいて指定した深度範囲内のみ描画するというもの。 Direct3D 12で言えばCommandListで範囲指定するAPIがあり(名前忘れた)、比較対象はDepthBuffer。
応用方法などは上記の記事に丁寧にまとまっていた。(古いエントリなので最近だと違う使い方もあるのかもしれない。)
D3D12のDepthStencilStateにあとから有効無効にする機能がついてるが、DepthBoundsTestに関しては少なくともそれより前の世代から概念としては存在していたようだ。
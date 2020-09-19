---
title: WSL2(Linux)でwebpackのwatchができない
topics: [WSL2,Web] 
type: tech
emoji: 💛
published: true
---

## 解決策

webpack.config.jsに



````javascript
watchOptions:{
  poll: true,
}

````

とする。

以下他ためしたこと

## Linuxではwatchできるファイル数制限してる場合があるらしい

*Increasing the amount of inotify watchers*
https://github.com/guard/listen/wiki/Increasing-the-amount-of-inotify-watchers

だめだった。けどやる必要はあるかもしれない


## Pathが解決できていない？

Windows 10ではパスの記号が’/’でなく’\’なのでそれが問題になるケースがあるらしい。WSL(Linux)なので問題ないと思うが一応設定した。

*Windows で webpack --watch が効かない時*
https://qiita.com/ryohey/items/3e664b467309e5cd34e9

効果なしだった。


## watchOptionsにpollというものがある

*webpack watch mode not working....*
https://github.com/webpack/webpack/issues/2949#issuecomment-279348745

これで成功した。

以下公式の引用
https://webpack.js.org/configuration/watch/#watchoptionspoll


> If watching does not work for you, try out this option. Watching does not work with NFS and machines in VirtualBox.

watchオプションはVirtualBoxとかの仮想環境で動かないからpollingするってこと？かもしれない。

無事解決して何より。



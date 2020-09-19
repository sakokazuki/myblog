---
title: タッチセンサーキャリブレーションアルゴリズムについて
date: 2020-1-25
meta:
  - name: description
    content: タッチセンサーキャリブレーションアルゴリズムについて概要なんらかの事情でこういう感じのタッチセンサーのキャリブレーションをやらないといけなくなった際の足がかりとなる記事です。
  - name: keywords
    content: C,AirBar,キャリブレーション,数学
  - name: og:title
    content: タッチセンサーキャリブレーションアルゴリズムについて
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: https://images-na.ssl-images-amazon.com/images/I/61EErgl7%2B3L._AC_SX425_.jpg
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [C,AirBar,キャリブレーション,数学] 
type: tech
emoji: 💛
---

## 概要

なんらかの事情で[こういう感じのタッチセンサー](https://www.digikey.jp/ja/product-highlight/n/neonode/zforce-air-touch-sensors)のキャリブレーションをやらないといけなくなった際の足がかりとなる記事です。


![](https://images-na.ssl-images-amazon.com/images/I/61EErgl7%2B3L._AC_SX425_.jpg)


最近、AirBarが発売みたいな記事を読んだのだが日本では未発売だったみたいです。
https://akiba-pc.watch.impress.co.jp/docs/news/news/1231100.html
この製品はSDKが公開されておりこの記事で紹介するアルゴリズムを使用してUnity向けのダイナミックライブラリを作成した

お品書き

- アナログ・デバイセズ社の資料を読むことにした
- 実装はpdfに書いてある
- 数学わからなかった部分の参考リンク
- わりと精度高く実装できた
## 導入

タッチセンサーを使用し、任意の座標空間でのキャリブレーションを自前で行う方法を考える。
軽く調べたところいい感じのライブラリが見当たらず、いくつかのライブラリをトライ・アンド・エラーするよりも
自分で実装してしまったほうが早いし勉強になると思ったので自前で実装してみることにした。
multi-point calibrationとしてすぐ出てきたこの資料
https://www.analog.com/media/jp/technical-documentation/application-notes/AN-1021_jp.pdf
で実装した。
英語版(原典？)はこちら
https://www.analog.com/media/en/technical-documentation/application-notes/AN-1021.pdf

他の方法

- https://github.com/kergoth/tslib/blob/d09d2cdc0089d0bd73e4d08b097a6292f18537ef/tests/ts_calibrate_common.c
    - 5点でやる別のやり方っぽい。実装が違う気がする。
    - ちゃんと読んでない
- http://www.tij.co.jp/jp/lit/an/slyt277/slyt277.pdf
    - 面倒でちゃんと読んでないけどやったやつと一緒のこと書いてある気がする。
## 数学的な部分の理解を深める

1年ほど前(2019年の頭)にやっていたので今ほとんど覚えていないが当時に参考にしたリンク

**数学的基礎**
参考リンク集

- 連立方程式の行列解
    - http://www.eisaijuku.join-us.jp/renritu-houteishiki-no-gyoretu-kai.html
- 逆行列のもとめかた
    - https://mathtrain.jp/inversematrix
    - https://matrixcalc.org/ja/
- MMSE(最小平均二乗誤差)
    - 最小平均二乗誤差 http://arduinopid.web.fc2.com/P12.html
    - 上に書いてあるとおり平均二乗誤差を最小化する値
    - 平均二乗誤差って分散のこと
    - 分散から平均を引いた和の平均？
    - 上のサイトの内容
    - 同じようなあれで最小二乗法というのがあり
    - それを解説してる動画(https://www.youtube.com/watch?v=Zz1sgYxrA-k )がとてもわかりやすい
- 行列の消去法
    - 行列を連立方程式の形にした場合、消去法が使える
    - こういうような https://oguemon.com/study/linear-algebra/elimination/
    - 論文中では階段行列とかは出てこなくてあくまで式変形してるだけ


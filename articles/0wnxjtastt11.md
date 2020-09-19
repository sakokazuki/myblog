---
title: web関係リンク集
date: 2019-11-29
meta:
  - name: description
    content: web関係リンク集pug変数にをHTMLタグとして書く
  - name: keywords
    content: Web
  - name: og:title
    content: web関係リンク集
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: 
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [Web] 
type: tech
emoji: 💛
published: true
---


変数にをHTMLタグとして書く



````pug
- var text = "hogehoge<br>hogehoge"

p=text //- <br>がそのまま文字としてでる
p!=text //- <br>が改行タグになる
````

## filter一覧

https://puchutech.hatenablog.com/entry/css-filter


## トランジションのカーブを作るサイト

https://cubic-bezier.com/


## stylusでcalcとかに変数を使う

https://stackoverflow.com/questions/26748836/proper-syntax-for-stylus-mixin-using-transform-translate-or-other-2-part-rules



````css
$hoge = 10
$huga = 2
margin-top "calc(100% - %s / %s)" % ($hoge $huga)


````

## “css 右寄せ”

https://teratail.com/questions/127558


## 改行コードでテキスト折り返す



````css
white-space: pre-wrap
word-wrap:break-word


````

## テキスト折り返さない



````css
white-space nowrap


````

## アニメーション animation

@kayframe 定義



````css
@keyframes AnimationName
  from
    opacity 0
  to
    opacity 1

@keyframes AnimationName
  0%
    opacity 0
  50%
    opacity 1
  100%
    opacity 0

````

Animationタグ
引用> https://qiita.com/7968/items/1d999354e00db53bcbd8#no09-animation-%E3%83%97%E3%83%AD%E3%83%91%E3%83%86%E3%82%A3
(Animationについてはこの記事だいたいまとまっている)



````css
セレクタ名 {
    animation: animation-nameの値 animation-durationの値 animation-timing-functionの値 animation-delayの値 animation-iteration-countの値 animation-directionの値 animation-fill-modeの値 animation-play-stateの値;
}

セレクタ名 {
    animation: 名前 開始から終了までの時間 進行の度合い 開始時間 繰り返し回数 再生方向 開始前・終了後のスタイル 再生・停止;
}


````

## “scrollmagic offset percentage”

[janpaepke/ScrollMagic#337](https://github.com/janpaepke/ScrollMagic/issues/337)
scroll magicのトリガーの位置を％で指定したいときはoffsetじゃなくてtriggerhookに0.0~1.0の値を入れる


## 画像のロード待つ



````javascript
const waitLoadingImage = (src)=>{
  return new Promise((resolve)=>{
    const image = new Image();
    image.onload = ()=>{
      resolve();
    }
    image.src = src;
  })  
}


````

## ゼロうめ

https://qiita.com/cress_cc/items/3e820fe1695f13793df3



````javascript
function yyyymmdd(y, m, d) {
    var y0 = ('000' + y).slice(-4);
    var m0 = ('0' + m).slice(-2);
    var d0 = ('0' + d).slice(-2);
    return y0 + m0 + d0;
}


````

## Cookie

いつもつかうやつ
https://github.com/js-cookie/js-cookie



````javascript
import Cookies from 'js-cookie'

Cookies.set('foo', 'bar')
Cookies.set('name', 'value', { expires: 7 })
Cookies.get('name') 
Cookies.remove('name')

````

## カルーセル

いろいろ検討したけどカルーセルはこれが一番いいと思う
https://github.com/surmon-china/vue-awesome-swiper


## 指定回数の処理をするv-for

https://hafilog.com/vue-for-loop


## コンポーネントを再レンダリングする

[Vueコンポーネント再描画の方法](https://qiita.com/Safire/items/76ddba72d6d4fe198802)
keyに値入れておいてそれを更新すると再描画される。
なのでdataに変数をもっておいて、更新したい時変数をインクリメントするなどした。




## テキストの背景にパターンを敷く

https://stackoverflow.com/questions/12637239/repeating-an-image-within-a-svg-mask


## ビデオ(イメージ)をpathでマスクする

https://codepen.io/dudleystorey/pen/QvvEYQ



## サブセット化されたnotosans

https://github.com/minoryorg/Noto-Sans-CJK-JP


## Android Chromeデバッグ

https://qiita.com/hojishi/items/12b726f8b02ef3d713e4


1. usbデバッグを有効にする
2. chrome://inspect/#devices


## psdで使われてるフォントを表示するスクリプト

https://www.cg-method.com/entry/photoshop-detect-fonts/


## 画像圧縮

**pngquant**
フォルダを再帰的に読む方法
https://stackoverflow.com/questions/9647920/recursively-batch-process-files-with-pngquant
findで探してパイプする
`find {dir} -name '*.png' -print0 | xargs -0 -P8 -L1 pngquant --ext .png -f --speed 1`

実行前に対象ファイルを確認したいときは以下のようにechoすれば良さそう
`find {dir} -name '*.png' -print0 | xargs -0 -P8 -L1 echo`

xargsのオプション、-0はデリミタ文字(不要文字？)の削除 -Pは同時実行可能数 -Lは展開可能数らしい
[xargsのオプションいろいろ](https://qiita.com/hitode7456/items/6ba8e2d58f9b8db9de11#-l-%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3)
[xargsのオプション無し、-Iオプション、-0オプションの挙動に関する勘違い](https://qiita.com/takc923/items/da1c32f3a622dc1c5489#-0%E3%82%AA%E3%83%97%E3%82%B7%E3%83%A7%E3%83%B3%E3%81%AE%E5%8B%98%E9%81%95%E3%81%84)

**jpegoptim**
再起云々はpngquantと同じでできる。
以下のリンクはjpgoptimの画質設定の比較。95くらいにしないとかなり劣化する
https://blog.ideamans.com/2017/11/jpg-diet-jpegoptim.html

よってコマンドは
`find {dir} -name '*.png' -print0 | xargs -0 -P8 -L1 jpegoptim --strip-all -m95 -t`
確認は
`find {dir} -name '*.jpg' -print0 | xargs -0 -P8 -L1 echo`







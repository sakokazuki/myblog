---
title: 久しぶりにThree.jsを触ったので簡単なメモ
topics: [Three.js,javascript]
type: tech
emoji: 📝
published: true
---
1年近くグラフィック系のプログラミングを専門とする会社で働いた後に久しぶりにThree.jsを使うと今まで意識しなかった部分でWebGLではあれができないとか、パフォーマンス向上のためにはこうしたほうがいいとか気づきがあったので簡単にメモをしていく。

トピックスでまとめると案外4つしかなかった。


## 計測

ここに書いた。
https://biwanoie.tokyo/6Xldl/
Three.js Developer Toolをchromeに入れるだけでとりあえずdraw callとか頂点数が見れるのでパフォーマンス計測の指標になる。

拡張入れなくても[THREE.WebGLRenderer.info](https://threejs.org/docs/#api/en/renderers/WebGLRenderer.info)に入っている情報でいろいろわかる。
ドキュメントに書いてあるがCompoerなどを使う際は自分で毎フレームリセットをしなければいけない。

次の影の話につながるが、ライトのシャドウマップを有効にするとシャドウマップ生成のためにライトからみたビューポートに入っているオブジェクトを再描画しないといけないのでDrawCallが突然2倍近くになったりする。


## シャドウマップは可能であれば生成回数を減らしたい

上にも書いてある通り、シャドウマップを常に有効にすると毎フレームのDrawCallがかなり増加するので生成関数を減らしたい。一番いいのは静的なシーンであれば最初のフレームのみシャドウマップを更新することだ。

WebGLRenderer.shadowMap.autoUpdateが確か標準でtrueになっており毎回アップデートされるがfalseに設定するのがいい(こともある)。
たしか更新時はWebGLRenderer.needsUpdateをtrueにする。


## デフォルトのFBO以外ではmsaaが使えない

ここに書いてあった。
https://ics.media/web3d-maniacs/webgl2_renderbufferstoragemultisample/

FBO:フレームバッファオブジェクト描画を一度別のテクスチャに描画してから実際の出力先に描画するときに使われるテクスチャ。openGL系の用語？
MSAA: ハードウェアで実行されるアンチエイリアス(three.jsだとWebGLRenderer.antialias=trueで有効になる？)

なので、例えばEffectComposerを使った際に一度オフスクリーンに描画する処理があるときはアンチエイリアスを有効にしているつもりが使えず、そのままになっていることがある。今のところ対処方法はFXAA,SMAAを使う(examplesにある)くらいしかないと思う。


## デフォルトのFBO以外ではガンマ補正ができない(_sRGBフォーマットに対応していない)

(どっかにかいてあるのを見た気がするのだけどリンク先をなくしてしまった)

srgbフォーマットのフレームバッファを使うにはWebGLRenderer.outputEncodingにTHREE.sRGBEncodingを設定するなどでできるが、先ほどと同じようにオフスクリーン描画などが入ると有効にならない。対処としては自分でガンマ補正するパスを追加する。

参考) https://discourse.threejs.org/t/srgb-encoding-as-a-postprocess-pass/12278/2

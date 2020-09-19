---
title: ShaderPlaygroundというサイトがすごい
topics: [Shader,GraphicsPrograming] 
type: tech
emoji: 💛
published: true
---
このサイト。
http://shader-playground.timjones.io/

仕事中に偶然見つけたサイトなのだがブラウザ上でHLSL/GLSLのコンパイル結果を見ることができて、しかもコンパイラもdxcやfxcなど各種コンパイラで比較することができる。更に、コンパイルを2段階以上することができて、HLSLをdxcでSPIR-Vにコンパイルして更にSPIR-V CrossでGLSLやMetalShader(MSL)として出力するといったことも試せる。というかまさにそれができるサイトないかなと調べていて出会ったのがこのサイト。まさかこんなものがあるとは。


## 一例

画像のようにHLSLのVertexShader(左側)をGLSLに変換している(右側)

![](https://paper-attachments.dropbox.com/s_2133982CCABEB6536F2400CF5406881FEECC0A4D712075EDC6DFA10AB0387F33_1591466646258_2020-06-07_03-03-38.png)


面倒なのでコードは載せないがマルチプラットフォームでシェーダーを書かないと行けない場合や、HLSLでは行列の掛け算のときにmul()を使うけどGLSLではそういうのなかったんだっけ？とかGLSLでregisterってbindingだけど書き方忘れたとか各言語で微妙に違う部分をかんたんに確かめることができる。もちろんドキュメント等を読めばわかることだがなかなか骨が折れるのでとりあえず変換してみて回答例？のようなものをみてみるという使い方ができる！便利！

他にもおそらく有用な使い方はあると思うし今後も使っていこう！


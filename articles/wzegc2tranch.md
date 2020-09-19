---
title: OpenGLでNearFarに-1を掛ける理由について考察
date: 2020-3-24
meta:
  - name: description
    content: OpenGLでNearFarに-1を掛ける理由について考察プロジェクション行列を考えるにあたり、なぜかOpenGLはNearとFarに-1を掛けて計算するのにどうして？？と疑問が湧いた。これらはOpenGLが右手系であることが主な理由だと思い、右手系と左手系を比較しながらかんたんに考察する。
  - name: keywords
    content: DirectX,Direct3D12,OpenGL,GraphicsPrograming
  - name: og:title
    content: OpenGLでNearFarに-1を掛ける理由について考察
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: https://paper-attachments.dropbox.com/s_1D648833A81BD77D79B4667F4E0A68B2914DF024B2BF376EB6D623ED9572BA61_1585060701316_opengl_01.jpg
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [DirectX,Direct3D12,OpenGL,GraphicsPrograming] 
type: tech
emoji: 💛
published: true
---
プロジェクション行列を考えるにあたり、なぜかOpenGLはNearとFarに-1を掛けて計算するのにどうして？？と疑問が湧いた。これらはOpenGLが右手系であることが主な理由だと思い、右手系と左手系を比較しながらかんたんに考察する。

**考察なので本当にあっているかはわからない**。もはやOpenGLは-1を掛けるとして覚えてもいいし、だいたいはMath系のライブラリ(glmなど)任せで計算するのだし。

まずは以下のような左手系の座標と右手系の座標をみる。手で示すと親指をx,人差し指をy,中指をzとするとz軸は左手系は奥に向かい、右手系は手前に向かうことがわかる


![](https://paper-attachments.dropbox.com/s_1D648833A81BD77D79B4667F4E0A68B2914DF024B2BF376EB6D623ED9572BA61_1585060701316_opengl_01.jpg)


また、下の画像のようにz=2の座標にポリゴンがある状況を元に考察をすすめる


![](https://paper-attachments.dropbox.com/s_1D648833A81BD77D79B4667F4E0A68B2914DF024B2BF376EB6D623ED9572BA61_1585060709997_opengl_02.jpg)


適当な正射影のビューをつくり、Near側から見た絵を考えると(下図)、右手系と左手系では同じ画像が出ないことがわかった。


![](https://paper-attachments.dropbox.com/s_1D648833A81BD77D79B4667F4E0A68B2914DF024B2BF376EB6D623ED9572BA61_1585060719758_opengl_3.jpg)


なので、右手系側(OpenGL)のNearとFarを反転させるために-1を掛けたビュー空間内でプロジェクション行列を考えようということかなと理解した。反転させた空間をz軸に向かう方向に見れば左手系と見た目が一致する。


![](https://paper-attachments.dropbox.com/s_1D648833A81BD77D79B4667F4E0A68B2914DF024B2BF376EB6D623ED9572BA61_1585060728150_opengl_04.jpg)


マルチプラットフォームであれば確かにどちらかに合わせる必要があるがglmはそういうライブラリではないが(OpenGL Mathematicsだし)、なぜかデフォルトで反転させている。これは考察だが、単純にXを右、Yを上とする(ViewPortでいうと左下が0)のに慣れてしまっているから？Yが下向き(もしくはXが左向き)で良ければそのままでも良さそうではある。


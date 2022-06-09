---
title: Scalable Ambient Obscurance
topics: [GraphicsPrograming]
type: tech
published: false
---
SSAOの手法の一つ。

[https://casual-effects.com/research/McGuire2012SAO/index.html](https://casual-effects.com/research/McGuire2012SAO/index.html)からペーパーとプレゼンテーションがDLできる。両方を見ながら理解した。

すべての画像は以下より引用
[https://research.nvidia.com/sites/default/files/pubs/2012-06_Scalable-Ambient-Obscurance/McGuire12SAO.pdf#page=7&zoom=100,96,440](https://research.nvidia.com/sites/default/files/pubs/2012-06_Scalable-Ambient-Obscurance/McGuire12SAO.pdf#page=7&zoom=100,96,440)
[https://research.nvidia.com/sites/default/files/pubs/2012-06_Scalable-Ambient-Obscurance/McGuire12SAO.pdf](https://research.nvidia.com/sites/default/files/pubs/2012-06_Scalable-Ambient-Obscurance/McGuire12SAO.pdf)

Alchemy AOをベースにパフォーマンスの改善を行ったもの。

![https://i.gyazo.com/0e79e316386cc4aadecd412619af06ee.png](https://i.gyazo.com/0e79e316386cc4aadecd412619af06ee.png)

## AlchemyAOとの比較

- 深度バッファのみしか使用しない
    - 法線や位置情報がいらない
    - Depthから復元する
- スケーラブルである
    - オクルージョン半径を増やしたときに負荷がかからない?
    - depthのmipmapを使い範囲によってフェッチ時のmip levelを上げる

## 精度の高い深度バッファが必要

まず、法線や位置情報を高精度に復元するために精度の高いDepth Bufferの作り方が書いてあった
(2.1 High-Precision z Prepass)

- model-view行列を倍精度で計算する
    - host上 = CPU側での事前計算？
- zFarを無限遠んにする
    - 浮動小数点ALU演算が減る
- 左側のベクトルの掛け合わせ
    - よくわからんけどv = vPと左側？の掛け合わせでhalf bit分精度が上がるらしい

## 深度バッファからの復元

![1000.png](/images/Scalable%20Ambient%20Obscurance%2021d63ffca97d4625914f07c74bf87842/1000.png)
![](/images/hoge/1000.png)


【Zd】world space z
c0, c1, c2は Zfar=-∞のとき、(Zn, -1, +1)、それ以外のとき(ZnZf, Zn-Zf, Zf)

【xc, yc】world space position
w: screen resolution w
h: screen resolution h
P: projection matrix
x',y': screen position (texcoord)
zc: x',y' depth

【nc】法線
dFdx dFdyをつかった法線を使うやつ
参考 [レイマーチングの法線をdFdxとdFdyで導出する - Qiita](https://qiita.com/gam0022/items/1878150981494fd66abe)

## 螺旋サンプリングパターン

paperの2.3. Distributed AO Sample Passの後半部分にサンプリングパターンを螺旋状にしたというのと(6),(7)、開始角度のオフセット(8)、mip levelに関わる式が(9), (10)にある。
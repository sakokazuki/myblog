---
title: 球面調和関数(Spherical Harmonics)とCGへの応用
topics: [Math]
type: tech
emoji: 🧊
published: true
---

## 参考リンク集

- [t-pot『テイラー、フーリエ、球面調和関数』](https://t-pot.com/program/88_SH/index.html)
- [☆PROJECT ASURA☆ OpenGL 『球面調和関数(1)』](http://asura.iaigiri.com/OpenGL/gl68.html)
- [3Dグラフィックス・マニアックス(68) 事前計算放射輝度伝搬(PRT)～PRTの基本。静的PRT(3) | マイナビニュース](https://news.mynavi.jp/article/graphics-68/)
- [Spherical Harmonics](http://orlandoaguilar.github.io/sh/spherical/harmonics/irradiance/map/2017/02/12/SphericalHarmonics.html#mjx-eqn-SHBasisEquation)
- [https://graphics.stanford.edu/papers/envmap/envmap.pdf](https://graphics.stanford.edu/papers/envmap/envmap.pdf)
- [https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf)

## 数学的な前提知識

テイラー展開、フーリエ級数展開

[https://www.youtube.com/watch?v=3m3PSyGMrhE](https://www.youtube.com/watch?v=3m3PSyGMrhE)

[https://www.youtube.com/watch?v=HNHb0_mOTYw](https://www.youtube.com/watch?v=HNHb0_mOTYw)

## 球面調和関数の概念

[https://computergraphics.stackexchange.com/questions/4164/what-are-spherical-harmonics-light-probes/4177](https://computergraphics.stackexchange.com/questions/4164/what-are-spherical-harmonics-light-probes/4177)

> That is, while a Fourier transform is a different way of representing a function f(x)f(x), spherical harmonics are the analogous thing for polar functions f(θ,ϕ)f(θ,ϕ).
>

球面調和とはフーリエ変換がf(x)f(x)の近似であることに対して、極関数f(θ,φ)f(θ,φ)の近似である。

球面調和関数でググったときに頻繁に出てくる物体はフーリエ級数展開でsin,cos関数で近似できるというときのsin,cos"関数"と概念で、θとΦの関数はこのぷにぷにの組み合わせて近似できるということである。このぷにぷに関数のことを球面調和関数と呼び、関数をぷにぷにで近似する形に展開することを球面調和関数展開(SH展開)という。

![[https://en.wikipedia.org/wiki/Spherical_harmonics](https://en.wikipedia.org/wiki/Spherical_harmonics) より引用](/images/sh/Spherical_Harmonics.png)

[https://en.wikipedia.org/wiki/Spherical_harmonics](https://en.wikipedia.org/wiki/Spherical_harmonics) より引用

## 展開,展開係数

テイラー展開においてf(x)という複雑な関数があったとき、xに任意の係数を代入して

![image010.gif](/images/sh/image010.gif)

の形のa0,a1..を求めることを展開と呼び、そのときののxを展開係数という。ちなみにテイラー展開を係数0で展開することをマクローリン展開と呼ぶ。

展開と展開係数という概念は他の展開でも変わらず、フーリエ級数展開ではc, sが展開係数である。

![image052.gif](/images/sh/image052.gif)

また、f(x)がわかっている場合のフーリエ級数展開の展開係数は以下によって求まる。

![image070.gif](/images/sh/image070.gif)

![image070.gif](/images/sh/image0701.gif)

このc0, c1, c2.../s0, s1, s2...を任意の項数だけフーリエ級数展開に代入すればxに関する関数として近似値が解ける。

そして、球面調和関数によって展開された関数は以下のようにあらわすことができ(cが展開係数)

![image112.gif](/images/sh/image112.gif)

展開係数c はこのようになる

![image114.gif](/images/sh/image114.gif)

展開型はこっちのほうがよく見るかもしれない。

![1000.png](/images/sh/1000.png)

※数式すべて [https://t-pot.com/program/88_SH/index.html、](https://t-pot.com/program/88_SH/index.html)[http://www.ioa.s.u-tokyo.ac.jp/~kkohno/seminar2/?plugin=attach&refer=H28_KadaiKenkyu&openfile=SphericalHarmonics.pdf](http://www.ioa.s.u-tokyo.ac.jp/~kkohno/seminar2/?plugin=attach&refer=H28_KadaiKenkyu&openfile=SphericalHarmonics.pdf) より引用

## Radiance Mapへの応用(概念編)

[https://graphics.stanford.edu/papers/envmap/envmap.pdf](https://graphics.stanford.edu/papers/envmap/envmap.pdf) のまとめ。式もここから引用

ある場所の法線nの照度は以下のように表すことができる。

![1000.png](/images/sh/10001.png)

L(ω):入射光、n・ω: コサイン項としてそれぞれを半休積分するとn方向を向いているときの放射照度がわかる。

入射光の角度ωは直行座標(x, y, z)でも表せるが(θ, Φ)の球面座標で表すことができる。
なので、入射角ωに対するL, EはLlm, Elmを球面調和関数展開の基底として、以下のように表現できる。

![1000.png](/images/sh/10002.png)

またn・ωも球面座標関数展開系で表すことができるが向きの成分Φは必要ないので常に0とし、n・ω=Aとすると

![1000.png](/images/sh/10003.png)

となる。

(n・ω)はΦ方向を考えなくていいのでΦ=0とした球面調和関数の展開となる。以下の図は

![[http://physics.thick.jp/Physical_Mathematics/Section3/3-21.html](http://physics.thick.jp/Physical_Mathematics/Section3/3-21.html)](/images/sh/10004.png)

[http://physics.thick.jp/Physical_Mathematics/Section3/3-21.html](http://physics.thick.jp/Physical_Mathematics/Section3/3-21.html)

そして突然出てくる以下の式

![1000.png](/images/sh/10005.png)

どうやら[論文](https://cseweb.ucsd.edu/~ravir/papers/invlamb/josa.pdf)によるとElmは(5)のように定義ができるらしい。読んでないので理解していない。

Llm以外の部分を定数に置き換えて

![1000.png](/images/sh/10006.png)

(4)式にもどると以下のような式になる。

![1000.png](/images/sh/10007.png)

これは法線n(x, y, z)=(θ, Φ)の近似関数である。(7)のlを0~∞,ｍを-m~mで加算していけば実際の照度に近づいていく。

(7)の式で、ÂlとYlmは元論文(3),(7)で事前に計算された結果が載っているのでLlmが不定となっているがこれは事前計算することができる。前段で説明した展開,展開係数の式を再度載せる。

(4)のL(θ,Φ)を変換するとLlmは論文式(10)となることは理解できる。

![1000.png](/images/sh/10008.png)

よって、

![1000.png](/images/sh/10009.png)

L(θ, Φ)をキューブマップから得て、Ylm(θ, Φ)の固定値、sinθを積分したものをLlmで事前に計算しておき、シェーディング時に(7)で照度を復元するイメージが湧くのではないか。この計算でこんがらがる部分はYml(θ, Φ)がLlmとE(θ,Φ)の二箇所で出てくるところである。このYml(θ, Φ)を頻繁にSH Basis(基底)などと記述されることが多い。

## Radiance Mapへの応用(実装編)

超省略版

事前準備として任意の場所のキューブマップをキャプチャすることは必要。そしてそれを用いて前段のLlmをキューブマップ事前計算しSH係数として使う。

まずキューブマップと同じサイズに球面調和関数を展開する。

ぷにぷにを

![[https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf)](/images/sh/Spherical_Harmonics1.png)

[https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf)

![[https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf)](/images/sh/100010.png)

[https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf)

撮影したキューブマップの色RGB成分とかけ合わせれば、L00, L1-1, L-10, L10, L2-2, L2-1, L20, L21, L22の9つのLlmがRGBで27準備ができる。

ここまでが事前計算でThree.jsでは[このように記述されている](https://github.com/mrdoob/three.js/blob/d39d82999f0ac5cdd1b4eb9f4aba3f9626f32ab6/examples/js/lights/LightProbeGenerator.js#L5)。

このコードをもう少し細かくしりたくば、[https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf) をちゃんと読む(TODO)。

ちなみに、そのコードでgetBasisAtをしている場所(line79)の関数は[このように](https://github.com/mrdoob/three.js/blob/d39d82999f0ac5cdd1b4eb9f4aba3f9626f32ab6/src/math/SphericalHarmonics3.js#L222)なっており、

```jsx
// band 0
 shBasis[ 0 ] = 0.282095;

 // band 1
 shBasis[ 1 ] = 0.488603 * y;
 shBasis[ 2 ] = 0.488603 * z;
 shBasis[ 3 ] = 0.488603 * x;

 // band 2
 shBasis[ 4 ] = 1.092548 * x * y;
 shBasis[ 5 ] = 1.092548 * y * z;
 shBasis[ 6 ] = 0.315392 * ( 3 * z * z - 1 );
 shBasis[ 7 ] = 1.092548 * x * z;
 shBasis[ 8 ] = 0.546274 * ( x * x - y * y );
```

の0.282095などの数字は[ここ](https://graphics.stanford.edu/papers/envmap/envmap.pdf)の(3)に計算済みの値が載っている

![1000.png](/images/sh/100011.png)

この照度マップの近似をシェーディング時に射影して照度を求めるサンプルがThree.jsにはある。今は前段の概念編でいうところのLlmが求まったので(7)式のようにÂl, Ylm(θ, Φ)をかけて照度を求めようとしている段階。

![1000.png](/images/sh/100012.png)

これはThree.jsのサンプルではLlmをSH係数としてユニフォームでシェーダーに渡して、シェーディング時に照度計算と畳込み(加算)を行っている。

```glsl
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
     // normal is assumed to have unit length
     float x = normal.x, y = normal.y, z = normal.z;
     // band 0

     vec3 result = shCoefficients[ 0 ] * 0.886227;
     // band 1

     result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
     result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
     result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
     // band 2

     result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
     result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
     result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
     result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
     result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
     return result;
 }
```

このコードの0.886227などの数字はYlm * Âlの値である。

![[https://graphics.stanford.edu/papers/envmap/envmap.pdf](https://graphics.stanford.edu/papers/envmap/envmap.pdf)](/images/sh/100013.png)

[https://graphics.stanford.edu/papers/envmap/envmap.pdf](https://graphics.stanford.edu/papers/envmap/envmap.pdf)

例えば、Y00=0.282095、Â0=3.141593なので0.282095*3.141593=0.886227..
自分はこの値が何を指すのか全然理解できなかった。

## 理解していないこと

[https://graphics.stanford.edu/papers/envmap/envmap.pdf](https://graphics.stanford.edu/papers/envmap/envmap.pdf)

において、(7)式の導出

([https://cseweb.ucsd.edu/~ravir/papers/invlamb/josa.pdf](https://cseweb.ucsd.edu/~ravir/papers/invlamb/josa.pdf)を読む)

![1000.png](/images/sh/100014.png)

[https://www.ppsloan.org/publications/StupidSH36.pdf](https://www.ppsloan.org/publications/StupidSH36.pdf)

で示されている球面調和関数をキューブマップに投影する方法。具体的にはThree.jsの[この](https://github.com/mrdoob/three.js/blob/d39d82999f0ac5cdd1b4eb9f4aba3f9626f32ab6/examples/js/lights/LightProbeGenerator.js#L5)関数について、目的は理解しているが実装の中身の詳細は理解していない。
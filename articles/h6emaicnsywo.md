---
title: ぷにぷにシェーダー【GLSL】
topics: [GLSL,Shader,Web] 
type: tech
emoji: 💛
published: true
---
マウスでカーソルをあてるとぷにっとするのをやりたいと言われて実験的にやってみたときのやつ。
下記のリンクを見てもらうのが早そう

![](https://paper-attachments.dropbox.com/s_F45C885B615191A52EF0AD1A464C28F219D7D0E509CAF1EEBBBC13EA6058C814_1579929144112_2020-01-25_14-12-10.png)


http://glslsandbox.com/e?#59040.0


## どうやって実現しているか

こんかい実装してみたのはかなり簡易的なもので情報が多いシーンだったりすると破綻するかもしれない。GLSLで後処理で歪ます方法。

この7行がポイント



````glsl
vec2 position = gl_FragCoord.xy / resolution.xy;
vec2 diff = mouse - position;
diff*=10.0;
float dist =  1.0 - distance(mouse, position);
dist = pow(dist, 10.0);
diff*=dist;
gl_FragColor = vec4(diff.x, diff.y, 0.0, 1.0);

````


**1~3行目まで**

- マウスからの距離を求めたい
- positionがx: 0-1, y: 0-1のuvになっていて
- mouseとの距離をdiffという変数に入れる
- 10(任意の強度)をかける
- そうするとしたのような距離画像ができる


![](https://paper-attachments.dropbox.com/s_F45C885B615191A52EF0AD1A464C28F219D7D0E509CAF1EEBBBC13EA6058C814_1579928976876_2020-01-25_14-08-37.png)


http://glslsandbox.com/e#60823.0

**4~5行目**

- 座標をずらす部分のマスク画像をつくる
- 4,5行目のdistという変数のみを出力してみたのが以下
- 赤い部分が強いところが1遠くに向かって0に近づく
- 10はマスクの広さ加減とか減衰を調整する


![](https://paper-attachments.dropbox.com/s_F45C885B615191A52EF0AD1A464C28F219D7D0E509CAF1EEBBBC13EA6058C814_1579929455906_2020-01-25_14-16-05.png)


http://glslsandbox.com/e#60824.0

**6~7行目**

- 6行目で1~3行目で作成したマウスからの距離マップにマスク値をかけてマウスから遠い部分は0にしている
- 7行目は出力のテスト
- 外側に向かって黒色に減衰していくのがわかる


![](https://paper-attachments.dropbox.com/s_F45C885B615191A52EF0AD1A464C28F219D7D0E509CAF1EEBBBC13EA6058C814_1579929703719_2020-01-25_14-21-22.png)


http://glslsandbox.com/e#60825.0

**UVずらす**
GLSLの`texture2d(image, uv);`のようなコードのuvにここまでで出た値を足せばマウスを中心に外側へUV座標がずれていく表現ができる。このuvフィルタによってマウスの中心周りのみ歪みが発生してぷにぷにしてるかのような表現になる

これは試しに近くにあったペンギンをフォークしてフィルタ当てたもの。簡単に実装したわりに意外とそれっぽくなっているのではなかろうか。このシーンでわかったのは縁にマウスをもっていくとなぞの円形マスクが生じるのでこれは何らかの方法で解決しなくてはいけないが、実験なのでいつか使うことになったらやろうと思う

![](https://paper-attachments.dropbox.com/s_F45C885B615191A52EF0AD1A464C28F219D7D0E509CAF1EEBBBC13EA6058C814_1579929981008_2020-01-25_14-26-09.png)


http://glslsandbox.com/e#59041.0



---
title: MetalのGPU処理負荷計測について(CPUについても軽く触れる)
date: 2020-8-3
meta:
  - name: description
    content: MetalのGPU処理負荷計測について(CPUについても軽く触れる)まず、CPUに関しての処理負荷計測は概ね以下のページを見ればできた。
  - name: keywords
    content: Metal,GraphicsPrograming
  - name: og:title
    content: MetalのGPU処理負荷計測について(CPUについても軽く触れる)
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: https://paper-attachments.dropbox.com/s_942E4D3B3B068B71EC63C5F83B949BABCC7A62B38BC5411181D9564C087C0B72_1596460271917_+2020-08-03+22.10.43.png
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [Metal,GraphicsPrograming] 
type: tech
emoji: 💛
published: true
---
まず、CPUに関しての処理負荷計測は概ね以下のページを見ればできた。
[【Unity】XCodeでCPUの処理負荷を計測する](https://light11.hatenadiary.com/entry/2019/10/20/032721)

ここに書いていないことで知っている便利なことは

- CallTreeをクリックしてHide Systemなんちゃら〜みたいなのをクリックすると自分が書いたコードのみにしぼることができる
- option押しながら改装を開くと一気に開ける

くらいかないまのところ


GPUについては実行中に下の方のカメラマークを押せばそのままキャプチャできる
※Edit Scheme… → option → GPU Frame CaptureをAutoかMetalに設定されていなければする
※アイコンがグレーアウトして押せないというときがあるのでそのときはxcodeを再起動したりデバイスを再接続しているとできるようになったりする。謎。
※シュミレーターでは動作しない

キャプチャができると以下のようになる。
今回はAppleの[DeferredLightingのサンプル](https://developer.apple.com/documentation/metal/rendering_a_scene_with_deferred_lighting)をキャプチャしてみた。


![](https://paper-attachments.dropbox.com/s_942E4D3B3B068B71EC63C5F83B949BABCC7A62B38BC5411181D9564C087C0B72_1596460271917_+2020-08-03+22.10.43.png)


この画像で一番処理負荷が高そうなDraw Point Lights(1.29ms)のところを詳しくみてみる。
もしかしたら%で表示されるかもしれないので切り替えは右クリック→show performace as timeで切り替える。

更にグループを展開して、drawIndexedPrimitivesを選択するとおそらくBounds Resourcesが表示される。画像の部分あたりのBounds Resourcesを左クリックすると別のカテゴリの表示ができるのでPerformanceをみてみる。


![](https://paper-attachments.dropbox.com/s_942E4D3B3B068B71EC63C5F83B949BABCC7A62B38BC5411181D9564C087C0B72_1596460755364_+2020-08-03+22.15.21.png)


 
Performanceを開くと、fragment shaderのtimeが66%もしめていることがわかる。fragment shaderの小さい矢印の部分(赤でかこった囲った部分)をクリックするとシェーダーのコードが開き行ごとにどのくらいの処理がかかっているかどうかが確認できる。

![](https://paper-attachments.dropbox.com/s_942E4D3B3B068B71EC63C5F83B949BABCC7A62B38BC5411181D9564C087C0B72_1596461639457_+2020-08-03+22.18.38.png)


オフラインでビルドされたシェーダーを使っている場合はxcrunのmetalのビルドにオプションで'-gline-tables-only' と'-MO’をつけてビルドしないと使えない。(If building with the 'metal' command line tool, add the options '-gline-tables-only' and '-MO' to your compilation step.というメッセージがでるはず)また、ビルドターゲットのOSが実機より低いとシェーダーは開くが%が表示されない。(これも上部にそういう感じのメッセージがでる)


![](https://paper-attachments.dropbox.com/s_942E4D3B3B068B71EC63C5F83B949BABCC7A62B38BC5411181D9564C087C0B72_1596461725071_+2020-08-03+22.22.21.png)


こうして無事にどこの行がボトルネックになっているかを確認することができる。

あとは他の手段として、Xcode → Open Developer tool → InstrumentsにMetal GPU Traceというものがありそれでも色々調査できるのだがまだきちんと使いこなせていないので便利な使い方が見つかればまた書く。
とりあえず公式のドキュメントをメモ↓
https://developer.apple.com/documentation/metal/using_metal_system_trace_in_instruments_to_profile_your_app


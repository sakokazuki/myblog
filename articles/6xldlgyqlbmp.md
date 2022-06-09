---
title: Three.js(WebGL)のパフォーマンス計測方法など
topics: [WebGL,Three.js]
type: tech
emoji: 📝
published: true
---

![](https://paper-attachments.dropbox.com/s_051486872875E3ED94037AEC88DB9C5A69FAA348E197C621BCEB05084CB2A532_1593163062849_2020-06-26_17-57-22.png)


今まであまり意識してこなかったが、WebGLコンテンツのパフォーマンスモニタリングやデバッグはどうすればいいのか調べてみたら以外にも色々整っていたのでメモ。

## Three.js Developer Tools

https://chrome.google.com/webstore/detail/threejs-developer-tools/ebpnegggocnnhleeicgljbedjkganaek?hl=en

これはThree.jsの[リポジトリにも掲載されている](https://github.com/threejs/three-devtools)のでオフィシャル感のあるツール。ステータスがExperimentalになっているが、一応使えた。分かりづらいが以下の画像のようにマテリアルの色を直接変更することができたりする。(トップの画像と比べると机の色が赤くなっている)


![](https://paper-attachments.dropbox.com/s_051486872875E3ED94037AEC88DB9C5A69FAA348E197C621BCEB05084CB2A532_1593163332719_2020-06-26_18-01-58.png)


他にも、現在のDrawCall、頂点数などを表示する画面、シーン内のテクスチャやジオメトリが確認できる機能などがありかなり使えるツールとなっている。fbxやgltfローダーでインポートしたシーンにどんなマテリアルが使われているかとか確認したいときに使える。


## Spector.js

https://chrome.google.com/webstore/detail/spectorjs/denbgaamihkadbghdceggmchnflmhpmk?hl=en

![](https://paper-attachments.dropbox.com/s_051486872875E3ED94037AEC88DB9C5A69FAA348E197C621BCEB05084CB2A532_1593163788264_2020-06-26_18-03-40.png)


これは任意のフレームをキャプチャするツールで[Babylon.js](https://github.com/BabylonJS/Babylon.js)のために作られたそうだがWebGL全般に使える(多分)。グラフィックスの開発においてキャプチャツールがあるとかなりデバッグが容易になるがChromeの拡張機能でキャプチャができるのはかなり便利だと思った。

画像の左の一番上のパスはシャドウマップのためのフレームバッファを撮っているな～というところ。Three.jsなどのフレームワークは基本的にこういった影などのためのレンダーパスはフレームワーク内部で行っているのでこういうツールをつかうとちゃんとレンダーパスごとの処理が追えていいと思う。

ちなみにWebGLってRenderDocでもキャプチャできるらしい
参考) https://qiita.com/ukonpower/items/134bdf0c7ebde2a5d547

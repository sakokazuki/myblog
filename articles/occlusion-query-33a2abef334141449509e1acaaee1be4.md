---
title: オクルージョンクエリとPrediactedRendering
topics: [cg]
type: tech
emoji: 🔍
published: true
---


出てくる用語はD3D12で使われている意味のままという想定。

ID3D12CommandListには[SetPredication](https://docs.microsoft.com/en-us/windows/win32/api/d3d12/nf-d3d12-id3d12graphicscommandlist-setpredication)という関数があり、第一引数のバッファを、第三引数の`D3D12_PREDICATION_OP`に従って評価しtrueならレンダリングをスキップするという機能がある。

bufferが`0`、OPが`EQUAL_ZERO`の場合はtrueになるので以降のレンダリングを省略することができる。(当然、OPが`NOT_EAQUAL_ZERO`ならばfalseなので描画がされる。)

これの使いみちとしてクエリを利用したオクルージョンカリングなどがある。[D3D12 SampleのQuery](https://docs.microsoft.com/en-us/windows/win32/direct3d12/predication-queries)で実例を見ることができる。

オブジェクトが遮蔽されているかいないかを動的にバッファに格納し、次のレンダーパスで描画するかどうかを決めている。

サンプルに使われている[D3D12_QUERY_TYPE](https://docs.microsoft.com/en-us/windows/win32/api/d3d12/ne-d3d12-d3d12_query_type)の`D3D12_QUERY_TYPE_OCCLUSION`は全部が遮蔽されていたら0、どこか一つでも見えていたら1を設定する。

したがってSetPredicationのOP`EQUAL_ZEOR`と組み合わせると全部遮蔽されている(buffer=0)のときに描画がスキップされるという挙動になる。

ちなみに、vulkanやmetalで同様のことをやるには以下をみるとわかりやすい。

[https://github.com/gpuweb/gpuweb/issues/551](https://github.com/gpuweb/gpuweb/issues/551)

metalだけSetPredicationにあたるAPIがなくIndirectDrawなど他の方法で実現しなければならなくマルチプラットフォームAPIを書くときは注意が必要。
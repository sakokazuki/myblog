---
title: Direct3D 12のsample 「ExecuteIndirect」を読む
topics: [Direct3D,DirectXDirect3D12,ExecuteIndirect]
type: tech
emoji: 🧊
published: true
---
半年前のメモを頼りにDirect3D 12のExecuteIndirectのサンプルを読んだ話を書きます。
Sampleはこれ。https://github.com/microsoft/DirectX-Graphics-Samples/tree/master/Samples/Desktop/D3D12ExecuteIndirect


## サンプルの説明

サンプルを見るとスペースキーでマスク？のON/OFFの変更をしている。


![](https://paper-attachments.dropbox.com/s_F54D234B07E4DD84FCF58A3D65EF6EE988E0D6CF7E2A1E7A728CC0E7B3615774_1596866707234_2020-08-08_14-59-37.png)

![](https://paper-attachments.dropbox.com/s_F54D234B07E4DD84FCF58A3D65EF6EE988E0D6CF7E2A1E7A728CC0E7B3615774_1596866710492_2020-08-08_15-00-21.png)


先ほどマスク？と言ったが正確にはカリングというべきか、このサンプルでは

- コンピュートシェーダーによって描画する範囲内のオブジェクトを絞り
- 絞られた数のメッシュのみを描画することによって
- 全部描画するよりもコストを抑えることができる

という趣旨のサンプルである。


## ExecuteIndirectの説明

まずはコンピュートシェーダーの内容を理解する前にExecuteIndirectとはいったいなんぞやという説明から入らないといけない。

ExecuteIndirectは以下のような引数を持っている



````cpp
void ExecuteIndirect(
  ID3D12CommandSignature *pCommandSignature,
  UINT                   MaxCommandCount,
  ID3D12Resource         *pArgumentBuffer,
  UINT64                 ArgumentBufferOffset,
  ID3D12Resource         *pCountBuffer,
  UINT64                 CountBufferOffset
);

````

pCommandSignature: 後述(RootSignatureみたいなもの)
MaxCommandCount: 引数バッファの中のコマンドの数
pArgumentBuffer: 引数(以下で解説)
ArgumentBufferOffset: ArgumentBufferのバッファ内のオフセット
pCountBuffer: 引数バッファの中のコマンドの数(これがnullの場合はMaxCommandCountが使われる)
CountBufferOffset: CountBufferのバッファ内のオフセット

一番重要なポイントはpArgumentBufferで、ここには通常の描画(DrawInstanced)の引数に使われる値が格納される。つまり下部の図のようにデータが並んでいることになる。図のコマンドバッファを引数にセットし、MaxCommandCountを2、CommandSignatureは後述するとして、それ以外を0およびnullptrで指定すると三角形が2つ描画されることになる。


| index | VertexCountPerInstance | InstanceCount | StartVertexLocation | StartInstanceLocation |
| ----- | ---------------------- | ------------- | ------------------- | --------------------- |
| 0     | 3                      | 1             | 0                   | 0                     |
| 1     | 3                      | 1             | 0                   | 0                     |


このサンプルの例だと、463行目のこの部分でArgumentBufferの中身を設定している。先ほどの図とはことなり、各コマンドの先頭のバッファはConstantBufferのアドレスを指定している。これは各コマンドでの描画で使用する定数バッファもArgumentBufferに格納しなければいけないためである。



````cpp
for (UINT frame = 0; frame < FrameCount; frame++)
{
    for (UINT n = 0; n < TriangleCount; n++)
    {
        commands[commandIndex].cbv = gpuAddress;
        commands[commandIndex].drawArguments.VertexCountPerInstance = 3;
        commands[commandIndex].drawArguments.InstanceCount = 1;
        commands[commandIndex].drawArguments.StartVertexLocation = 0;
        commands[commandIndex].drawArguments.StartInstanceLocation = 0;

        commandIndex++;
        gpuAddress += sizeof(SceneConstantBuffer);
    }
}

````

このサンプルの描画に使う定数バッファは以下のようにhlsl内で定義されている



````hlsl
cbuffer SceneConstantBuffer : register(b0)
{
    float4 velocity;
    float4 offset;
    float4 color;
    float4x4 projection;
};

````

なので先ほどの図をサンプルに合わせて作り直すと以下のようにすべての三角形分のコマンド引数が並んで格納されている

| index         | 定数バッファ           | VertexCountPerInstance | InstanceCount | StartVertexLocation | StartInstanceLocation |
| ------------- | ---------------- | ---------------------- | ------------- | ------------------- | --------------------- |
| 0             | 0x************** | 3                      | 1             | 0                   | 0                     |
| 1             | 0x************** | 3                      | 1             | 0                   | 0                     |
| 2             | 0x************** | 3                      | 1             | 0                   | 0                     |
| x             | 0x************** | 3                      | 1             | 0                   | 0                     |
| TriangleCount | 0x************** | 3                      | 1             | 0                   | 0                     |


ここまでを整理すると**ExecuteIndirectとは描画コマンドの引数をメモリにあらかじめ入れておいてその値を使って描画するというテクニックである**といえる。

そして疑問になるのは、今回は定数バッファは先頭においたが別に末尾でもいいし使う人によってバッファの中身が異なるのをどうやって解決するのかという問題である。

そのために第一引数のCommandSignatureというものがある。
実際に作成している部分のコードをみるのが一番早いので見てみよう。(418行目)



````cpp
// Create the command signature used for indirect drawing.
{
    // Each command consists of a CBV update and a DrawInstanced call.
    D3D12_INDIRECT_ARGUMENT_DESC argumentDescs[2] = {};
    argumentDescs[0].Type = D3D12_INDIRECT_ARGUMENT_TYPE_CONSTANT_BUFFER_VIEW;
    argumentDescs[0].ConstantBufferView.RootParameterIndex = Cbv;
    argumentDescs[1].Type = D3D12_INDIRECT_ARGUMENT_TYPE_DRAW;

    D3D12_COMMAND_SIGNATURE_DESC commandSignatureDesc = {};
    commandSignatureDesc.pArgumentDescs = argumentDescs;
    commandSignatureDesc.NumArgumentDescs = _countof(argumentDescs);
    commandSignatureDesc.ByteStride = sizeof(IndirectCommand);

    ThrowIfFailed(m_device->CreateCommandSignature(&commandSignatureDesc, m_rootSignature.Get(), IID_PPV_ARGS(&m_commandSignature)));
    NAME_D3D12_OBJECT(m_commandSignature);
}

````

まずこのコード内に存在していないものとしてRootSignatureがあるがこれは通常描画時とおなじ。そしてD3D12_INDiRECT_ARGUMENT_DESCというものがあるがこれが先ほどの引数バッファの中身をGPUにどうやって解釈させるのかを指定するようなオブジェクトである。みればわかるが0にCBVを、1
にINDIRECT_ARGUMENTを設定してそれを使ってCommandSignatureを作成している。
ちなみにD3D12_INDIRECT_ARGUMENT_TYPE_DRAWだが、これはDrawInstancedに相当する引数だよってことで、ほかにもDrawIndexedInstancedに相当するD3D12_INDIRECT_ARGUMENT_TYPE_DRAW_INDEXEDなどがある。

ここまででほとんどExecuteIndirectの説明は終わったが最後に第5引数のpCountBufferについて触れる。これは名前のとおりコマンドの数が格納されているバッファであるが、指定しないと第2引数のMaxCommandCountが使われ、指定があると指定したバッファの値を使うことになる。

今回のサンプルだとカリングが有効の時に使用しているが、若干混乱するのがpArgumentBufferと同じバッファを使用していることである。よくコードを読めばわかるがArgumentBuffer用のバッファオブジェクトのサイズが(ArgumentBufferのサイズ) + (UINT)となっておりバッファの一番最後にCommandCountを設定するための分が確保されており、第6引数のオフセットを使って同じバッファ内の一番最後の値を使うように設定されているのである。

思ったより長くなってしまったがExecuteIndirect命令とは

- 描画に使う引数をあらかじめメモリ上に保存しておける
- メモリのレイアウトなどはコマンドシグネチャを使って設定する
- コマンドカウントもメモリ上に保存して保存できる

というものである。

このメモリ上の値を使って描画ができるというのがミソでこのサンプルはこの機能をうまく使って範囲外のオブジェクトをカリングをしている。詳しくはこれ以降のセクションで説明をする。


## コンピュート処理について

先ほどあらかじめ指定したメモリに格納された値を使って描画するのがIndirectExecuteという話をしたが、単純にCPU側であらかじめ用意したものを使って描画しても通常の描画となにも変わりがなく、まさにこのサンプルのスペースキーで切り替えた全部描画しているモードはまさにあらかじめ初期化時に用意したバッファを使って描画をしている。

では、どういた場合にこの機能を有効に使うかというとこのサンプルでは**ComputeShaderを用いてArgumentBufferをGPU側で用意し、用意されたものを使ってメッシュを描画する**という例を提示している。

①**メッシュ描画時に使う定数バッファのためのリソースの作成**
372行目あたりからオブジェクトの数*FrameCount分の描画時に使う定数バッファを作成している。これには個別の三角形の位置や色などの情報が入っている。更新は592行目のOnUpdateで毎フレーム行っている

②**オブジェクト数のコマンドを格納したリソースの作成**
記事が長くなるので(面倒なので)コードは載せないがサンプルコードの439行目あたりからオブジェクトの数 x 引数バッファのサイズ x FrameCount分のリソースを確保している。
先述のとおり初期値をバッファにコピーしてある。
このリソースをpArgumentBufferとして描画したのが全部描画されているモードである。

③**ComputeShaderで更新されるリソースの作成**

これは507行目あたりで作成される。CommandBufferCounterOffsetという変数はオブジェクトの数 x引数バッファのサイズをUAV用にアライメントされた数である。またバッファのサイズを指定する部分で(CommandBufferCounterOffset + sizeof(UINT)となっているのが先述のとおりリソースの一番最後にコマンドの数が入る分だけ多くリソースを確保している。


④**カリングに使う情報を含んだ定数バッファ用のリソースの作成**

35行目あたりでコンピュートシェーダーの処理に定数バッファとして使う小さいサイズのバッファを作成している。これはスクリーンのどの部分がカリングされる範囲かなどの固定のパラメーター。サンプルとしてのわかりやすさを優先するならComputeShader内で定数にしてしまってもよかったのでは？とも思う。

**以上のリソースを使ったコンピュートシェーダーの処理について**
コンピュートシェーダーでは以下のようなことが行われている


- ①と②をSRV、③をUAVとしてシェーダーに渡す
- ①の各メッシュの位置情報と④の描画範囲を比較して中に入っているかどうかをチェック
- 中に入っているものを③のリソースにコマンドを追加する
- [UAVカウンター](https://docs.microsoft.com/ja-jp/windows/win32/direct3d12/uav-counters)を使ってAppendすると末尾の値が更新される
[](https://docs.microsoft.com/ja-jp/windows/win32/direct3d12/uav-counters)
①と②のリソースがindexでアクセスしたときにそれぞれ対応するようになっているのでまずはポジションから描画する/しないを決定してその時のバッファを別のバッファに格納しなおしている。また、Append命令を使うとリソースの指定した箇所にAppendした数をGPUで書き込むことができる

簡易図で表すと以下のようになる

x: -0.5~0.5のみ描画するとして…

| index | ①定数バッファリソース | ②コマンドリソース          | 描画する  |
| ----- | ----------- | ------------------ | ----- |
| 0     | (0,0,0)     | (cbv0, 3, 1, 0, 0) | true  |
| 1     | (-1,0,0)    | (cbv1, 3, 1, 0, 0) | false |
| 2     | (0.4,0,0)   | (cbv2, 3, 1, 0, 0) | true  |
| 3     | (-0.3,0,0)  | (cbv3, 3, 1, 0, 0) | true  |
| 4     | (0.8,0,0)   | (cbv4, 3, 1, 0, 0) | false |
| 5     | (-0.6,0,0)  | (cbv5, 3, 1, 0, 0) | false |

描画するものだけをUAVにAppendすると..

| index | ③UAVのコマンドリソース      |
| ----- | ------------------ |
| 0     | (cbv0, 3, 1, 0, 0) |
| 1     | (cbv2, 3, 1, 0, 0) |
| 2     | (cbv3, 3, 1, 0, 0) |

となり、最終的に隠れるオブジェクトを描画するのをやめてDrallCallを6→3に減らすことできる。


## 描画処理について

描画処理についてはほとんど触れることがないが、先ほどのコンピュート処理で用意したリソースをpArgumentBufferに指定し、pCountBufferも同じリソースを使い、オフセットを指定する。(750行目)

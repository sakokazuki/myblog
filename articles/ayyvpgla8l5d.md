---
title: DirectX12のDescriptorHeapとかRootSignatureとかその周辺のメモ
date: 2020-8-2
meta:
  - name: description
    content: DirectX12のDescriptorHeapとかRootSignatureとかその周辺のメモ個人的にDirectX12で理解を中途半端にしがちで未だ苦手意識のあるDescriptorHeapについて整理してみた。完全に理解しているわけではないので間違っていることもあるかもしれないが初学者が少しだけ理解に近づくには読む価値もあるかもしれない。
  - name: keywords
    content: DirectX,Direct3D12,GraphicsPrograming
  - name: og:title
    content: DirectX12のDescriptorHeapとかRootSignatureとかその周辺のメモ
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: https://paper-attachments.dropbox.com/s_32319F47CA7AF04C280992A0A69DEE54F609EFB857CBDA68FB253DDCB1E87908_1596379456631_+1-100.jpg
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [DirectX,Direct3D12,GraphicsPrograming] 
type: tech
emoji: 💛
---
個人的にDirectX12で理解を中途半端にしがちで未だ苦手意識のあるDescriptorHeapについて整理してみた。完全に理解しているわけではないので間違っていることもあるかもしれないが初学者が少しだけ理解に近づくには読む価値もあるかもしれない。


## そもそもDescriptorって

DescriptorHeapとはDescriptorをまとめるヒープということは名前から察しがつくが、Descriptorとは一体なんのために用意するものなのかを頭の片隅においておかなければならない。

まず、何らかのシリソース(テクスチャや定数バッファなど)がメモリ上に存在するとして、シェーダーステージ上でそこのメモリを参照する際にGPU側からみるとこのリソースが何を指しているのかがわからないらしい(どんな種類だとかフォーマットとかそういった情報)。そこでDescriptorを使い、これはテクスチャだとか定数バッファだとかを認識できるようにするらしい。


## Descriptorの種類とかDescriptorHeapとか

Descriptorは以下の5つの種類があり、おなじヒープに別の種類のDescriptorを格納することはできない。
(引用: https://docs.microsoft.com/ja-jp/windows/win32/direct3d12/creating-descriptor-heaps)



````cpp
typedef enum D3D12_DESCRIPTOR_HEAP_TYPE
{
    D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV,    // Constant buffer/Shader resource/Unordered access views
    D3D12_DESCRIPTOR_HEAP_TYPE_SAMPLER,        // Samplers
    D3D12_DESCRIPTOR_HEAP_TYPE_RTV,            // Render target view
    D3D12_DESCRIPTOR_HEAP_TYPE_DSV,            // Depth stencil view
    D3D12_DESCRIPTOR_HEAP_TYPE_NUM_TYPES       // Simply the number of descriptor heap types
} D3D12_DESCRIPTOR_HEAP_TYPE;

````

例えば、レンダーターゲット用のテクスチャリソースが2つあるとして、typeを_RTV、サイズを2としたDescriptorHeapを作成する。
そしてID3D12CreateRenderTargetView関数で、リソースとD3D12_RENDER_TARGET_VIEW_DESCとDescriptorHeapのなかのオフセットされたメモリ位置にDescriptor(RenderTargetView)を作成してコピーする。
RTVじゃないときはID3D12CreateConstantBufferViewなどそれぞれのタイプの関数がD3D12Deviceにあったはず、、

## DescriptorTable

DescriptorHeapをセットしただけではリソースがシェーダーのどこにバインドされるかという情報が欠けている。それを指定するのがDescriptorTable。1つにつき1つのDescriptorHeapのバインドを指定することができる。DescriptorTable内にRangeという名前のオブジェクトを持ち、１つ目のRangeにb0とDescriptorHeapの先頭のDescriptorバインド、2つめのRangeにDescriptorHeap内の別のDescriptorをバインドといった指定をする。


## RootSignature

作成したDescriptorHeapはRootSignatureのRootParameterの**1種**として指定しておかなければならない。1種というのは他にもRootPrameterとして指定できるものがあるということで、他に32bit定数やCBV,SRV,UAVを指定することができる。SamplerもStaticSamplerとしてRootSignatureに設定することができるがそのあたりは割愛。

ここまでの参考: [DirectXの話 第145回](https://sites.google.com/site/monshonosuana/directxno-hanashi-1/directx-145)



## 具体例

上記の説明ではおそらく自分ですらも理解できないので具体例を用いてもう少し細かく見ていきたい。
リソース数が少なく、あまり説明するのに適した例ではないが自分であたらしくサンプルを書くのも面倒なので、DirectX Graphic ExampleのHelloTextureを例にみてみる。

主に以下のコードに使われているDescriptorHeap周りを紐解いていく。
https://github.com/microsoft/DirectX-Graphics-Samples/blob/v10.0.19041.0/Samples/Desktop/D3D12HelloWorld/src/HelloTexture/D3D12HelloTexture.cpp

とりあえずやりたいこととしては以下のざっくりした図のようにテクスチャとシェーダーのレジスタb0を紐付けるようなことがしたい。
それをするためだけにDescriptorやらDescriptorHeapやらDescriptorTableやらRootSignature等が必要になってしまうのだ。


![](https://paper-attachments.dropbox.com/s_32319F47CA7AF04C280992A0A69DEE54F609EFB857CBDA68FB253DDCB1E87908_1596379456631_+1-100.jpg)


**ディスクリプタヒープの作成**
サンプルの109行目からの以下のコードでレンダーターゲット用のディスクリプタヒープとシェーダーリソース用のディスクリプタヒープを作成している。



````cpp
// Create descriptor heaps.
{
    // Describe and create a render target view (RTV) descriptor heap.
    D3D12_DESCRIPTOR_HEAP_DESC rtvHeapDesc = {};
    rtvHeapDesc.NumDescriptors = FrameCount;
    rtvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_RTV;
    rtvHeapDesc.Flags = D3D12_DESCRIPTOR_HEAP_FLAG_NONE;
    ThrowIfFailed(m_device->CreateDescriptorHeap(&rtvHeapDesc, IID_PPV_ARGS(&m_rtvHeap)));

    // Describe and create a shader resource view (SRV) heap for the texture.
    D3D12_DESCRIPTOR_HEAP_DESC srvHeapDesc = {};
    srvHeapDesc.NumDescriptors = 1;
    srvHeapDesc.Type = D3D12_DESCRIPTOR_HEAP_TYPE_CBV_SRV_UAV;
    srvHeapDesc.Flags = D3D12_DESCRIPTOR_HEAP_FLAG_SHADER_VISIBLE;
    ThrowIfFailed(m_device->CreateDescriptorHeap(&srvHeapDesc, IID_PPV_ARGS(&m_srvHeap)));

    m_rtvDescriptorSize = m_device->GetDescriptorHandleIncrementSize(D3D12_DESCRIPTOR_HEAP_TYPE_RTV);
}

````

ディスクリプタヒープには中に格納するディスクリプタの数(.NumDescriptors)とディスクリプタの種類(.Type)とフラグ(.Flags)を設定する。

ここではRenderTargetのためのディスクリプタヒープとCBV,SRV,UAVのためのディスクリプタヒープを作成している。

**テクスチャの作成とディスクリプタ**
まずは肝心のテクスチャそのものをメモリに確保する必要がある。275~350行目あたりまでがテクスチャリソースを確保してデータをコピーして、、みたいなコードになっている。

その中の320行目の以下のコードに注目すると、ここでディスクリプタを作成しディスクリプタテーブルのハンドルと紐付けているのがわかる。自分はディスクリプタ=XXX_View(ShaderResourceViewなど)という認識でいるのだが厳密には違うかもしれない。




````cpp
// Describe and create a SRV for the texture.
D3D12_SHADER_RESOURCE_VIEW_DESC srvDesc = {};
srvDesc.Shader4ComponentMapping = D3D12_DEFAULT_SHADER_4_COMPONENT_MAPPING;
srvDesc.Format = textureDesc.Format;
srvDesc.ViewDimension = D3D12_SRV_DIMENSION_TEXTURE2D;
srvDesc.Texture2D.MipLevels = 1;
m_device->CreateShaderResourceView(m_texture.Get(), &srvDesc, m_srvHeap->GetCPUDescriptorHandleForHeapStart());


````

図示するとこのような状態になっている。


![](https://paper-attachments.dropbox.com/s_32319F47CA7AF04C280992A0A69DEE54F609EFB857CBDA68FB253DDCB1E87908_1596379467703_+2-100.jpg)


**ディスクリプタヒープをコマンドリストにセット**

作成したディスクリプタヒープはサンプルの435行目のようにコマンドリストにセットする。SetDescriptorHeapsはコマンドリストに使うヒープを登録するのだなと思うが、SetGraphicsRootDescriptorTableって何となるのでそのへんはこれからディスクリプタヒープを設定して登録するだけではまだ当初の目標のb0と紐付けるというのを達成できていない。
とりあえずRootParameterIndex(第一引数)に0とディスクリプタヒープのハンドルを設定するということだけ頭において次のRootSignature周りを見ていく。



````cpp
ID3D12DescriptorHeap* ppHeaps[] = { m_srvHeap.Get() };
m_commandList->SetDescriptorHeaps(_countof(ppHeaps), ppHeaps);

m_commandList->SetGraphicsRootDescriptorTable(0, m_srvHeap->GetGPUDescriptorHandleForHeapStart());

````

**RootSignatureとかRootParameterとか**

ここのパートではサンプルの159行目あたりに注目する

ディスクリプタヒープの中のディスクリプタとシェーダーのディスクリプタを紐付けるためにCD3DX12_DESCRIPTOR_RANGE1という構造体が存在する。これから作成するRootSignatureのためにまずはディスクリプタのタイプ/数やレジスタの番号の情報を持った構造体である。
ディスクリプタテーブルという名前で呼ばれることもある(気がする)。



````cpp
CD3DX12_DESCRIPTOR_RANGE1 ranges[1];
        ranges[0].Init(D3D12_DESCRIPTOR_RANGE_TYPE_SRV, 1, 0, 0, D3D12_DESCRIPTOR_RANGE_FLAG_DATA_STATIC);

````

<d3dx12.h>

    CD3DX12_DESCRIPTOR_RANGE1(
        D3D12_DESCRIPTOR_RANGE_TYPE rangeType,
        UINT numDescriptors,
        UINT baseShaderRegister,
        UINT registerSpace = 0,
        D3D12_DESCRIPTOR_RANGE_FLAGS flags = D3D12_DESCRIPTOR_RANGE_FLAG_NONE,
        UINT offsetInDescriptorsFromTableStart =
        D3D12_DESCRIPTOR_RANGE_OFFSET_APPEND)
    {
        Init(rangeType, numDescriptors, baseShaderRegister, registerSpace, flags, offsetInDescriptorsFromTableStart);
    }

それからRangeを使用してRootParameterという構造体を作成する。配列になっていて今回はRootParameterのインデックス0にDescriptorTable(さっき作成したRange)を指定する。

InitAsDescriptorTable以外にもInitAsConstansという、ディスクリプタを指定するではなく直接リソースメモリを紐付けるみたいな役割もあるが今回は説明を割愛。

とりあえずRootParameterの配列内にはDescriptorTableがいくつか指定されたりする。



````cpp
CD3DX12_ROOT_PARAMETER1 rootParameters[1];
rootParameters[0].InitAsDescriptorTable(1, &ranges[0], D3D12_SHADER_VISIBILITY_PIXEL);

````

<d3dx12.h>

    inline void InitAsDescriptorTable(
    UINT numDescriptorRanges,
    _In_reads_(numDescriptorRanges) const D3D12_DESCRIPTOR_RANGE1* pDescriptorRanges,
    D3D12_SHADER_VISIBILITY visibility = D3D12_SHADER_VISIBILITY_ALL)
    {
    InitAsDescriptorTable(*this, numDescriptorRanges, pDescriptorRanges, visibility);
    }
        


ここで思い出したいのが、一つ前のパートでSetGraphicsRootDescriptorTableでRootParameterIndexの0にディスクリプタヒープを指定するというコマンドを積んだことである。

今作成したRootParameterのIndex0はシェーダーのレジスタ0にディスクリプタが1つあるという情報を持ったDescriptorTableなので、これでレジスタとリソースの関連付けが解決されたことになる。

あとはRootParameterを使ってRootSignatureを作成し、RootSignature経由でRootParameterが設定されRootParameterとRootParameterIndexでセットされた情報をもとにシェーダー側がb0に使うリソースを探しに行くのだと思う。

長くなったので全体の流れとしては以下

- ディスクリプターテーブルにディスクリプタの個数やシェーダのレジスタの情報を格納する
- それをもとにルートパラメーターを作成する
    - ルートパラメーターのインデックス0にディスクリプターテーブルが設定されている
    - 将来的にコマンドリストでインデックスとディスクリプタヒープを紐付ける
- そのルートパラメーターを使ってルートシグネチャを作成する
- 作成したルートシグネチャはパイプラインステートにも設定されるし、コマンドリストでも指定する

ディスクリプタテーブル、ルートパラメーターの図

![](https://paper-attachments.dropbox.com/s_32319F47CA7AF04C280992A0A69DEE54F609EFB857CBDA68FB253DDCB1E87908_1596379492894_+3-100.jpg)


**具体例まとめ**
ここまででいろんなオブジェクトを作成してはそれを使ってまた違うオブジェクトを作成し、を繰り替えしてやっとb0にテクスチャをとうろくすることができた。これまで図示してきたものをすべて組み合わせるとこういった関係になっているとおもわれる。


![](https://paper-attachments.dropbox.com/s_32319F47CA7AF04C280992A0A69DEE54F609EFB857CBDA68FB253DDCB1E87908_1596379734767_+4-100.jpg)



## もう少し複雑な例を作るときの自分用のメモ

この記事の元になった前に自分が書いた雑すぎるメモの写真と内容のメモ


![](https://paper-attachments.dropbox.com/s_32319F47CA7AF04C280992A0A69DEE54F609EFB857CBDA68FB253DDCB1E87908_1596380270110_memo-100.jpg)



- DescriptorTableには1つのディスクリプタを設定する
- なので2つヒープがあった場合はテーブルも2つ
- テーブルが2つということはRootParameterIndexの0にひとつめ、1にふたつめといった設定が必要になる



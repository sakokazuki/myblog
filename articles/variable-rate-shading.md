---
title: Variable Rate Shading
topics: [Direct3D,DirectXDirect3D12]
type: tech
emoji: 🔍
published: true
---

Variable Rate Shading (VRS) 可変レートシェーディング

とはレンダリングパスごと/プリミティブごと/画面の特定領域でシェーディングレート(ピクセルのサイズ?細かさ?)を動的に変更してレンダリングをする技術。

というところまではすんなり思い出せるが細かい部分よく忘れるので以下のurlを読むとある程度思い出せる。

[もんしょの巣穴 - DirectXの話 第168回](https://sites.google.com/site/monshonosuana/directx%E3%81%AE%E8%A9%B1/directx%E3%81%AE%E8%A9%B1-%E7%AC%AC168%E5%9B%9E)

[Variable-rate shading (VRS) - Win32 apps](https://docs.microsoft.com/en-us/windows/win32/direct3d12/vrs)

概要メモ
**従来(VRS以前)の可変レートレンダリングについて**

MSAAによるスーパーサンプリングしかシェーディングレートを変更する方法がなかった
しかもサンプル数を柔軟に変更できないし、画面全体にかかってしまう

**シェーディングレートの変更は2方向ある**

粗く(coarse)する方は1x2,2x1,2x2と表記される
細かく(MSAA)する方は2x,4xと表記される
細かくする方はMSAAの利用なので後述するような画像ベースとかの変更はできない？

**変更する方法は3通りある**

Per Draw: ドローコールごと
Per Primitive: 頂点ごと(SV_ShadingRateを頂点シェーダーで指定する)
Per Tile: タイルイメージで指定した領域ごと(後述)

**COMBINER？**

RSSetShadingRateの第二引数で使用する
Per Draw以外の方法でVRSしたいときは必要
3種ある指定方法をどういったルールで適応するかの指定(上書き?小さい方を取る?など)
ちなみにDraw->Primitive->Imageの順

PASSTHROUGHはスキップ、OVERRIDEは上書き、MIN/MAXはその名の通りである

**タイルイメージについて**
タイルサイズも8x8とか16x16などと表記されややこしい
レンダーターゲットをどのくらい細かいタイルに分けてVRSが可能かの数字(GPUごとに違う)
1920x1280に16x16であれば1x1、1x2、2x2、および2x2は、すべての層でサポートされている
3D12_FEATURE_DATA_D3D12_OPTIONS6::AdditionalShadingRatesSupportedで2x4、4x2、および4x4がサポートされているかどうかを取得できる
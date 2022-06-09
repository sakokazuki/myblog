---
title: 32bitのbufferに10bit,10bit,10bitでパックされたintを取り出す
topics: [Shader,GLSL,GraphicsPrograming]
type: tech
emoji: 💛
published: true
---

MeshShaderを使うとき

[https://sites.google.com/site/monshonosuana/directxの話/directxの話-第16](https://sites.google.com/site/monshonosuana/directx%E3%81%AE%E8%A9%B1/directx%E3%81%AE%E8%A9%B1-%E7%AC%AC165%E5%9B%9E)

やD3DExamplesのコードでcpp側で indexを32bitの型に3つ(10/10/10/2)詰めるというコードがあった。

それをシェーダーで使うときにはビッドシフトして一つずつ取り出すのだが、PIXでのデバッグ時にリソースの値を見てもきちんと値が渡せているかの確認ができなかった。

BufferFormatの機能はあるが10bitで分けるという柔軟なことはできなさそうだったのでとりあえずc++で書いてwandboxで実行して確認してみた。

```cpp
// This file is a "Hello, world!" in C++ language by Clang for wandbox.
#include <iostream>
#include <cstdlib>
#include <stdint.h>

int main()
{
    int32_t indices = (int32_t)(0x00300001);
    int a = indices & 0x3FF;
    int b = (indices>>10) & 0x3FF;
    int c = (indices>>20) & 0x3FF;

    std::cout << "a = " << a << ","<<std::endl;
    std::cout << "b = " << b << ","<<std::endl;
    std::cout << "c = " << c << ","<<std::endl;

}
```

[https://wandbox.org/permlink/jN9XIVZMerzchyJK](https://wandbox.org/permlink/jN9XIVZMerzchyJK)
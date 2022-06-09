---
title: MetalでのTextureViewについて
topics: [Metal]
type: tech
emoji: 📝
published: true
---

metalにおいて他のAPIのようにビューというオブジェクトはない(多分)

MTLTextureオブジェクトにMakeTextureViewという関数がある

[https://developer.apple.com/documentation/metal/mtltexture/1515598-maketextureview](https://developer.apple.com/documentation/metal/mtltexture/1515598-maketextureview)

[https://developer.apple.com/documentation/metal/mtltexture/2928180-maketextureview](https://developer.apple.com/documentation/metal/mtltexture/2928180-maketextureview)

[https://developer.apple.com/documentation/metal/mtltexture/3335015-maketextureview](https://developer.apple.com/documentation/metal/mtltexture/3335015-maketextureview)

この関数は同じメモリからformatやlevel, swizzleを変えたMTLTextureを作る場合に使う
MTLTextureを作る際のUsageにpixelFormatViewを指定していないとできないキャストがあるみたい
[https://developer.apple.com/documentation/metal/mtltextureusage/1516223-pixelformatview](https://developer.apple.com/documentation/metal/mtltextureusage/1516223-pixelformatview)

例に上がっているのはRGBAUnorm -> R32UintRGB -> RGBSrgbなど、カラースペースのみの変換のときは使わないほうが良い
テクスチャの読む順番が変わるだけのケースも同様に使わないほうが良い(swizzleを引数に持つ関数を使う
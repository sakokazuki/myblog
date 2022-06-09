---
title: グラム・シュミットの正規直交化法
topics: [Math,数学]
type: tech
emoji: 🧊
published: true
---

## 解説

変に文章で説明するよりも動画を見たほうがはやい。

[https://www.youtube.com/watch?v=o31e_oBR9s8](https://www.youtube.com/watch?v=o31e_oBR9s8)

## 応用 - SSAO

[スクリーンスペース・アンビエント・オクルージョン (SSAO)](https://zenn.dev/mebiusbox/articles/c7ea4871698ada)

上記からコードを引用し、補足説明 .

```jsx
 vec2 noiseScale = vec2(Resolution.x / 4.0, Resolution.y / 4.0);
 vec3 random = texture2D(NoiseSampler, vUv * noiseScale).xyz; // ノイズテクスチャによるランダム方向のベクトル

 vec3 tangent = normalize(random - viewNormal * dot(random,viewNormal)); // e2 - (e1・e2)*e1 の式
 vec3 bitangent = cross(viewNormal, tangent);
 mat3 kernelMatrix = mat3(tangent, bitangent, viewNormal);
```

シュミットの直交化法で正規基底座標系をつくっているコードであり、viewNormalをe1、randomをe2と置くと、tangentを求める部分でシュミットの式ができている。また、bitangentはcross式で求めている(e3のベクトルは要らないため？)。

これによりviewNormal方向をZ軸に、XY軸にランダム成分を加えた(正規基底)座標系ができる。

特定の点xyzにこのkernelMatrixを掛けることでviewNormalをランダムにずらした座標空間のベクトルを得ることができる。SSAOにおいてなぜランダムにしているかというとおそらくすべての点で同じ方向の遮蔽を調べると均一な絵になるためである。

```jsx
for (int i=0; i<KERNEL_SIZE; i++) {
     vec3 sampleVector = kernelMatrix * Kernel[i];
     ~~
 }
```

上記のコードでKernelは半球上のランダム点(Zが上)であり先程もとめたkernelMatrixを掛けることで法線をランダムにオフセットさせた空間上内でKernel方向を考えることができる。
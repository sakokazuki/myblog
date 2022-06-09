---
title: UE4でビルド済みのシェーダーコードを手っ取り早く知る方法
topics: [UnrealEngine4,UE4,Shader]
type: tech
emoji: 💛
published: true
---

UE4のシェーダーはは#defineでコードの分岐がおおくファイルを見ただけで実際にどんなコードになるかが分かりづらい。何かを参考に新しいシェーダーを書く際に参考になる。そして案外この方法を見つけるまでに時間がかかったのでメモ。

ConsoleVariable.iniの以下をコメントアウトして有効化

```
; Uncomment to get detailed logs on shader compiles and the opportunity to retry on errors
 r.ShaderDevelopmentMode=0
 ; Uncomment to dump shaders in the Saved folder (1 dump all, 2 dump on compilation failure only, 3 dump on compilation failure or warnings)
 ; Warning: leaving this on for a while will fill your hard drive with many small files and folders
 r.DumpShaderDebugInfo=0
 ; When this is enabled, dumped shader paths will get collapsed (in the cases where paths are longer than the OS's max)
 r.DumpShaderDebugShortNames=0
 ; When this is enabled, when dumping shaders an additional file to use with ShaderCompilerWorker -direct mode will be generated
 r.DumpShaderDebugWorkerCommandLine=0
 ; When this is enabled, shader compiler warnings are emitted to the log for all shaders as they are loaded (either from the DDC or from a shader compilation job).
 r.ShaderCompiler.EmitWarningsOnLoad=0
```

その後、Common.ushに改行を追加するなどしてシェーダーを再コンパイル(シェーダーが再コンパイルされるなら別の方法でもいい)

{プロジェクトディレクトリ}3D_SM5{任意のマテリアル}{任意のVertexFactory}{シェーダー}{Hash}{シェーダー名}.usfにビルド済みのコードが生成されている
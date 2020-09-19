---
title: CMakeでvisualstudioのプロジェクトを作成する
topics: [CMake,VisualStudio,C++] 
type: tech
emoji: 💛
published: true
---
私的なvisualsutdioのプロジェクト/ソリューションをgithubで管理する際に当然ながらそのまま.slnなどをあげるだけでは動かなかったのでCMakeを使って生成することにした。(業界スタンダードっぽかったので)

やってみて思ったが非常に面倒なので何か別の方法orもっとかんたんな生成フローがあれば知りたい。

逆引き辞典のようにやったことをメモしていく。随時更新。

結構参考になるサイト: https://gist.github.com/UnaNancyOwen/47159d73b480f16b846a


## とりあえず試しに生成

*CMakeでプロジェクトを作成する*
https://qiita.com/Lacty/items/d02eeba72dde2b875c31

この記事を見ながらビルドすればとりあえずどんなもんか試せる。

最終的にコマンドラインでやりたいので上記記事の状況だとコマンドプロンプトで


````txt
cd vs2015
cmake ../ -G "Visual Studio 15 2017"

````

とかやればいける。。と思う。

CMakeファイル関連の謎ファイルがたくさん生成されるの結構不満ポイント高い。
各ディレクトリにcmakelists.txtが必要なのも…


## プロジェクトに必要なファイルを追記していく

不満は慣れや今後の改善でどうにかするとしてcmakelists.txtのadd_executableにファイルを追加していく。

以下の記事が参考になった。

*ごく簡単なcmakeの使い方*
https://qiita.com/termoshtt/items/539541c180dfc40a1189


## 静的ファイルのコピー

シェーダーとか画像リソースとかのコピーは以下のようにして行う



````txt
configure_file(${CMAKE_SOURCE_DIR}/D3D12_Project/packages.config ${CMAKE_CURRENT_BINARY_DIR} COPYONLY)


````

## リンカーのサブシステムをWindowsにする



````txt
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} /SUBSYSTEM:WINDOWS")


````

## ポストビルドを設定する

add_custom_commandでプロジェクトが設定できる。
/Pとかが何かとかぶってエラーになるので、\\を重ねてエスケープしている。



````txt
add_custom_command(TARGET D3D12_Project POST_BUILD
 COMMAND copy /Y
 "C:\\Program Files (x86)\\Windows Kits\\10\\Redist\\D3D\\x64\\dxcompiler.dll"
 "$(TargetDir)dxcompiler.dll"
)



````

## add_executableなファイルをワイルドカードで指定する

このような感じで書けばワイルドカード指定ができる。



````txt
file(GLOB SOURCE *.h *.cpp)
file(GLOB LIB_SOURCE libs/*.h libs/*.cpp)

add_executable(D3D12_Project
 ${SOURCE}
 ${LIB_SOURCE}
)


````

## windows環境変数

$ENV{}で参照する



````txt
"$ENV{VK_SDK_PATH}\\Lib"


````

## 設定する環境変数を一覧で表示する

https://zashikiro.hateblo.jp/entry/2014/05/17/001314 のサイトのスクリプトをどこかに書く。
この機能ほんとに嬉しくて例えばVSのバージョンやプラットフォームごとにライブラリのパスを変更したいときとかに使えそうな変数が見れる。



````txt
message(STATUS "*** dump start cmake variables ***")
get_cmake_property(_variableNames VARIABLES)
foreach(_variableName ${_variableNames})
        message(STATUS "${_variableName}=${${_variableName}}")
endforeach()
message(STATUS "*** dump end ***")


````

## いいリンク(memo)

https://kamino.hatenablog.com/entry/cmake_tutorial1

https://qiita.com/shohirose/items/5b406f060cd5557814e9


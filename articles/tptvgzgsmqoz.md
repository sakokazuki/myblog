---
title: Unity向けdll作成及びC言語メモ
date: 2019-11-29
meta:
  - name: description
    content: Unity向けdll作成及びC言語メモこの記録について前職の仕事でc言語でダイナミックライブラリを作成してUnityで使いながらデバッグするということをしていたメモを掘り起こしたもの。
  - name: keywords
    content: Unity,C
  - name: og:title
    content: Unity向けdll作成及びC言語メモ
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: 
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [Unity,C] 
type: tech
emoji: 💛
---

## この記録について

前職の仕事でc言語でダイナミックライブラリを作成してUnityで使いながらデバッグするということをしていたメモを掘り起こしたもの。

## dll関連

**dll作る方法**

https://littlewing.hatenablog.com/entry/2018/01/18/150359


**dllMain関数について**
dllからはmain関数は呼ばれず、代わりに
dllMainという関数がwindow.hに用意されているらしい。
今回は使わなかったが参考程度に

https://ameblo.jp/zrfcsctd/entry-10790648253.html


**unity起動中のdll更新**

- i-saintさんがいい感じのを作ってくれている
    - https://github.com/i-saint/PatchLibrary
    - 使い方はhecomiにのってる
        - [Unity でネイティブプラグインの実行時更新を可能にする PatchLibrary を使ってみた](http://tips.hecomi.com/entry/2017/01/28/163155)
    - 設定が意外とめんどいが後々楽なので最初に入れると便利

**dll側のログを出す方法**
使わなかったけどこんな方法あるらしいメモ

http://cammy.co.jp/technical/2016/04/29/windows-gui%E3%83%97%E3%83%AD%E3%82%B0%E3%83%A9%E3%83%A0%E3%81%A7%E3%83%87%E3%83%90%E3%83%83%E3%82%B0%E6%83%85%E5%A0%B1%E3%82%92%E3%82%B3%E3%83%B3%E3%82%BD%E3%83%BC%E3%83%AB%E3%82%92%E8%A1%A8%E7%A4%BA/


**c#でstringのメモリを保持して、dll経由でcで書き込む(stringを返す関数をつくる)**
このページの文字列を受け取る場合ってところをみる

https://araramistudio.jimdo.com/2018/05/09/c-%E3%81%8B%E3%82%89c-%E3%81%AEdll%E3%82%92%E5%91%BC%E3%81%B3%E5%87%BA%E3%81%99/


出力側の関数例


````c
void hoge(char* str, int strlen){
    sprintf_s(str, strlen, "Hello %s\n", "World");
}

````

dotnet > 4. からStringBuilderにClear関数ができた(らしい)ので積極的に使いたい

https://dobon.net/vb/dotnet/string/stringbuilderclear.html


**cからunity(c#)のコードを呼び出す**

http://tips.hecomi.com/entry/2016/01/05/230405


**vsでビルドするたびにビルド日時を書きだす**
何がしたいか
ビルド前に任意のソースコードを生成したい。
まさにこんな感じの


````c
#define BUILD_DATE 20190117140034 

````

(日付をYYYYMMDDhhmmss形式にしたものを新しくしたい)
何のために
dllを開発してるとこれいつビルドしたやつだっけみたいになって
これほんとに新しいdllかどうか不安になりみたいなことがあったので
dll側に


````c
__declspec( dllexport ) int CheckVersion(){
    return BUILD_DATE //ビルド日時
}

````

とか書いてあげればdllを使う側からバージョンがチェックできる気がした。
どうやってやるの
結論

- slnがあるディレクトリにdate.batとかつくる
- date.bat `echo #define BUILD_DATE "%date% %time%" > date.c`
- vsで`プロパティ > ビルドイベント > ビルド前のイベント`ひらく
- call $(SolutionDir)date.bat
- 任意のところで#include "date.c"としてBUILD_DATEを使う

何してるか

- ビルドした時の時間でファイルを更新したいのでビルド前のイベントを使う
- ここでファイルを書き換えてからビルドすればいいはず
- echoで日付をYYYYMMDDhhmmssにフォーマットして#defineとかつけたりして
- '>' でファイルに上書き出力すればいい
- batファイルにする
- batファイルをたたくのをビルドイベントに設定する

はまったポイント

- ビルドイベントにecho書いたらvsの出力に出力されるだけでファイルつくられない。。
- 使わなかったけどビルドイベントの%のエスケープは%25
- batファイルはcallをつけて実行する
- batが実行されるフォルダは$(ProjectDir)なのでbatで出力するディレクトリに注意
- ディレクトリ間違えるとエラーになる
## c言語関連

**メモリコピー**

- memcpyって関数があるらしいよ https://bituse.info/c_func/56
- 複製というよりもメモリの中の値を別のメモリにコピーって感じだった
- なので確保してないメモリに使おうとすると止まる

**スレッドと排他処理**
メインスレッド上でforループで永続化するとdll呼び出したときにunityとまる。
スレッド分けましょう

https://paveway.hatenablog.com/entry/2018/12/14/win32api_criticalsection


マルチスレッドは`CreateThread`を使ったが`_beginthreadx`使ったほうが安全らしい。
http://www.geocities.jp/debu0510/personal/kusosure.html
安全してて変えるの怖かったからそのままCreateThreadつかったが。。
**構造体**
なんとc言語の構造体はtypedef使わないと毎回構造体名の前に"struct"と書かないといけないです。
書くのが普通なんだけど省略のために書くのが普通っぽいですよ
https://www.cc.kyoto-su.ac.jp/~yamada/programming/struct.html
**メモリリーク検出**
メモリリーク怖い。恐ろしい。
終了時に検出する方法がある

https://hwada.hatenablog.com/entry/20080304/1204609100


ただ、visual studioの停止ボタンなどで停止すると検出されないので、
適当なタイミングでexit()よんでテストしてみよう！精神的に安心。
あとは地道にコマンドプロンプトで
tasklist /v /fi "imagename eq zForceCalibration.exe"
とかたたいてメモリ使用量が増えていかないかみたりしていた。
**テキスト関連**
sprintf
visual studioだとsprintfが使えなくて代わりにsprintf_sを使うことになる。
charに文字のサイズ指定して変数をformatして入れてくれる。
printfのラッパー関数つくる
可変引数をもつ関数

https://qiita.com/kurasho/items/1f6e04ab98d70b582ab7


入出力関数
http://rainbow.pc.uec.ac.jp/edu/program/b1/Ex7-2.htm


---
title: Windowsでgzip圧縮したファイルをwebで使う
topics: [web] 
type: tech
emoji: 💛
published: true
---
よくあるApacheのサーバー前提。
※nginxでも同じようなことはしないといけないがファイルを作成部分は参考になる
※awsなら別方法がある
※サーバー側で圧縮しないのでよくあるmod_deflateが使えるかなどの確認が不要なのがいいところ

gzipファイル作成はいくつか方法があるが今回は2通り紹介する

- 7zipを使う方法
- pythonを使う方法


## 7-zipを使う方法

コマンドラインで使いたいので7-zipをダウンロードしておく。
適当にググればすぐ出るので割愛

**PowerShellスクリプトを書く**
ワンライナーなので別に直打ちでもいい。



````powershell
Get-ChildItem .\dist\ -r -i *.html,*js,*.css | % { $_.FullName } | %{7z a -sccUTF-8 $_".gz" $_}

````

【説明】

- Get-ChildItemでディレクトリ以下の*.html, *.js, *.cssファイルを再帰的に探す
- パイプでディレクトリ名のみに加工する
- 7zコマンドを実行する

※他の拡張子を増やしたければ*.htmlのところにカンマを打って追加する


## Pythonを使う方法

軽くしか試していないので紹介だけ
Pythonがインストールされている場所のLibフォルダにgzip.pyがあるのそれを実行する。



    $ python {your-pythonディレクトリ}\Lib\gzip.py hoge/app.js



## 
## ファイルをアップロードして.htaccessを書く

ファイルのアップロードは普段どおりでいい。

gzipを使いたいディレクトリ内に以下の.htaccessを置く(もしくは追加する)
やっていることは(おそらく)

- リクエストを.jsで来たリクエストは.js.gzにリダイレクトさせる
- MIME-TYPE と gz エンコードを指定

※最初アップロードしたらそのまま使えるのかと思って確認したらファイルが文字化けしており、MIME-TYPE,gzエンコードを指定する必要があった。


    RewriteEngine On
    RewriteCond %{HTTP:Accept-Encoding} gzip
    RewriteCond %{REQUEST_FILENAME} \.js$ [OR]
    RewriteCond %{REQUEST_FILENAME} \.css$
    RewriteCond %{REQUEST_FILENAME} !\.gz$
    RewriteCond %{REQUEST_FILENAME}\.gz -s
    RewriteRule .+ %{REQUEST_URI}.gz
    
    <FilesMatch "\.js\.gz$">
        ForceType application/x-javascript
        AddEncoding x-gzip .gz
    </FilesMatch>
    
    <FilesMatch "\.css\.gz$">
        ForceType text/css
        AddEncoding x-gzip .gz
    </FilesMatch>


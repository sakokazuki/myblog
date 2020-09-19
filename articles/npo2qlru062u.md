---
title: サーバーでアプリケーションをデーモン化する知見
date: 2019-11-28
meta:
  - name: description
    content: サーバーでアプリケーションをデーモン化する知見supervisorつかういろいろやったんだけど
  - name: keywords
    content: web,programming
  - name: og:title
    content: サーバーでアプリケーションをデーモン化する知見
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
topics: [web,programming] 
type: tech
emoji: 💛
---

## supervisorつかう

いろいろやったんだけど

http://onga-tec.hatenadiary.jp/entry/2017/01/27/Supervisor%E3%81%A7Go%E3%82%92%E3%83%87%E3%83%BC%E3%83%A2%E3%83%B3%E5%8C%96%E3%81%99%E3%82%8B%E3%80%82CentOS_1


でできた
大事なこと

- こんなかんきょうでaynenvとか使わない
- てかglobalにpythonはいってたし
- グローバルのpythonつかう
- pipじゃなくてeasy_installerでいれる

以下、頑張ってあれこれしてだめだった記録
これはこれでconfがなにしてるかとかわりと知見は溜まった。。

## Supervisor

python製のアプリ
基本はここ見ながら設定した

https://qiita.com/yushin/items/15f4f90c5663710dbd56

## 手順

**python入れる**
pythonない場合はインストール
python 3系ではうごかないらしい
`anyenv install pyenv`
`pyenv install 2.7.15`
`pyenv global 2.7.15`
新しいマシンだったのでグローバルに設定しちゃったけど、グローバルが3系のときはどうすればいいかはわからん
**pip最新にする**
`pip install --upgrade pip`
**supervisorいれる**
`sudo pip install supervisor`
**supervisor動くようにする**
configファイル作成
`sudo echo_supervisord_conf > /etc/supervisord.conf`
権限周りでできなかったので
`touch /etc/supervisord.conf`
`chmod 755 /etc/supervisord.conf`
`echo_supervisord_conf > /etc/supervisord.conf`
的な雰囲気で頑張る
includeコンフィグ用のディレクトリの作成
include config用のディレクトリっていまいち意味はわかっていない
`sudo mkdir /etc/supervisord.d`
ログ
記事の

    - supervisordログファイル

ってところのとおりにする
log rotationの確認ってやつはlinux標準？のlogrotate機能があるらしいのでそれ関連ぽい

https://qiita.com/Esfahan/items/a8058f1eb593170855a1


`ls /etc/logrotate.d/`
でsupervisorがあるの確認できる
他config設定

    - pid, includeの設定

基本は記事のこの部分をみればいいのだがpidのところは
`/var/run/supervisord.pid`は実行時に権限周りでエラー起きたからユーザーのホームにした
そんな適当なとこに置いていいかはわからない
`mkdir ~/run`
`touch ~/run/supervisord.pid`
あと、.sockファイルも権限周りエラーになったから
`touch ~/run/supervisord.sock`
にファイル作成する。
最終的にデフォルトから編集したのは以下


````txt
[unix_http_server]
file=/home/username/run/supervisor.sock
# ...中略

;[inet_http_server]         ; inet (TCP) server disabled by default
# コメント外した
port=127.0.0.1:9001        ; ip_address:port specifier, *:port for all iface　
# ...中略

[supervisord]
# きじのまま
logfile=/var/log/supervisor/supervisord.log
# ...中略
# pidファイル指定
pidfile=/home/username/run/supervisord.pid
# ...中略

[supervisorctl]
# .sockのディレクトリ変更コメントアウトもどした
serverurl=unix:///home/username/run/supervisor.sock ; use a unix:// URL  for a unix socket
serverurl=http://127.0.0.1:9001 ; use an http:// url to specify an inet socket

# includeセクションがコメントアウトされているので、コメントインして下記の用に修正。
[include]
files = supervisord.d/*.ini

````

記事ではやってないがこのへんでsupervisorが単体で動くかどうか確認したほうがいい
じゃないと次の段階でエラーが出たときにどこが悪いか判断つかない
`supervisord -n -c /etc/supervisord.conf`
今回は

- `supervisor Unlinking stale socket`っていうエラーが出続けた
    - 原因はsock.fileがそもそもないかった
- `open an HTTP server: socket.error reported errno.EACCES (13)`
    - sock.fileの権限
- .pidの権限エラー

が出たが上記のconfで解決済み
**supervisord本体のシステムサービス登録**
記事を追っていくと次はここなのだが、
systemdっていうのはsupervisorというよりlinux側の機能ぽくて
systemd/system/hogehgoe.service
をつくってhogehogeを起動時実行できるようにするよっていう解釈をした
とりあえずcentos7系の方をコピペ


````txt
[Unit]
Description=Supervisor process control system for UNIX
Documentation=http://supervisord.org
After=network.target

[Service]
ExecStart=/usr/bin/supervisord -n -c /etc/supervisord.conf
ExecStop=/usr/bin/supervisorctl $OPTIONS shutdown
ExecReload=/usr/bin/supervisorctl $OPTIONS reload
KillMode=process
Restart=on-failure
RestartSec=50s

[Install]
WantedBy=multi-user.target

````

`systemctl start supervisord`
`systemctl status supervisord`
startしてstatusみると明らかにエラーっぽいので原因見ると
今回の場合pyenvでpythonいれたりしてたので
`which supervisord`
すると
`~/.anyenv/envs/pyenv/shims/supervisord`
こんなところにあるので
ExecStartのとかの"/uer/bin/"を"/home/{ユーザー}/.anyenv/envs/pyenv/shims/"に置換した
~をつかったディレクトリの指定はできなかった。
ここまでやってようやくsupervisor本体の動作確認と
起動時に実行するのができた


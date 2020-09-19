---
title: reCAPTCHA認証をやってみる
topics: [Wordpress,Web,php,ReCAPTHCA] 
type: tech
emoji: 💛
published: true
---
reCPATHCA認証は2020年1月現在v3という、ユーザーのチェックが不要のシステムがあり、これはGoogleが自動でbot入力かどうか判別してくれるというもの。
詳しくは → https://webmaster-ja.googleblog.com/2018/10/introducing-recaptcha-v3-new-way-to.html

やることはそんなにないのだけれど確認とか含めると非常に面倒だった。

## やったこと

**とりあえず**
全体的な流れを以下のサイトを参考にほぼそのまま実装
https://www.ii-sys.jp/notes/1108

**シークレットキーのファイルを分ける**
セキュリティ都合上、シークレットキーファイルをwebルートにおかずに



````php
<?php
//reCAPTCHA シークレット
define('RC_SECRET', 'xxxxxxxxxxxxxxxxxxxxxxxxxxx');

````

としてrequire_onceで読み込みをした



````php
// reCAPTCHAシークレットキーの読み込み
require_once('./recaptcha_secret.php');

````

参考: https://www.webdesignleaves.com/wp/php/1673/

**正しく動いているかチェック**
[ここ](https://qiita.com/kaibadash@github/items/dad2234ed0b47b373678#%E5%90%8C%E3%81%98%E3%83%AA%E3%82%AF%E3%82%A8%E3%82%B9%E3%83%88%E3%82%92%E9%A3%9B%E3%81%B0%E3%81%97%E3%81%A6%E3%81%BF%E3%82%8B)のページのように、copy as powershellとかでコピーしてpowershellを起動、コピーしたものをペーストして実行すると無事にsuccessがfalseになることを確認。

**右下のアイコンを消す。**
Google公式による消し方。

https://developers.google.com/recaptcha/docs/faq#id-like-to-hide-the-recaptcha-badge.-what-is-allowed


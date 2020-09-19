---
title: サーバーへのファイルアップロードコマンド
topics: [Web] 
type: tech
emoji: 💛
published: true
---

## 概要

仕事でweb制作をするとファイルアップロード=>チーム確認のフローが増える。
そういったときにファイルのアップロードをコマンドで自動化しておくと便利です。
しかし受託メインだとftp使わないといけなかったり、sftpだったり、aws s3になったりしていろいろ知見がたまったのでファイルサーバーにアップロードする手段をまとめました。

必要になるのはプロジェクト終盤が多いが、終盤にファイルアップロードについて考える脳内のリソースがないことが大半なためこの作業はプロジェクトの序盤に済ませておいたほうがぶなん無難です。
もちろん、自動化しない(手動でやる)という選択が正解なケースもあります。

**※昔に書いたスクリプトも多いので今そのまま動くかはわからない。サーバーのファイル上書きしてしまわないようにバックアップなどは必ずすること。自分がもし同じことする場合はここのコードベースでとりあえずやってみるので参考になればと思って記事にしました。**

お品書き

- シェルスクリプトでftp
- node.jsでsftp
- Makefileでrsync(ssh)
- node.jsでaws s3にアップロード gzipなし
- node.jsでaws s3にアップロード gzipあり
- gulp.js(ftp, sftp, aws s3)
## アップロード手順

**ftpでアップロードする(sftpでもできる説？)**

パスワードを直書きしてるので.gitignoreしたほうが無難



````bash
HOSTNAME=xxxxxxxx.co.jp/dir/
USERNAME=username
PASSWORD=password
SOURCE="ローカルビルドディレクトリ/"
DIST="サーバーディレクトリ/"

lftp -u $USERNAME,$PASSWORD $HOSTNAME -e "\
  mirror \
  --reverse \
  --delete \
  --verbose \
  -X .DS_Store \
  $SOURCE \
  $DIST; \
  exit"

````

**sftpでアップロード**
node.jsで以下の2ファイルを用意、sftpconfig.jsに設定を書いて

`node sftp.js`

でアップロード

host/passwordをstfpconfig.jsに分けて書いてこっちは.gitignoreする。

sftp.js


````javascript
const fs = require('fs');
const path = require('path');
const sftp = require('node-sftp-deploy');
const config = require('./sftpconfig')

sftp(config, ()=>{
  //Success Callback
});

````

sftpconfig.js


````javascript
module.exports = {
  "host": "xxxxxxxx.jp",
  "port": "22",
  "user": "user",
  "pass": "passsord",
  "remotePath": "/home/www/your-directory/public_html"
  "sourcePath": "./{local_dir}"
}


````

## ssh使ってアップロード(rsync)

このケースはnodeでサーバーサイドアプリを書いたときにプロセスを一度止めて、rsyncして、リスタートを自動でやっていたときのメモ。rsyncのみであれば一行でできると思うので下に別に分けたものも書きました。

鍵情報は .ssh/configに書いてある想定。

Makefile (hogeはsshのconfig名)


````bash
deploy_production:
    #nodeのプロセス落とす (option pm2で実行ししていしていたしていた落とす)
    ssh hoge "source ~/.bash_profile && pm2 stop processname && pm2 deleteprocessname"
    #ec2のフォルダをバックアップ(option サーバーにもmakefileでフォルダバックアップのコマンドを書いた)
    ssh hoge "make backup"
    #rsync
    rsync -aruzv local_dir/ hoge:~/server_dir

    #restart (option pm2ｄでリスタート)
    ssh hoge "source ~/.bash_profile && cd server_dir && pm2 start pm2config.json --env production"

````

アップロードだけなら以下でできる説


````bash
deploy:
    rsync -aruzv local_dir/ hoge:~/server_dir


````

## s3バケットにデプロイ(非gzip圧縮)

s3config.jsonに鍵情報やデプロイパスなどを書いて、s3deploy.jsで実行。s3config.jsonはgitignoreなりで保護
cloud frontなどでgzip配信するときはそのまま上げていいと思うので非gzipバージョン

`node s3deploy.js`

で実行

s3config.json


````json
{
  "accessKeyId": "XYXYXYXYXYXYXYXYXYXYXY",
  "secretAccessKey": "aklfaSFDfFEgDgadgkRAFDAFl",
  "region": "ap-northeast-1",
  "bucket": "your.bucket.name",
  "path": "dist_path/",
  "src": "local_path/"
}

````

s3deploy.js


````javascript
const s3 = require('s3');
const path = require('path');
const s3config = require('./s3config.json')

// まずはs3クライアントを作成
const client = s3.createClient({
  maxAsyncS3: 20,     // デフォルトのままでOK 
  s3RetryCount: 3,    // デフォルトのままでOK 
  s3RetryDelay: 1000, // デフォルトのままでOK 
  multipartUploadThreshold: 20971520, // デフォルトのままでOK 
  multipartUploadSize: 15728640, // デフォルトのままでOK
  s3Options: {
    accessKeyId: s3config.accessKeyId, // 今回S3にアクセスするために作成したIAMユーザーのアクセス・キー
    secretAccessKey: s3config.secretAccessKey,  // 今回S3にアクセスするために作成したIAMユーザーのシークレット・キー
    region: s3config.region,
  },
});

const srcDir = path.join(__dirname, s3config.src)
// 続いてアップロードしたいファイルの指定や、S3にアップロードした時のファイル名をparamsで指定
const params = {
  localDir: srcDir, // アップロードしたいローカルのファイルパス。パスは作成したプロジェクトルートからの相対パス
  s3Params: {
    Bucket: s3config.bucket,  // アップロードしたいS3のバケット名
    Prefix: s3config.path, // アップロードした時に作成されるファイル名(S3バケットの相対パス)
  },
};

const uploader = client.uploadDir(params);
uploader.on('error', function(err) {
  console.error("unable to upload:", err.stack);
});
uploader.on('progress', function() {
  console.log("progress", uploader.progressMd5Amount,
            uploader.progressAmount, uploader.progressTotal);
});
uploader.on('end', function() {
  console.log("done uploading");
});


````

## s3バケットにデプロイ(gzip圧縮)

gzipに圧縮してcontent-typeなどのヘッダーをつけてデプロイするバージョン。
s3だけでホスティングするときはgzip圧縮したほうがいいので作成。

s3config.jsonは上記と共通で使用できるはず。

gzipDeploy.js


````javascript
const fs = require('fs');
const path = require("path");
const s3config = require("./s3config.json");
const s3 = require('s3');
const mime = require('mime');
const zlib = require('zlib');

//AWSクライアント作成
const client = s3.createClient({
  maxAsyncS3: 20,     // デフォルトのままでOK 
  s3RetryCount: 3,    // デフォルトのままでOK 
  s3RetryDelay: 1000, // デフォルトのままでOK 
  multipartUploadThreshold: 20971520, // デフォルトのままでOK 
  multipartUploadSize: 15728640, // デフォルトのままでOK
  s3Options: {
    accessKeyId: s3config.accessKeyId, // 今回S3にアクセスするために作成したIAMユーザーのアクセス・キー
    secretAccessKey: s3config.secretAccessKey,  // 今回S3にアクセスするために作成したIAMユーザーのシークレット・キー
    region: s3config.region,
  },
});

//フォルダ以下のファイルを再帰的に取得
const readSubDirSync = (folderPath) => {
  let result = [];
  const readTopDirSync = ((folderPath) => {
    let items = fs.readdirSync(folderPath);
    items = items.map((itemName) => {
      return path.join(folderPath, itemName);
    });
    items.forEach((itemPath) => {
      if (fs.statSync(itemPath).isDirectory()) {
        readTopDirSync(itemPath);
      }else{
        result.push(itemPath);
      }
    });
  });
  readTopDirSync(folderPath);
  return result;
};

const readFile = (path)=>{
  const fs = require('fs');
  return new Promise((resolve, reject)=>{
    fs.readFile(path, (err, data)=>{
      if(err) reject(err);
      resolve(data);
    });
  });
}

const putObjectToS3 = (data, src, dist)=>{

  return new Promise((resolve, reject)=>{
    const ext = path.extname(dist);
    const type = mime.getType(ext);
    var s3Params = {
      Bucket: s3config.bucket,
      Key: dist,
      Body: zlib.gzipSync(data),
      ContentEncoding:　'gzip',
      ContentType: type,
    }
    const params = {
      localFile: src,
      s3Params:s3Params
    }

    var uploader = client.uploadFile(params);
    uploader.on('error', function(err) {
      console.error("unable to upload:", err.stack);
    });
    uploader.on('progress', function() {
      // console.log("progress", uploader.progressMd5Amount, uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
      // console.log("done uploading");
      resolve();
    });
  })
}

const uploadS3 = async(src, dist)=>{
  const data = await readFile(src);
  await putObjectToS3(data, src, dist);
  console.log(`[upload] ${src} -> ${dist}`);
}
const srcDir = path.join(__dirname, s3config.src)

const files = readSubDirSync(srcDir)
const tasks = files.map(file => {
  const dist = path.join(s3config.path, path.relative(srcDir, file));
  return uploadS3(file, dist)
})
Promise.all(tasks).then(()=>{
  console.log("complete upload!");
})
````

## gulpfile.js

gulpfileに各種アップロード方法の書いてあったから移植すれば普通のnodeでも使える説
適当に昔つくったgulpfileから切り出したのでこの記事で一番動く保証がないもの



````javascript
//----------------
// FTP
// config.js
// module.exports = {
//   host: "testtest.co.jp",
//   user: "user",
//   pass: "password",
//   parallel: 10,
//   dest: "/"
// }
//----------------
gulp.task('ftpdeploy', ()=> {
  const ftp = require('vinyl-ftp');
  const ftpconfig = require('./ftpconfig.js')

  const conn = ftp.create(ftpconfig);
  const globs = [buildPath+'**', '!'+buildPath+"api/**"];

  return gulp.src(globs, {buffer: false})
    .pipe(conn.newer(ftpconfig.dest))
    .pipe(conn.dest(ftpconfig.dest));

});


gulp.task('sftpdeploy', ()=>{
  const sftpconfig = require('./sftpconfig');
  const sftp = require('gulp-sftp');
  let config;
  switch(process.env.NODE_ENV){
    case "release":
      config = sftpconfig.release
      break
    case "stg":
      config = sftpconfig.stg
      break
    case "dev":
    default:
      config = sftpconfig.dev
    break
  }
  console.log(buildPath)
  console.log(config);
  return gulp.src(buildPath+'/**/*')
    .pipe(sftp(config));
})
//----------------
// SFTP
// sshconfig.jsを別ファイルに作ってgitignoreする
// "dev": { host: 'hogehoge.com', port: 22, path: '/home/www/test_dev/'},
// "stg": { host: 'hogehoge.com', port: 22, path: '/home/www/test_stg/'},
// "release": { host: 'hogehoge.com', port: 22, path: '/home/www/test_release/'}
//----------------
gulp.task("sshpdeploy", ()=>{
  const rsync = require('gulp-rsync');
  const sshconfig = require('./sshconfig')

  let config;
  switch(process.env.NODE_ENV){
    case "release":
      config = sshconfig.release
      break
    case "stg":
      config = sshconfig.stg
      break
    case "dev":
    default:
      config = sshconfig.dev
    break
  }

  return gulp.src(buildPath+'**')
    .pipe(rsync({
      root: buildPath,
      hostname: config.host,
      port: config.port,
      destination: config.path
  }));
})

gulp.task('gzips3_deploy', done => {
  const AWS = require('aws-sdk');
  const path = require('path');
  const fs = require('fs');


  AWS.config.loadFromPath(path.join(__dirname,"./", "s3config.json"));
  AWS.config.update({region: 'ap-northeast-3'});

  const s3 = new AWS.S3();
  const s3bucket = "your-bucker-name"
  const base = buildPath;
  const s3base = ""

  const files = readSubDirSync(base);
  let tasks = [];
  for(let file of files){
    const fromPath = file;
    const distPath = s3base+path.relative(base, fromPath);
    tasks.push(uploadS3(s3, s3bucket, distPath, fromPath));
  }

  Promise.all(tasks).then(()=>{
    console.log("===============================");
  })

});

const readSubDirSync = (folderPath) => {
  let result = [];
  const readTopDirSync = ((folderPath) => {
    let items = fs.readdirSync(folderPath);
    items = items.map((itemName) => {
      return path.join(folderPath, itemName);
    });
    items.forEach((itemPath) => {
      if (fs.statSync(itemPath).isDirectory()) {
        readTopDirSync(itemPath);
      }else{
        result.push(itemPath);
      }
    });
  });
  readTopDirSync(folderPath);
  return result;
};

const wait = (t)=>{
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      console.log("wait", t);
      resolve();
    }, t);
  });
}

const uploadS3 = async(s3, s3bucket, s3Path, filepath)=>{
  const data = await readFile(filepath);
  await putObjectToS3(s3, s3bucket, s3Path, data);
  console.log(`[upload] ${filepath} -> ${s3Path}`);
}

const putObjectToS3 = (s3, s3bucket, s3Path, data)=>{
  const mime = require('mime');
  const zlib = require('zlib');
  return new Promise((resolve, reject)=>{
    const ext = path.extname(s3Path);
    const type = mime.getType(ext);
    var params = {
      Bucket: s3bucket,
      Key: s3Path,
      Body: zlib.gzipSync(data),
      ContentEncoding:　'gzip',
      ContentType: type,
    }
    s3.putObject(params, (err, data)=> {
      if (err){
        reject(err);
      }
      else{
        resolve();
      }
    });
  })
}

const readFile = (path)=>{
  const fs = require('fs');
  return new Promise((resolve, reject)=>{
    fs.readFile(path, (err, data)=>{
      if(err) reject(err);
      resolve(data);
    });
  });
}

//----------------
//  AWS
//  s3にデプロイするときは
//  s3config.jsとか別ファイルで作ってignoreしておく
//  "dev": { "accessKeyId": "XXXXXXXXXXXXXXXXXXXX", "secretAccessKey": "XXXXXXXXXXXXXXX", "region": "XXXXXXXXXX", "bucket": www.hgoe.com, "path": "test_dev/" },
//  "stg": { "accessKeyId": "XXXXXXXXXXXXXXXXXXXX", "secretAccessKey": "XXXXXXXXXXXXXXX", "region": "XXXXXXXXXX", "bucket": www.hgoe.com, "path": "test_srg/" },
//  "release": { "accessKeyId": "XXXXXXXXXXXXXXXXXXXX", "secretAccessKey": "XXXXXXXXXXXXXXX", "region": "XXXXXXXXXX", "bucket": www.hgoe.com, "path": "test_release/" },
//----------------
gulp.task('s3deploy', (cb)=>{
  const AWS = require('aws-sdk');
  const async = require('async');
  const s3 = require('s3');


  const s3bucket = "my-bucker-name"
  const s3path = "test"

  AWS.config.loadFromPath(path.join(__dirname,"./", "s3config.json"));
  AWS.config.update({region: 'ap-northeast-1'});
  const awss3 = new AWS.S3();
  const options = {
    s3Client: awss3,
  };
  const client = s3.createClient(options);

  const uploadFunc = () =>{
    return new Promise((resolve, reject)=>{

      const params = {
        localDir: buildPath,
        deleteRemoved: false,
        s3Params: {
          Bucket: s3bucket,
          Prefix: "testt/"+s3path
        },
      };
      const uploader = client.uploadDir(params);
      uploader.on('error', function(err) {
        reject(err);
      });
      uploader.on('progress', function() {
        console.log("progress", uploader.progressAmount, uploader.progressTotal);
      });
      uploader.on('end', function() {
        resolve();
        console.log("done uploading");
      });
    });
  }

  uploadFunc();


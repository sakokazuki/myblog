const axios = require('axios')
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path')
const articles = require('./paper.config').articles
const { promisify } = require('util')
const marked = require("marked");

/*---------------
  write file functions
-----------------*/
const writeFile = async (dir, data) => {
  const err = await promisify(fs.writeFile)(dir, data);
  if (err) {
    throw err;
  }
  return;
}

const isExists = async (file) => {
  return await promisify(fs.stat)(file)
    .then(stats => { return true })
    .catch(err => {
      if (err.code === 'ENOENT') {
        return false;
      }
      throw err;
    });
}

const updateFile = async (id, data) => {
  const dir = path.join(__dirname, "../blog", id.substr(0, 5));

  //ディレクトリの存在を確かめる
  const isExistsDir = await isExists(dir).catch(err => {
    throw err;
  });
  //なかったらディレクトリを作る
  if (!isExistsDir) {
    await promisify(fs.mkdir)(dir).catch(err => {
      throw err;
    });
  }

  //ファイル書き込み
  const file = path.join(dir, "index.md");
  await writeFile(file, data);
}

const updateZennFile = async(id, data)=>{
  const dir = path.join(__dirname, "../articles");
  
  const isExistsDir = await isExists(dir).catch(err => {
    throw err;
  });
  
  if (!isExistsDir) {
    return;
  }

  //ファイル書き込み
  // 12文字以上のslug
  const fileName = id.substr(0, 12).toLowerCase()+".md";
  const file = path.join(dir, fileName);
  await writeFile(file, data);
}

/*---------------
  request setting
-----------------*/
const apiBaseUrl = "https://api.dropboxapi.com";
const apiEndpoint = "/2/paper/docs/download";
const token = process.argv[2] ? process.argv[2] : fs.readFileSync(path.join(__dirname, "../access-token.txt"), 'utf8');
const http = axios.create({
  baseURL: apiBaseUrl
});

//tokenの設定
http.interceptors.request.use((conf) => {
  if (token) {
    conf.headers.Authorization = `Bearer ${token}`;
    return conf;
  }
  return conf;
}, (error) => {
  return Promise.reject(error);
});

// マークダウンから画像ファイルを抽出する
const findImageFromMd = (md) => {
  const pattern = /\!\[\]\(.+?\)/g;
  const result = md.match(pattern) ? md.match(pattern)[0] : "";
  if (result) {
    return result.slice(4).slice(0, -1);
  }
  return "";
}


const htmlEscapeToText = function (text) {
  return text.replace(/\&\#[0-9]*;|&amp;/g, function (escapeCode) {
    if (escapeCode.match(/amp/)) {
      return '&';
    }
    return String.fromCharCode(escapeCode.match(/[0-9]+/));
  });
}

const render_plain = function () {
  var render = new marked.Renderer();

  // render just the text of a link
  render.link = function (href, title, text) {
    return text;
  };
  // render just the text of a paragraph
  render.paragraph = function (text) {
    return htmlEscapeToText(text) + '\r\n';
  };

  // render just the text of a heading element, but indecate level
  render.heading = function (text, level) {
    return text;
  };

  // render nothing for images
  render.image = function (href, title, text) {
    return '';
  };
  return render;
}



/*---------------
  request
    -----------------*/
const request = async (article) => {
  const res = await http.post(apiEndpoint, null, {
    headers: {
      'Content-Type': 'text/plain',
      'Dropbox-API-Arg': `{"doc_id":"${article.id}","export_format":{".tag":"markdown"}}`
    }
  })
    .catch(err => {
      console.error(err);
      return;
    })
  // console.log(res)
  const title = JSON.parse(res.headers['dropbox-api-result']).title;
  const md = res.data;
  // マークダウンから一番上の画像を取得してogimageに
  const shareImage = findImageFromMd(md);
  // マークダウンのテキストのみを抽出
  const plainText = marked(md, {
    renderer: render_plain()
  });
  // 改行されるまでをdescriptionとする
  const description = plainText.split("\n")[0];
  const keywords = article.tags.join(",");
  
  // for zenn
  const zennTopics = article.tags;
  const zennType = (article.type == "idea") ? "idea" : "tech" // デフォルトでtech zennTypeにideaを指定したときのみidea
  const zennEmoji = "💛"
  const zennPublish = (article.zenn == "false") ? false : true // zennで公開するかしないか 

  const filedata = `---
title: ${title}
date: ${article.date}
meta:
  - name: description
    content: ${description}
  - name: keywords
    content: ${keywords}
  - name: og:title
    content: ${title}
  - name: og:site_name
    content: びわの家ブログ
  - name: og:url
    content: https://biwanoie.tokyo
  - name: og:image
    content: ${shareImage}
  - name: og:locale
    content: ja_JP
  - name: twitter:card
    content: summary_large_image
topics: [${zennTopics}] 
type: ${zennType}
emoji: ${zennEmoji}
---
${md}`
  await updateFile(article.id, filedata);
  await updateZennFile(article.id, filedata);
  article.title = title;
  return article
}

const matchFile = async (match_str) => {
  return new Promise((resolve) => {
    const match = path.join(__dirname, match_str);
    require("glob").glob(match, (er, files) => {
      resolve(files);
    });
  })
}

const clean = async () => {
  //"blog/"以下のファイルを列挙(.vuepressはドットファイルだから？無視されてる)"
  const files = await matchFile("../blog/*");
  const zennFiles = await matchFile("../articles/*.*");
  const deleteTarget = files.concat(zennFiles);
  
  //"index.md"以外は削除
  await Promise.all(deleteTarget.map(async (file) => {
    if (file.indexOf('index.md') < 0) {
      await promisify(fsExtra.remove)(file)
    }
  }))
}


/*---------------
  execute
-----------------*/
(async () => {
  //or
  await clean();

  await Promise.all(articles.map(async (article) => {
    await request(article);
  }));

  console.log("complete");
})();

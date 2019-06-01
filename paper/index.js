const axios = require('axios')
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path')
const articles = require('./paper.config').articles
const {promisify} = require('util')

/*---------------
  write file functions
-----------------*/
const writeFile = async(dir, data)=> {
  const err = await promisify(fs.writeFile)(dir, data);
  if(err){
    throw err;
  }
  return;
}

const isExists = async(file)=>{
  return await promisify(fs.stat)(file)
  .then(stats=> {return true})
  .catch(err=>{
    if(err.code === 'ENOENT') {
      return false;
    }
    throw err;
  });
}

const updateFile = async (id, data) =>{
  const dir = path.join(__dirname, "../blog", id.substr(0, 5));

  //ディレクトリの存在を確かめる
  const isExistsDir = await isExists(dir).catch(err=>{
    throw err;
  });
  //なかったらディレクトリを作る
  if(!isExistsDir){
    await promisify(fs.mkdir)(dir).catch(err=>{
      throw err;
    });
  }
  
  //ファイル書き込み
  const file = path.join(dir, "index.md");
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
}, (error)=> {
  return Promise.reject(error);
});

/*---------------
  request 
-----------------*/
const request = async (article)=>{
  const res = await http.post(apiEndpoint, null, {
    headers: {
      'Content-Type': 'text/plain',
      'Dropbox-API-Arg': `{"doc_id":"${article.id}","export_format":{".tag":"markdown"}}`
    }
  })
  .catch(err=>{
    console.error(err);
    return;
  })

  const title = JSON.parse(res.headers['dropbox-api-result']).title;
  const md = res.data;
  const filedata = `---
title: ${title}
date: ${article.date}
---
${md}`
  await updateFile(article.id, filedata);
  article.title = title;
  return article
}

const matchFile = async()=>{
  return new Promise((resolve)=>{
    const match = path.join(__dirname, "../blog/*");
    require("glob").glob(match,  (er, files)=>{
      resolve(files);
    });
  })
}
const clean = async ()=>{
  //"blog/"以下のファイルを列挙(.vuepressはドットファイルだから？無視されてる)"
  const files = await matchFile();
  //"index.md"以外は削除
  await Promise.all(files.map(async(file)=>{
    if(file.indexOf('index.md') < 0){
      await promisify(fsExtra.remove)(file)
    }
  }))
}


/*---------------
  execute 
-----------------*/
(async ()=>{
  //or
  await clean();
  

  await Promise.all(articles.map(async (article)=>{
    await request(article);
  }));
  
  console.log("complete");
})();
const fs = require("fs");
const readline = require("readline");
const path = require("path");

class FileProcessor {

  constructor(filePath) {
    // init variables
    this.isCodeLine = false;
    this.isYamlBlock = false;
    this.inputPath = filePath;
    this.fileDir = path.parse(filePath).dir;
    // console.log(path.basename(filePath));
    this.outputPath = path.join(this.fileDir, "output"+path.basename(filePath));

    // prism.js lang formats (拡張子と一致しないもののみ)
    this.constPrismExts = {
      'js': 'javascript',
      'py': 'python',
      'rb': 'ruby',
      'ps1': 'powershell',
      'psm1': 'powershell',
      'sh': 'bash',
      'bat': 'batch',
      'h': 'c',
      'hpp': 'cpp',
      'tex': 'latex',
      'style': 'css',
      'styl': 'css'
    };


  }

  do() {
    // read file
    this.readFile = readline.createInterface({
      input: fs.createReadStream(this.inputPath, "utf8"),
      output: fs.createWriteStream(this.outputPath),
      terminal: false
    });

    // event
    this.readFile
      .on('line', this.onLine.bind(this))
      .on('close', this.onClose.bind(this))
  }

  onLine(line) {
    const firstWord = line.substr(0, 1);

    // ---はmd上部のyamlエリア、---の始まりでtrueにして終わりでfalseに戻る trueのときはリターン
    const yamlBlock = (line.substr(0, 3) == "---") && (line.length == 3)
    if (yamlBlock) {
      this.isYamlBlock = !this.isYamlBlock;
    }
    if (this.isYamlBlock == true) {
      this.readFile.output.write(`${line}\n`);
      return;
    }


    // タイトルは無視(重複するので)
    if (line.substr(0, 2) == "# ") return;

    // コードブロック内ではないとき(コードブロックの始まりを見つける)
    if (this.isCodeLine == false) {

      // 最初の文字が"<"で始まるとコードであるというルール
      if (firstWord == '<') {

        //<test.js>の中身を取り出す <test.js> -> test.js
        const codeRegax = /(?<=\<).*?(?=\>)/;
        const codeHeader = line.match(codeRegax);

        //拡張子を取り出す test.js -(split)-> js
        const ext = codeHeader[0].split('.')[1];

        // 拡張子をprismjsのlangformatに変換(リストになければ拡張のまま) js -> javascript
        let lang = this.constPrismExts[ext];
        // console.log(lang, ext);
        if (lang === undefined) lang = ext;

        //コードブロック開始文字の挿入 ````javascript
        // `が4つなのはコードブロックの中にコードブロックを記入するケースの回避策
        this.readFile.output.write(`\n\n\`\`\`\`${lang}`);

        // コード内フラグたてる
        this.isCodeLine = true;
      } else {
        // なにもない場合はそのまま行を書き込み
        this.readFile.output.write(`${line}\n`);
      }

      // コードブロックの中(コードの終わりを見つける)
    } else {
      // 最初の文字がない、もしくはスペースの場合はまだコード内
      const isEmpty = !firstWord;
      const isSpace = (line.substr(0, 1) == " ");
      const endTag = (line.substr(0, 3) == "</>");
      const isEnd = (!(isEmpty || isSpace) || endTag);

      // 最初の文字がある場合はコードおしまい
      if (isEnd == true) {
        // コードブロック終了文字の挿入
        let insertLine = `\`\`\`\`\n\n${line}\n`
        if (endTag) {
          insertLine = `\`\`\`\`\n`
        }
        this.readFile.output.write(insertLine);

        // コード内フラグを戻す
        this.isCodeLine = false;
      } else {
        //　コード内の行頭スペース削除(paperで4文字スペース入る仕様になっている)
        const textLength = line.length;
        const newLine = line.substr(4, textLength - 4);
        this.readFile.output.write(`${newLine}\n`);
      }
    }



  }

  onClose() {
    (async () => {
      // 新しいファイルの内容を取得
      const replacedText = await this.readFileContents(this.outputPath);
      // 古いファイルを新しい内容で上書き
      await this.writeFileContents(this.inputPath, replacedText);
      // 新しいファイル(一時ファイル)を削除
      await this.deleteFile(this.outputPath);
      // console.log("complete");
    })();


  }

  readFileContents(filePath) {
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    });
  }

  writeFileContents(filePath, data) {
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  deleteFile(filePath) {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          reject(err);
        }
        resolve();
      });
    });
  }

}

/**
 * 指定したフォルダ配下のファイルのパスを取得 (同期版)
 * 
 * @param  {String} dir - このパスの配下を検索
 * @param  {String|Array<String>} suffix - (option) ファイル名のサフィックス(拡張子とかを想定)
 * @return {Array<String>} ヒットしたファイルのフルパスの一覧
 */
function walkSync(dir, suffix) {
  let results = [];
  let list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    let stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(walkSync(file, suffix));
    } else {
      // NOTE: append files with specified suffix:
      if (!suffix || suffix.length <= 0 || _hasSuffix(file, suffix)) {
        results.push(file);
      }
    }
  });
  return results;

  function _hasSuffix(filename, list) {
    if (typeof list === "string") {
      return filename.endsWith(list);
    } else if (Array.isArray(list)) {
      for (let len = list.length, i = 0; i < len; i++) {
        const suffix = list[i];
        if (filename.endsWith(suffix)) {
          return true;
        }
      }
    }
    return false;
  }
}


(async ()=>{
  const blogPath = path.join(".", "blog");
  const blogFiles = walkSync(blogPath);
  for await (const file of blogFiles){
    const ext = path.extname(file);
    if(ext == ".md"){
      const fp = new FileProcessor(file);
      console.log(file)
      await fp.do();
    }
  }

  const zennPath = path.join(".", "articles");
  const zennFiles = walkSync(zennPath);
  let filst = false
  for await (const file of zennFiles){
    const ext = path.extname(file);
    if(ext == ".md" && filst == false){
      // filst = true;
      const fp = new FileProcessor(file);
      console.log(file)
      await fp.do();
    }
  }

  
})();
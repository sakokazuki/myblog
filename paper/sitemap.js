const articles = require('./paper.config').articles
const fs = require('fs');
const path = require('path')
const { promisify } = require('util')

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




/*---------------
  execute
-----------------*/
(async () => {
  const siteInfo = articles.map((article) => {
    const id = article.id.substr(0, 5)
    return `<url>
  <loc>https://biwanoie.tokyo/${id}/</loc>
  <priority>0.8</priority>
  <changefreq>weekly</changefreq>
</url>`
  });
  const siteMap = siteInfo.join('\n');
  let siteMapData = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">

<!--  created with free sitemap generation system www.sitemapxml.jp  -->
${siteMap}
</urlset>
`
  const filePath = path.join(__dirname, "../blog/.vuepress/public", "sitemap.xml");
  console.log(filePath)
  await writeFile(filePath, siteMapData);

})();



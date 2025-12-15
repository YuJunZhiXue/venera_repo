# 风车漫画源编写指南 📚

## 项目概述

`fengchemh.js` 是为 Venera 应用设计的漫画源，用于爬取 [风车漫画](https://www.fengchemh.com/) 网站的漫画内容。

---

## 网站分析 🔍

### 网站特点
- ✅ 使用 Cloudflare 防护（已处理）
- ✅ 静态 HTML 结构清晰
- ⚠️ 章节图片使用加密传输（LzString + CryptoJS）
- ✅ 支持多分类和搜索

### 网站结构

#### 首页：`https://www.fengchemh.com/`
```html
<!-- 漫画卡片容器 -->
<div class="img-wrapper lazyload img-wrapper-pic" 
     data-original="https://cover1.baozimh.org/..." 
     data-background="...">
</div>
<h3><a href="/comic/zv0bRV7X0J">漫画标题</a></h3>
```

#### 分类页面：`https://www.fengchemh.com/category/list/{categoryId}`
- `1` = 国产漫画
- `2` = 日本漫画  
- `3` = 韩国漫画
- `4` = 欧美漫画

#### 搜索页面：`https://www.fengchemh.com/search?key={keyword}&page={pageNum}`

#### 漫画详情：`https://www.fengchemh.com/comic/{comicId}`
```html
<!-- 章节列表 -->
<div class="episode-box">
  <a href="/chapter/4gbr9seXzK.html">第1话</a>
  <a href="/chapter/KNg2ahWEjE.html">第2话</a>
  <!-- ... -->
</div>
```

#### 章节页面：`https://www.fengchemh.com/chapter/{chapterId}.html`
```html
<script>
  var params = 'wOfvn3dIjI5niqKK...'; // 加密的图片数据
  var tpl_path = '/template/pc/fengchemanhua/';
</script>
<script src="/packs/js/crypto-js.min.js"></script>
<script src="/template/pc/fengchemanhua/js/pic-v2.js"></script>
```

---

## 编写步骤 ✍️

### 第1步：完成 `parseComicItem()` 函数

**任务**：解析单个漫画卡片，提取 ID、标题、封面

**需要完成的代码**：

```javascript
parseComicItem(element) {
    try {
        // TODO 1: 获取漫画链接和ID
        // 提示：querySelector("a[href*='/comic/']") 获取链接
        // 然后 split("/").pop() 提取最后的 ID 部分
        const linkElement = element.querySelector("a[href*='/comic/']");
        if (!linkElement) return null;
        const href = linkElement.attributes["href"] || "";
        const id = href.split("/").pop();
        
        // TODO 2: 获取漫画标题
        // 提示：querySelector("h3 > a") 找到标题链接
        const titleElement = element.querySelector("h3 > a");
        const title = titleElement ? titleElement.text.trim() : "";
        
        // TODO 3: 获取漫画封面
        // 提示：查找 .img-wrapper 元素，获取 data-original 或 data-background 属性
        const imgWrapper = element.querySelector(".img-wrapper");
        let cover = "";
        if (imgWrapper) {
            cover = imgWrapper.attributes["data-original"] || 
                   imgWrapper.attributes["data-background"] || "";
        }
        
        if (!id || !title) return null;
        
        return new Comic({
            id: id,
            title: title,
            cover: cover || "",
            description: ""
        });
    } catch (e) {
        return null;
    }
}
```

**测试方法**：
```bash
# 访问首页，查看 Chrome DevTools 中的 HTML 结构
curl -s https://www.fengchemh.com/ | grep -A 5 "img-wrapper"
```

---

### 第2步：完成 `explore` 探索页面加载

**任务**：实现首页漫画列表加载

**需要完成的代码**：

```javascript
load: async (page) => {
    // 1. 获取首页 HTML
    const response = await Network.get(
        "https://www.fengchemh.com/", 
        {}, 
        this.headers
    );
    
    if (response.status !== 200) {
        throw `HTTP ${response.status}`;
    }
    
    // 2. 解析 HTML
    const document = new HtmlDocument(response.body);
    
    // 3. 查找漫画容器
    // 提示：使用选择器找到所有漫画卡片
    // 观察网页：<a href="/comic/XXX"> 的父容器
    const elements = document.querySelectorAll("a[href*='/comic/']");
    
    // 4. 提取每个漫画的信息
    const comics = [];
    for (let el of elements) {
        const parent = el.parentElement;
        if (!parent) continue;
        
        const comic = this.parseComicItem(parent);
        if (comic) comics.push(comic);
    }
    
    return {
        comics: comics,
        maxPage: 1  // 首页只有1页
    };
}
```

---

### 第3步：完成 `categoryComics` 分类加载

**任务**：实现分类页面漫画列表加载

**关键点**：
- 分类 URL：`/category/list/{categoryId}?page={pageNum}`
- 使用与首页相同的 HTML 结构

**实现思路**：
```javascript
load: async (category, param, options, page) => {
    const categoryId = category;
    const url = `https://www.fengchemh.com/category/list/${categoryId}?page=${page}`;
    
    const response = await Network.get(url, {}, this.headers);
    // ... 与 explore 类似的解析逻辑
    
    // 检测最大页数：可以通过搜索分页元素或结果数量判断
}
```

---

### 第4步：完成 `search` 搜索功能

**任务**：实现搜索功能

**关键点**：
- 搜索 URL：`/search?key={keyword}&page={pageNum}`
- 需要 URL 编码关键词：`encodeURIComponent(keyword)`

**实现思路**：
```javascript
load: async (keyword, options, page) => {
    const encodedKeyword = encodeURIComponent(keyword);
    const url = `https://www.fengchemh.com/search?key=${encodedKeyword}&page=${page}`;
    
    // ... 与分类页面类似的解析逻辑
}
```

---

### 第5步：完成 `comicDetail` 漫画详情加载

**任务**：加载漫画详情和章节列表

**需要提取**：
1. 漫画标题、描述、封面
2. 所有章节的 ID 和标题

**关键 HTML 结构**：
```html
<!-- 章节列表容器 -->
<div class="episode-box scrollbar">
  <a href="/chapter/4gbr9seXzK.html">第1话</a>
  <a href="/chapter/KNg2ahWEjE.html">第2话</a>
  <!-- ... -->
</div>
```

**提示**：
- 使用 `querySelectorAll("a[href*='/chapter/']")` 获取所有章节链接
- 从 `href` 中提取章节 ID（移除 `.html` 后缀）
- 使用 `el.text.trim()` 获取章节标题
- **重要**：需要 `reverse()` 翻转章节列表（因为网站按降序排列）

---

### 第6步：处理图片加密 ⚠️

**这是最复杂的部分！**

#### 网站加密方式
网站使用 **LzString + CryptoJS** 加密图片列表：

```html
<script>
  var params = 'wOfvn3dIjI5niqKK8GaW+y3P0QR82DUnXvYuUOhY...'; // Base64 编码的加密数据
  var tpl_path = '/template/pc/fengchemanhua/';
</script>
<script src="/packs/js/crypto-js.min.js"></script>
<script src="/template/pc/fengchemanhua/js/pic-v2.js"></script>
```

#### 解密步骤

1. **从 HTML 中提取 `params` 字符串**
   ```javascript
   // 使用正则表达式匹配
   const match = response.body.match(/var\s+params\s*=\s*['"]([^'"]+)['"]/);
   if (!match) throw "未找到 params";
   const encryptedParams = match[1];
   ```

2. **Base64 解码**
   ```javascript
   const decoded = Convert.decodeBase64(encryptedParams);
   ```

3. **使用 CryptoJS 解密**
   - 网站可能使用的密钥和算法：
     - AES 加密
     - DES 加密
     - 其他对称加密

   ```javascript
   // 示例（需要确定实际的密钥和算法）
   const decrypted = Convert.decrypt(decoded, key, "aes");
   ```

4. **解析 JSON**
   ```javascript
   const data = JSON.parse(decrypted);
   const images = data.images; // 图片 URL 列表
   ```

#### 如何找出正确的密钥和算法

1. 打开网站，进入一个章节页面
2. 打开 Chrome DevTools（F12）
3. 在 Console 中执行已加载的 JavaScript
4. 查看 `pic-v2.js` 文件，找到解密逻辑
5. 检查 `CryptoJS` 的配置和密钥

**临时解决方案**（如果无法解密）：
- 使用 Puppeteer 或 Playwright 来渲染页面
- 等待 JavaScript 执行并解密
- 从 DOM 中提取最终的图片 URL

---

## Cloudflare 反爬虫处理 🛡️

### 当前方案（已实现）
在 `headers` 中添加：
```javascript
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
"Referer": "https://www.fengchemh.com/",
"Accept": "text/html,application/xhtml+xml,...",
```

### 如果仍然被 Cloudflare 拦截
1. **增加延迟**：
   ```javascript
   await new Promise(resolve => setTimeout(resolve, 2000)); // 延迟 2 秒
   ```

2. **使用代理**：
   ```javascript
   Network.get(url, {
       proxy: "http://proxy.example.com:8080"
   }, headers);
   ```

3. **使用浏览器渲染**（如果 Venera 支持）：
   - 使用 Puppeteer 或 Playwright 库
   - 等待页面完全加载

---

## 调试技巧 🐛

### 1. 测试网络请求
```javascript
// 在浏览器 Console 中测试
const response = await Network.get("https://www.fengchemh.com/");
console.log(response.status);
console.log(response.body.substring(0, 200));
```

### 2. 测试 HTML 解析
```javascript
const document = new HtmlDocument(response.body);
const elements = document.querySelectorAll("a[href*='/comic/']");
console.log(elements.length); // 应该 > 0
```

### 3. 使用日志
```javascript
// 在代码中添加日志
console.log(`找到 ${comics.length} 部漫画`);
console.log(`第一部漫画：${comics[0].title}`);
```

---

## 文件结构总结 📁

```
fengchemh.js
├── headers()              → 获取请求头，处理 Cloudflare
├── parseComicItem()       → 解析单个漫画卡片
├── explore[]              → 首页探索页面
│   └── load()            → 加载首页漫画列表
├── category              → 分类页面配置
│   └── parts[]           → 4 个分类：国产、日本、韩国、欧美
├── categoryComics        → 分类漫画加载
│   └── load()           → 加载分类页面漫画
├── search               → 搜索功能
│   └── load()           → 加载搜索结果
├── comicDetail          → 漫画详情
│   └── load()           → 加载漫画信息和章节列表
└── chapterImages        → 章节图片加载
    └── load()           → 解密并加载章节图片
```

---

## 参考资源 📖

### Venera API 文档
- `Network.get(url, headers?, customHeaders?)` - GET 请求
- `Network.post(url, headers?, body)` - POST 请求
- `HtmlDocument(html)` - HTML 解析器
- `new Comic({id, title, cover, ...})` - 漫画对象
- `new Chapter({id, title, order})` - 章节对象
- `Convert.decodeBase64(string)` - Base64 解码
- `Convert.decrypt(data, key, algorithm)` - 解密

### 现有源代码参考
- `baozi.js` - 简单的源实现
- `copy_manga.js` - 复杂的加密处理示例
- `mh1234.js` - 多分类实现示例

---

## 常见问题 ❓

**Q: 如何处理 Cloudflare 挑战？**
A: 当前实现使用标准的浏览器 User-Agent 和 Referer，通常足以绕过 Cloudflare。如果不行，可以考虑使用 Puppeteer 渲染页面。

**Q: 图片加密如何解决？**
A: 需要逆向 `pic-v2.js` 文件，找出加密的密钥和算法。或者使用浏览器渲染后再提取。

**Q: 如何测试编写的源？**
A: 将 `fengchemh.js` 放入 Venera 应用的源目录，然后在 App 中测试各个功能。

**Q: 如果网站结构变化怎么办？**
A: 需要重新分析网站的 HTML 结构，更新选择器和解析逻辑。

---

## 下一步行动 🚀

1. ✅ 完成 `parseComicItem()` 和 `explore` 的加载
2. ✅ 实现 `categoryComics` 和 `search`
3. ✅ 实现 `comicDetail` 章节列表加载
4. ⚠️ **最难部分**：破解 `chapterImages` 的图片加密
5. 测试整个流程
6. 修复 BUG 和优化性能

祝你编写顺利！💪


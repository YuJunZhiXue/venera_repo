# 🎨 风车漫画源（Fengche Manga Source）

## 📖 项目描述

这是为 **Venera** 漫画阅读应用编写的**风车漫画**网站的数据源。通过本源，Venera 应用可以：

- ✅ 浏览首页推荐漫画
- ✅ 按地区分类浏览（国产、日本、韩国、欧美）
- ✅ 搜索漫画
- ✅ 查看漫画详情和章节列表
- ⏳ 加载章节图片（需要完成加密解析）

**网站**：https://www.fengchemh.com/

---

## 📁 文件说明

| 文件 | 用途 |
|------|------|
| `fengchemh.js` | 主要的漫画源实现文件 |
| `FENGCHEMH_GUIDE.md` | **详细的编写指南**（强烈推荐阅读）|
| `FENGCHEMH_README.md` | 本文件，快速入门指南 |

---

## 🚀 快速开始

### 第一步：了解项目结构

打开 `fengchemh.js`，你会看到以下主要部分：

```javascript
class FengcheManga extends ComicSource {
    // 1. 基础属性（已完成）
    name, key, version, url
    
    // 2. 请求头设置（已完成）- 用于处理 Cloudflare
    get headers()
    
    // 3. 解析器（已完成）- 解析单个漫画卡片
    parseComicItem(element)
    
    // 4. 探索页面（90% 完成）- 首页推荐
    explore[]
    
    // 5. 分类配置（已完成）- 设置 4 个分类
    category
    
    // 6. 分类加载（需要完成）- 加载分类漫画
    categoryComics = { load() }
    
    // 7. 搜索功能（需要完成）- 搜索漫画
    search = { load() }
    
    // 8. 漫画详情（需要完成）- 获取章节列表
    comicDetail = { load() }
    
    // 9. 图片加载（需要完成）- **最难部分**，需要解密
    chapterImages = { load() }
}
```

### 第二步：完成剩余功能

下面是各个功能的完成难度和优先级：

| 功能 | 难度 | 优先级 | 状态 |
|------|------|--------|------|
| `headers` | ⭐ | 1 | ✅ 完成 |
| `parseComicItem` | ⭐ | 2 | ✅ 完成 |
| `explore.load` | ⭐⭐ | 3 | 🟡 90% |
| `category` | ⭐ | 4 | ✅ 完成 |
| `categoryComics.load` | ⭐⭐ | 5 | ⏳ 需要完成 |
| `search.load` | ⭐⭐ | 6 | ⏳ 需要完成 |
| `comicDetail.load` | ⭐⭐ | 7 | 🟡 50% |
| `chapterImages.load` | ⭐⭐⭐⭐ | 8 | ❌ 待实现 |

---

## 💻 实现步骤

### 步骤 1: 验证首页加载功能（最简单）

**文件**：`fengchemh.js` 中的 `explore[0].load()`

**代码状态**：70% 完成，需要微调选择器

**任务**：
1. 打开 https://www.fengchemh.com/
2. 打开 Chrome DevTools（F12）
3. 在 Console 中查看漫画卡片的 HTML 结构
4. 更新 `querySelectorAll()` 的选择器，确保能找到所有漫画

**预期结果**：
```javascript
const comicLinks = document.querySelectorAll("a[href*='/comic/']");
comicLinks.length > 0  // 应该返回很多结果
```

---

### 步骤 2: 完成分类加载（简单）

**文件**：`fengchemh.js` 中的 `categoryComics.load()`

**代码状态**：0%，但大部分逻辑已在 `explore.load()` 中

**任务**：
复制 `explore.load()` 的代码，修改 URL：
```javascript
const url = `https://www.fengchemh.com/category/list/${category}?page=${page}`;
```

**关键参数**：
- `category`: "1"(国产), "2"(日本), "3"(韩国), "4"(欧美)
- `page`: 页码（从配置传入）

---

### 步骤 3: 完成搜索功能（简单）

**文件**：`fengchemh.js` 中的 `search.load()`

**代码状态**：0%

**任务**：
使用相同的逻辑，但 URL 为：
```javascript
const encodedKeyword = encodeURIComponent(keyword);
const url = `https://www.fengchemh.com/search?key=${encodedKeyword}&page=${page}`;
```

**关键函数**：`encodeURIComponent()` 用于 URL 编码关键词

---

### 步骤 4: 完成漫画详情加载（中等）

**文件**：`fengchemh.js` 中的 `comicDetail.load()`

**代码状态**：50% 完成

**需要完成**：
1. 提取漫画标题、描述、封面（从详情页 HTML）
2. 已有章节列表提取的代码

**关键 HTML 结构**：
```html
<!-- 漫画标题和描述在哪里？-->
<h1>漫画标题</h1>
<p>漫画描述</p>
<!-- 封面图片 -->
<img src="..." />
```

**提示**：
打开 https://www.fengchemh.com/comic/zv0bRV7X0J 查看实际的 HTML 结构

---

### 步骤 5: 解密章节图片（最难）

**文件**：`fengchemh.js` 中的 `chapterImages.load()`

**难度**：⭐⭐⭐⭐⭐

**问题**：网站对图片列表进行了加密，需要：
1. 从 HTML 中提取加密的 `params` 字符串
2. 使用 Base64 解码
3. 使用 CryptoJS 解密（需要找出正确的密钥和算法）
4. 解析 JSON 获取图片 URL

**目前的挑战**：
- ❓ 不知道加密的密钥
- ❓ 不知道加密的算法（AES? DES? 其他？）
- ❓ 不知道 LzString 的角色

**解决方案（按优先级）**：

**方案A**：逆向 `pic-v2.js` 文件（推荐）
```bash
# 1. 下载 pic-v2.js
wget https://www.fengchemh.com/template/pc/fengchemanhua/js/pic-v2.js

# 2. 查看加密逻辑
cat pic-v2.js | grep -i "decrypt\|encrypt\|key"
```

**方案B**：使用浏览器渲染（备选）
```javascript
// 使用 Puppeteer 或 Playwright 打开网页
// 等待 JavaScript 解密并执行
// 从 DOM 中获取最终的图片 URL
// 注意：Venera 可能不支持这种方法
```

**方案C**：抓包分析（技术方法）
```
1. 打开 Chrome DevTools
2. 进入 Network 标签
3. 刷新章节页面
4. 查看 XHR 请求，找到图片列表的 API
5. 分析请求参数和响应格式
```

---

## 📚 代码参考示例

### 示例 1: 简单的网络请求

```javascript
// GET 请求
const response = await Network.get(
    "https://www.fengchemh.com/",
    {},  // 额外的 headers（可选）
    this.headers  // 自定义 headers
);

// 检查响应
if (response.status !== 200) {
    throw `HTTP Error: ${response.status}`;
}

// 解析 HTML
const document = new HtmlDocument(response.body);
const elements = document.querySelectorAll("a");
```

### 示例 2: 循环去重

```javascript
const comics = [];
const seenIds = new Set();

for (let element of elements) {
    const comic = this.parseComicItem(element);
    if (comic && !seenIds.has(comic.id)) {
        comics.push(comic);
        seenIds.add(comic.id);
    }
}
```

### 示例 3: 创建 Comic 对象

```javascript
new Comic({
    id: "zv0bRV7X0J",
    title: "作为假圣女，却被众人迷恋？",
    cover: "https://cover1.baozimh.org/...",
    description: "漫画描述（可选）",
    tags: ["悬疑", "恋爱"]  // 可选
})
```

### 示例 4: 创建 Chapter 对象

```javascript
new Chapter({
    id: "4gbr9seXzK",
    title: "第1话",
    order: 1  // 章节顺序（可选）
})
```

---

## 🔍 测试方法

### 测试首页加载

```javascript
// 在 Venera 应用中测试
1. 进入"源设置"
2. 选择"风车漫画"
3. 点击首页
4. 观察是否能加载漫画列表
5. 查看日志了解错误信息
```

### 测试 HTML 解析

```javascript
// 在浏览器 Console 中测试
const html = document.documentElement.outerHTML;
const doc = new HtmlDocument(html);
const links = doc.querySelectorAll("a[href*='/comic/']");
console.log(links.length);  // 应该 > 0
```

---

## 🛠️ 常见问题排查

### 问题 1: 首页加载返回空列表

**可能原因**：
- ❌ HTML 选择器不正确
- ❌ 网站结构已改变

**解决方法**：
1. 访问 https://www.fengchemh.com/
2. F12 打开 DevTools
3. 查找实际的 HTML 结构
4. 更新 `querySelectorAll()` 的选择器

### 问题 2: Cloudflare 挑战页面

**表现**：`response.status !== 200` 或返回 Cloudflare 的挑战页面

**解决方法**：
1. 检查 User-Agent 是否正确
2. 添加 Referer header
3. 如果仍不行，考虑使用代理或延迟

### 问题 3: 图片无法加载

**可能原因**：
- ❌ 加密未正确解析
- ❌ 密钥或算法错误

**解决方法**：
- 逆向 `pic-v2.js` 找出加密逻辑
- 或使用浏览器渲染方案

---

## 📖 相关文档

### Venera API 文档
- `Network.get(url, headers?, customHeaders?)`
- `Network.post(url, headers?, body)`
- `HtmlDocument(html)` - DOM 解析器
- `new Comic({...})`
- `new Chapter({...})`
- `new ComicDetail({...})`

### Convert API（加密/解密）
- `Convert.encodeBase64(bytes)`
- `Convert.decodeBase64(string)`
- `Convert.encodeUtf8(string)`
- `Convert.decodeUtf8(bytes)`
- `Convert.decrypt(data, key, algorithm)`

### 参考源代码
- `baozi.js` - 简单源
- `copy_manga.js` - 复杂源（有加密）
- `mh1234.js` - 分类源

---

## ✅ 完成清单

- [ ] 理解项目结构
- [ ] 完成 `explore.load()` 的微调
- [ ] 完成 `categoryComics.load()`
- [ ] 完成 `search.load()`
- [ ] 完成 `comicDetail.load()` 的详情提取
- [ ] **破解** `chapterImages.load()` 的加密
- [ ] 在 Venera 应用中测试所有功能
- [ ] 修复 BUG 和优化性能

---

## 💡 建议

1. **先从简单的开始**：完成 `explore`、`category` 和 `search`
2. **使用 GitHub Copilot**：让 AI 帮助代码补全
3. **参考现有源**：查看 `baozi.js` 和 `copy_manga.js`
4. **利用浏览器工具**：用 DevTools 分析页面结构
5. **保持沟通**：遇到问题可以查看 Venera 社区

---

## 📞 需要帮助？

如果卡在某个步骤，可以：
1. 查看 `FENGCHEMH_GUIDE.md` 了解更详细的说明
2. 分析现有的漫画源代码（baozi.js, copy_manga.js）
3. 使用 Chrome DevTools 分析网页结构
4. 在 Venera 社区寻求帮助

---

祝你编写顺利！🚀


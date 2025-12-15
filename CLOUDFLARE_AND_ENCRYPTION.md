# 🛡️ Cloudflare 和图片加密处理指南

## 🌐 Cloudflare 防爬虫处理

### 问题分析

网站 https://www.fengchemh.com/ 使用 Cloudflare 提供的 DDoS 防护和爬虫检测。

```
HTTP Response Headers:
server: cloudflare
cf-ray: 9ae2e023fa708f4b-ORD
```

### 当前解决方案（已实现）

在 `fengchemh.js` 的 `headers` 属性中：

```javascript
get headers() {
    return {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...",
        "Referer": "https://www.fengchemh.com/",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,...",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1"
    }
}
```

**这样做的原因**：
- ✅ 模拟真实的浏览器请求
- ✅ 提供正确的 User-Agent
- ✅ 添加常见的浏览器 headers
- ✅ 欺骗 Cloudflare 认为这是浏览器而不是爬虫

### 如果被 Cloudflare 阻止

#### 症状
```
HTTP 403 - Forbidden
or
HTTP 429 - Too Many Requests
or
返回 Cloudflare 的挑战页面 HTML
```

#### 解决方案优先级

**1. 添加延迟（最简单）**
```javascript
async load() {
    await new Promise(resolve => setTimeout(resolve, 2000)); // 2秒延迟
    const response = await Network.get(url, {}, this.headers);
}
```

**2. 轮换 User-Agent（中等）**
```javascript
static getUserAgent() {
    const agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) Firefox/121.0"
    ];
    return agents[Math.floor(Math.random() * agents.length)];
}
```

**3. 使用代理（困难，可能不支持）**
```javascript
// Venera 可能不支持代理参数
const response = await Network.get(url, { proxy: "..." }, this.headers);
```

**4. 使用浏览器渲染（最后手段）**
- 使用 Puppeteer 或 Playwright
- Venera 可能不支持，需要查阅文档
- 资源消耗大，速度慢

---

## 🔐 图片加密解密指南

### 问题分析

章节页面使用以下方式加密图片列表：

```html
<script>
  // 这是加密的图片数据（Base64 编码）
  var params = 'wOfvn3dIjI5niqKK8GaW+y3P0QR82DUnXvYuUOhYCAfUuKamkAq9N6EM...';
  var tpl_path = '/template/pc/fengchemanhua/';
</script>
<script src="/packs/js/crypto-js.min.js"></script>
<script src="/template/pc/fengchemanhua/js/pic-v2.js"></script>
```

### 加密流程推测

```
原始图片数据 (JSON)
    ↓
JSON.stringify()
    ↓
加密 (CryptoJS - 算法和密钥待确定)
    ↓
LzString 压缩?
    ↓
Base64 编码
    ↓
赋值给 params 变量
```

### 破解方法

#### 方法 1：逆向 pic-v2.js（推荐）

**步骤 1：下载脚本**
```bash
wget https://www.fengchemh.com/template/pc/fengchemanhua/js/pic-v2.js -O pic-v2.js
```

**步骤 2：查找解密代码**
```bash
# 查找关键字
grep -n "decrypt\|CryptoJS\|LzString" pic-v2.js

# 查找变量赋值
grep -n "params\|images\|url" pic-v2.js

# 查找函数定义
grep -n "function\|const.*=.*function" pic-v2.js
```

**步骤 3：分析代码结构**

典型的解密代码看起来像：
```javascript
// 可能的解密代码结构
function decryptImages(params) {
    // 1. Base64 解码
    let decoded = atob(params);
    
    // 2. 使用 CryptoJS 解密
    let decrypted = CryptoJS.AES.decrypt(decoded, key, options);
    
    // 3. 可能包含 LzString 解压
    let decompressed = LzString.decompress(decrypted);
    
    // 4. 解析 JSON
    return JSON.parse(decompressed);
}
```

**步骤 4：找出密钥**

查看脚本中的密钥定义：
```javascript
// 可能的密钥位置
const SECRET_KEY = "...";
const KEY = CryptoJS.enc.Utf8.parse("...");
const IV = CryptoJS.enc.Utf8.parse("...");
```

#### 方法 2：使用浏览器开发者工具

**步骤 1：打开章节页面**
```
1. 访问 https://www.fengchemh.com/chapter/4gbr9seXzK.html
2. F12 打开 DevTools
3. 进入 Console 标签
```

**步骤 2：尝试调用解密函数**
```javascript
// 在 Console 中尝试
console.log(typeof CryptoJS); // 应该返回 'object'
console.log(typeof LzString);  // 应该返回 'object'

// 尝试找到解密函数
// 可能的名称：decrypt(), decryptImage(), getImages() 等
// 查看 window 对象中的所有函数
Object.keys(window).filter(k => k.includes('decrypt') || k.includes('image'))
```

**步骤 3：手动解密**
```javascript
// 假设已知密钥和算法
let params = "wOfvn3dIjI5niqKK..."; // 从 HTML 中复制

// Base64 解码
let decoded = atob(params);

// 使用 CryptoJS 解密（需要知道密钥）
let decrypted = CryptoJS.AES.decrypt(
    decoded,
    CryptoJS.enc.Utf8.parse("YOUR_KEY_HERE"),
    { iv: CryptoJS.enc.Utf8.parse("YOUR_IV_HERE") }
);

// 转换为字符串
let text = decrypted.toString(CryptoJS.enc.Utf8);

// 可能需要 LzString 解压
let final = LzString.decompress(text);

// 解析 JSON
let data = JSON.parse(final);
console.log(data.images); // 应该看到图片 URL 列表
```

#### 方法 3：抓包分析

**步骤 1：打开 Fiddler 或 Charles**

**步骤 2：刷新章节页面**

**步骤 3：查找相关请求**
```
可能的 API 端点：
- /api/chapter/{chapterId}/images
- /api/images/{chapterId}
- /chapter/{chapterId}/images.json
```

**步骤 4：检查请求/响应**
- 检查是否有直接的 API 请求获取图片
- 分析请求参数和响应格式
- 如果有 API，可以直接调用而不需要解密

---

## 💻 实现解密的代码示例

### 示例 1：AES-256 解密

```javascript
chapterImages = {
    load: async (chapterId) => {
        const url = `https://www.fengchemh.com/chapter/${chapterId}.html`;
        const response = await Network.get(url, {}, this.headers);
        
        // 1. 从 HTML 中提取 params
        const match = response.body.match(/var\s+params\s*=\s*['"]([^'"]+)['"]/);
        if (!match) throw "未找到 params";
        const encryptedData = match[1];
        
        // 2. Base64 解码
        const decoded = Convert.decodeBase64(encryptedData);
        
        // 3. 使用密钥解密（AES）
        const key = "your-secret-key-here";
        const decrypted = Convert.decrypt(decoded, key, "aes");
        
        // 4. 如果使用了 LzString 压缩，需要解压
        // const decompressed = LzString.decompress(decrypted);
        
        // 5. 解析 JSON
        const data = JSON.parse(decrypted);
        
        // 6. 提取图片 URL
        const images = data.images || data.pics || data.list || [];
        
        return { images: images };
    }
}
```

### 示例 2：DES 解密

```javascript
const decrypted = Convert.decrypt(decoded, key, "des");
```

### 示例 3：自定义解密逻辑

```javascript
// 如果加密使用了特殊的逻辑（不是标准的 CryptoJS）
function customDecrypt(data, key) {
    // 实现自定义的解密逻辑
    // 这需要根据 pic-v2.js 中的实现来编写
}
```

---

## 🔍 关键文件位置

### 网站上的加密脚本

```
脚本文件：
- /packs/js/crypto-js.min.js       - CryptoJS 库
- /template/pc/fengchemanhua/js/pic-v2.js  - 解密逻辑（★关键）
- /packs/mccms/base.js             - 基础脚本

样式文件：
- /template/pc/fengchemanhua/css/  - CSS 样式
```

### 关键 JavaScript 位置

```html
<!-- 在每个章节页面底部 -->
<script>
  var Mcpath = {url:'www.fengchemh.com', ...};
  var params = '...';  // ★ 加密的图片数据
  var tpl_path = '/template/pc/fengchemanhua/';
</script>
<script src="/packs/js/crypto-js.min.js"></script>
<script src="/template/pc/fengchemanhua/js/pic-v2.js"></script>
<script src="/packs/js/crypto-js.min.js"></script>
<script src="/template/pc/fengchemanhua/js/pic-v2.js"></script>
```

---

## ⚠️ 常见陷阱

### 陷阱 1：密钥不对

**症状**：
```
解密后得到乱码或错误的数据
```

**解决**：
- 确保从 `pic-v2.js` 中复制了正确的密钥
- 检查密钥的编码方式（UTF-8? Hex?）
- 尝试不同的密钥组合

### 陷阱 2：算法不对

**症状**：
```
报错：CryptoJS 不支持该算法
```

**可能的算法**：
- AES（最常见）
- DES / 3DES
- RC4
- Blowfish

### 陷阱 3：没有处理 LzString

**症状**：
```
解密后是压缩的乱码
```

**解决**：
- 检查 HTML 中是否加载了 LzString 库
- 如果加载了，需要在解密后调用解压函数

### 陷阱 4：编码问题

**症状**：
```
JSON.parse() 失败
```

**解决**：
- 检查解密后的数据编码
- 尝试使用 `Convert.decodeUtf8()` 转换

---

## 🧪 测试解密

### 测试步骤

1. **准备测试数据**
   ```javascript
   const testParams = "wOfvn3dIjI5niqKK8GaW+y3P0QR82DUnXvYuUOhY...";
   ```

2. **逐步测试**
   ```javascript
   // 步骤1：Base64 解码
   const decoded = Convert.decodeBase64(testParams);
   console.log("Base64 解码后长度:", decoded.length);
   
   // 步骤2：解密
   try {
       const decrypted = Convert.decrypt(decoded, KEY, "aes");
       console.log("解密成功，长度:", decrypted.length);
   } catch (e) {
       console.error("解密失败:", e);
   }
   
   // 步骤3：解析 JSON
   try {
       const data = JSON.parse(decrypted);
       console.log("JSON 解析成功，图片数量:", data.images?.length);
   } catch (e) {
       console.error("JSON 解析失败:", e);
   }
   ```

3. **检查结果**
   ```javascript
   // 应该看到类似这样的结构
   {
       "images": [
           "https://image1.example.com/...",
           "https://image2.example.com/...",
           ...
       ]
   }
   ```

---

## 📊 尝试的密钥和算法清单

如果不知道正确的密钥，可以尝试这些常见的值：

```javascript
// 常见密钥格式
const keys = [
    "fengchemh",
    "fengche",
    "fc2024",
    "fengchemanhua",
    "venera",
    "", // 空密钥
    // ... 其他可能的密钥
];

// 常见算法
const algorithms = ["aes", "des", "3des", "rc4"];

// 测试所有组合
for (const key of keys) {
    for (const algo of algorithms) {
        try {
            const result = Convert.decrypt(decoded, key, algo);
            const json = JSON.parse(result);
            if (json.images) {
                console.log(`找到了！密钥: ${key}, 算法: ${algo}`);
                return json.images;
            }
        } catch (e) {
            // 继续尝试下一个
        }
    }
}
```

---

## 📞 遇到问题时

1. **先查看 `pic-v2.js`**
   - 这是破解加密的关键文件
   - 所有答案都在里面

2. **在浏览器 Console 中调试**
   - 直接运行 JavaScript 测试
   - 可以实时看到结果

3. **使用抓包工具**
   - 看看是否有直接的 API 调用
   - 可能不需要复杂的解密逻辑

4. **考虑使用浏览器渲染**
   - 如果实在破解不了，用浏览器帮你解密
   - 有点慢，但能用

---

**加油！破解加密是最难的部分，但一旦成功就太爽了！🎉**


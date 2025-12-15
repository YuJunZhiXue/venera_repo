# 📁 项目文件结构说明

## 风车漫画源项目文件总览

```
/home/engine/project/
├── 核心文件
│   ├── fengchemh.js                      ⭐ 主要源代码（396 行）
│   ├── index.json                         ✅ 源清单（已更新）
│   
├── 📚 文档文件（按推荐阅读顺序）
│   ├── PROJECT_STATUS.txt                 🟢 项目状态（从这里开始）
│   ├── FENGCHEMH_README.md               🟢 快速入门指南
│   ├── FENGCHEMH_GUIDE.md                🟢 详细编写指南（最重要！）
│   ├── CLOUDFLARE_AND_ENCRYPTION.md      🟢 加密处理指南
│   ├── IMPLEMENTATION_SUMMARY.md         🟢 实现总结
│   ├── FILE_STRUCTURE.md                 🟢 本文件
│   
├── 参考源代码（学习）
│   ├── baozi.js                          简单源参考
│   ├── copy_manga.js                     复杂加密源参考
│   ├── mh1234.js                         多分类源参考
│   
├── 原始文件（不需要修改）
│   ├── _template_.js                     源模板
│   ├── _venera_.js                       Venera API 文档
│   └── README.md                         原始项目说明
```

## 📖 文件详细说明

### 🔴 必读文件（按优先级）

#### 1. PROJECT_STATUS.txt（5 分钟阅读）
**作用**：了解项目现状和下一步方向
**内容**：
- 项目概览
- 文件清单
- 功能完成度（35%）
- 需要完成的工作
- 推荐阅读顺序

**何时阅读**：首先阅读这个

---

#### 2. FENGCHEMH_README.md（15-20 分钟）
**作用**：快速了解如何开始编写
**内容**：
- 项目描述
- 快速开始
- 实现步骤（按难度排序）
- 常见问题排查
- 需要帮助时的建议

**何时阅读**：了解大致流程后阅读

---

#### 3. FENGCHEMH_GUIDE.md（1-2 小时）⭐ 最重要
**作用**：逐步指导如何完成各个功能
**内容**：
- 网站分析（结构、URL 模式）
- **编写步骤**（6 个步骤）
- 参考资源
- 常见问题
- 调试技巧

**何时阅读**：开始编写之前，必须读！

---

#### 4. CLOUDFLARE_AND_ENCRYPTION.md（1 小时）
**作用**：理解和解决最难的问题：加密
**内容**：
- Cloudflare 防爬虫处理（已实现）
- 图片加密解析（需要破解）
- 4 种破解方法
- 常见陷阱
- 测试方法

**何时阅读**：需要实现 chapterImages 时

---

#### 5. IMPLEMENTATION_SUMMARY.md（30 分钟）
**作用**：了解实现细节和代码模板
**内容**：
- 完成度统计
- 需要完成的工作（分层次）
- 实现建议（3 个方案）
- 代码模板
- 测试清单

**何时阅读**：编写过程中需要参考

---

#### 6. FILE_STRUCTURE.md
**作用**：本文件，理解项目的文件组织
**何时阅读**：现在！

---

### 🔵 源代码文件

#### fengchemh.js（主要文件）
**大小**：16 KB，396 行
**完成度**：35%
**结构**：
```javascript
class FengcheManga extends ComicSource {
    // 基础属性（✅ 完成）
    name, key, version, url
    
    // Headers（✅ 完成）- Cloudflare 处理
    get headers()
    
    // 解析器（✅ 完成）- 单个漫画卡片
    parseComicItem()
    
    // 探索页面（🟡 90%）
    explore[0]
    
    // 分类配置（✅ 完成）
    category
    
    // 分类加载（🔴 0%）- 需要完成
    categoryComics
    
    // 搜索功能（🔴 0%）- 需要完成
    search
    
    // 漫画详情（🟡 50%）- 需要完成
    comicDetail
    
    // 图片加载（🔴 0%）- 最难，需要破解
    chapterImages
}
```

---

### 🟢 参考源代码

#### baozi.js
**用途**：学习简单源的实现
**推荐阅读**：开始时
**学习内容**：
- 基础的漫画源框架
- 简单的 HTML 解析
- 分类和搜索的实现

#### copy_manga.js
**用途**：学习复杂加密源的实现
**推荐阅读**：需要处理加密时
**学习内容**：
- 复杂的加密逻辑
- 动态生成 headers
- API 调用方式

#### mh1234.js
**用途**：学习多分类源的实现
**推荐阅读**：需要处理分类时
**学习内容**：
- 多个分类的处理
- 分类选项动态加载
- 复杂的 URL 结构

---

### 📋 其他文件

#### index.json
**作用**：Venera 源清单
**已做**：✅ 添加了风车漫画条目
**内容**：27 个漫画源的清单

#### _template_.js
**作用**：Venera 源模板
**用途**：参考源的完整结构
**推荐**：作为最后的参考

#### _venera_.js
**作用**：Venera API 文档
**用途**：查看 API 使用方法
**推荐**：实现具体功能时参考

#### README.md
**作用**：原始项目说明
**已做**：未修改，保持原样

---

## 📊 文件统计

| 文件 | 行数 | 大小 | 类型 | 完成度 |
|------|------|------|------|--------|
| fengchemh.js | 396 | 16K | 源代码 | 35% |
| FENGCHEMH_GUIDE.md | 413 | 12K | 文档 | 100% |
| CLOUDFLARE_AND_ENCRYPTION.md | 477 | - | 文档 | 100% |
| FENGCHEMH_README.md | 388 | 9.2K | 文档 | 100% |
| IMPLEMENTATION_SUMMARY.md | 327 | 9.6K | 文档 | 100% |
| PROJECT_STATUS.txt | - | - | 文档 | 100% |
| FILE_STRUCTURE.md | 本文 | - | 文档 | 100% |

**总计**：
- 代码：~400 行（35% 完成）
- 文档：~2000 行（100% 完成）

---

## 🎯 使用指南

### 场景 1：我是初学者，不知道从哪开始

**推荐步骤**：
1. 📖 阅读 PROJECT_STATUS.txt
2. 📖 阅读 FENGCHEMH_README.md
3. 👀 查看 fengchemh.js 代码
4. 📖 阅读 FENGCHEMH_GUIDE.md 的"编写步骤"部分
5. 💻 开始编写代码

**预计时间**：2-3 小时

---

### 场景 2：我想快速完成基础功能

**推荐步骤**：
1. 👀 查看 fengchemh.js 中的 TODO 注释
2. 📖 阅读 FENGCHEMH_GUIDE.md 的对应步骤
3. 复制示例代码并修改
4. 测试

**预计时间**：2-3 小时

---

### 场景 3：我卡在加密问题

**推荐步骤**：
1. 📖 阅读 CLOUDFLARE_AND_ENCRYPTION.md
2. 学习 4 种破解方法
3. 尝试逆向 pic-v2.js
4. 实现解密逻辑

**预计时间**：2-4 小时

---

### 场景 4：我想完全理解项目

**推荐步骤**：
1. 阅读所有文档（按顺序）
2. 深入研究源代码
3. 参考其他漫画源
4. 自己编写并测试

**预计时间**：4-6 小时

---

## 🔍 快速查找

### 我想知道...

**"项目的完成度是多少？"**
→ 查看 PROJECT_STATUS.txt

**"我应该从哪里开始？"**
→ 查看 FENGCHEMH_README.md 的"快速开始"

**"如何完成 categoryComics.load()？"**
→ 查看 FENGCHEMH_GUIDE.md 的"第2步"

**"如何处理 Cloudflare？"**
→ 查看 CLOUDFLARE_AND_ENCRYPTION.md 的第一部分

**"如何破解图片加密？"**
→ 查看 CLOUDFLARE_AND_ENCRYPTION.md 的第二部分

**"有什么代码模板吗？"**
→ 查看 IMPLEMENTATION_SUMMARY.md 的"代码模板"

**"我遇到了错误，怎么办？"**
→ 查看相关文档中的"常见问题"部分

---

## 🚀 开发流程

```
开始
 ↓
阅读 PROJECT_STATUS.txt
 ↓
阅读 FENGCHEMH_README.md
 ↓
查看 fengchemh.js
 ↓
选择功能（按难度排序）
 ↓
阅读对应的文档章节
 ↓
复制示例代码
 ↓
修改并测试
 ↓
功能完成？
 ├─ 是 → 下一个功能
 └─ 否 → 查看"常见问题"或"调试技巧"
 ↓
所有功能完成？
 ├─ 是 → ✅ 完成！
 └─ 否 → 继续上面的步骤
```

---

## 💡 最后的建议

1. **📚 文档很重要**
   - 花时间读文档比盲目写代码快
   - 所有答案都在文档里

2. **🎯 从简单开始**
   - 先完成 categoryComics 和 search
   - 再处理漫画详情
   - 最后才处理加密

3. **🧪 经常测试**
   - 每完成一个功能就测试
   - 在 Venera 应用中测试
   - 看日志了解错误

4. **🔍 学会调试**
   - 使用浏览器 DevTools
   - 查看网络请求
   - 打印日志

5. **💪 坚持下去**
   - 加密破解是最难的
   - 但有完整的指导
   - 一定能成功！

---

**祝你编写顺利！如有问题，查看相关文档即可。💪**


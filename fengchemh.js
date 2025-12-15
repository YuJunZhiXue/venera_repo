/** @type {import('./_venera_.js')} */

/**
 * 风车漫画 (Fengche Manga) - 中文漫画源
 * 网站：https://www.fengchemh.com/
 * 
 * 功能：
 * - 首页探索：热门、最新、更新
 * - 分类浏览：国产、日本、韩国、欧美漫画
 * - 搜索功能
 * - 章节列表和图片解析
 * - Cloudflare 反爬虫处理
 */

class FengcheManga extends ComicSource {
    name = "风车漫画"
    key = "fengchemh"
    version = "1.0.0"
    minAppVersion = "1.6.0"
    url = "https://www.fengchemh.com/"

    // 基础 Headers 设置 - 用于处理 Cloudflare 和反爬虫
    get headers() {
        return {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.fengchemh.com/",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        }
    }

    /**
     * 解析漫画卡片的通用函数
     * 从 HTML 元素中提取漫画信息
     * @param {HtmlElement} element - 漫画卡片容器
     * @returns {Comic|null} 返回 Comic 对象或 null
     */
    parseComicItem(element) {
        try {
            // TODO: 获取漫画链接和ID
            // 提示：查找 <a href="/comic/XXX"> 标签，提取 href 中的 ID（最后一部分）
            const linkElement = element.querySelector("a[href*='/comic/']");
            if (!linkElement) return null;
            
            const href = linkElement.attributes["href"] || "";
            const id = href.split("/").pop(); // 获取最后一部分作为 ID
            
            // TODO: 获取漫画标题
            // 提示：查找 <h3><a>...标题...</a></h3>
            const titleElement = element.querySelector("h3 > a");
            const title = titleElement ? titleElement.text.trim() : "";
            
            // TODO: 获取漫画封面
            // 提示：查找图片容器中的 data-original 或 data-background 属性
            const imgWrapper = element.querySelector(".img-wrapper");
            let cover = "";
            if (imgWrapper) {
                cover = imgWrapper.attributes["data-original"] || 
                       imgWrapper.attributes["data-background"] || "";
                // 如果是 style 中的 background-image，需要从 style 属性解析
                if (!cover) {
                    const style = imgWrapper.attributes["style"] || "";
                    const match = style.match(/url\(&quot;([^&]*)/);
                    if (match) cover = match[1];
                }
            }
            
            // TODO: 获取漫画标签和描述（可选）
            // 提示：根据需要从其他元素获取更多信息
            
            if (!id || !title) return null;
            
            return new Comic({
                id: id,
                title: title,
                cover: cover || "",
                description: ""
            });
        } catch (e) {
            // 解析单个漫画失败时返回 null，不中断整个列表
            return null;
        }
    }

    /**
     * 探索页面 - 首页
     */
    explore = [
        {
            title: "首页推荐",
            type: "multiPageComicList",
            
            load: async (page) => {
                try {
                    // 获取首页 HTML
                    const response = await Network.get("https://www.fengchemh.com/", {}, this.headers);
                    
                    if (response.status !== 200) {
                        throw `获取首页失败：HTTP ${response.status}`;
                    }
                    
                    // 解析 HTML 文档
                    const document = new HtmlDocument(response.body);
                    
                    // 查找所有漫画链接 - 在首页上找到 <a href="/comic/XXX"> 的元素
                    const comicLinks = document.querySelectorAll("a[href*='/comic/']");
                    
                    // TODO: 优化选择器，确保只获取首页推荐的漫画，而不是侧边栏的排行榜
                    // 提示：可以更精确地选择主内容区域的漫画，避免重复
                    
                    if (comicLinks.length === 0) {
                        throw "未找到漫画列表，可能网页结构已变更";
                    }
                    
                    // 批量解析漫画 - 提取每个链接的父容器并解析
                    const comics = [];
                    const seenIds = new Set(); // 去重
                    
                    for (let link of comicLinks) {
                        const parent = link.parentElement || link;
                        const comic = this.parseComicItem(parent);
                        
                        // 去重和过滤
                        if (comic && !seenIds.has(comic.id)) {
                            comics.push(comic);
                            seenIds.add(comic.id);
                        }
                    }
                    
                    return {
                        comics: comics,
                        maxPage: 1  // 首页只有一页
                    };
                } catch (e) {
                    throw `解析首页失败：${e}`;
                }
            }
        }
    ]

    /**
     * 分类页面配置
     */
    category = {
        title: "分类",
        parts: [
            {
                name: "地区",
                type: "fixed",
                categories: [
                    {
                        label: "国产漫画",
                        target: {
                            page: "category",
                            attributes: { category: "1" }
                        }
                    },
                    {
                        label: "日本漫画",
                        target: {
                            page: "category",
                            attributes: { category: "2" }
                        }
                    },
                    {
                        label: "韩国漫画",
                        target: {
                            page: "category",
                            attributes: { category: "3" }
                        }
                    },
                    {
                        label: "欧美漫画",
                        target: {
                            page: "category",
                            attributes: { category: "4" }
                        }
                    }
                ]
            }
        ]
    }

    /**
     * 分类漫画加载
     */
    categoryComics = {
        load: async (category, param, options, page) => {
            try {
                // TODO: 构建分类页面 URL
                // 提示：根据分类 ID 构建 URL，如 /category/list/{categoryId}?page={pageNum}
                const categoryId = category;
                const url = `https://www.fengchemh.com/category/list/${categoryId}?page=${page}`;
                
                // TODO: 获取分类页面
                const response = await Network.get(url, {}, this.headers);
                if (response.status !== 200) {
                    throw `获取分类页面失败：HTTP ${response.status}`;
                }
                
                // TODO: 解析分类页面
                const document = new HtmlDocument(response.body);
                
                // TODO: 查找漫画列表
                // 提示：与首页类似，但容器可能有所不同
                const elements = document.querySelectorAll("[class*='item-cover']");
                
                const comics = elements
                    .map(el => {
                        const parent = el.parentElement || el;
                        return this.parseComicItem(parent);
                    })
                    .filter(comic => comic !== null);
                
                // TODO: 检测最大页数
                // 提示：可以从分页器获取最大页数，或者通过结果数量判断
                let maxPage = 1;
                const pageElements = document.querySelectorAll("[class*='page']");
                if (pageElements.length > 0) {
                    // 尝试从分页元素获取最大页数
                    // 这是一个示例，需要根据实际 HTML 结构调整
                }
                
                return {
                    comics: comics,
                    maxPage: maxPage
                };
            } catch (e) {
                throw `加载分类漫画失败：${e}`;
            }
        }
    }

    /**
     * 搜索功能
     */
    search = {
        load: async (keyword, options, page) => {
            try {
                // TODO: 构建搜索 URL
                // 提示：编码关键词，构建搜索请求 URL
                const encodedKeyword = encodeURIComponent(keyword);
                const url = `https://www.fengchemh.com/search?key=${encodedKeyword}&page=${page}`;
                
                // TODO: 发送搜索请求
                const response = await Network.get(url, {}, this.headers);
                if (response.status !== 200) {
                    throw `搜索失败：HTTP ${response.status}`;
                }
                
                // TODO: 解析搜索结果
                const document = new HtmlDocument(response.body);
                const elements = document.querySelectorAll("[class*='item-cover']");
                
                const comics = elements
                    .map(el => {
                        const parent = el.parentElement || el;
                        return this.parseComicItem(parent);
                    })
                    .filter(comic => comic !== null);
                
                return {
                    comics: comics,
                    maxPage: 1
                };
            } catch (e) {
                throw `搜索失败：${e}`;
            }
        }
    }

    /**
     * 漫画详情加载
     */
    comicDetail = {
        load: async (comicId) => {
            try {
                // 获取漫画详情页面
                const url = `https://www.fengchemh.com/comic/${comicId}`;
                const response = await Network.get(url, {}, this.headers);
                
                if (response.status !== 200) {
                    throw `获取漫画详情失败：HTTP ${response.status}`;
                }
                
                const document = new HtmlDocument(response.body);
                
                // 提取基本信息 - 标题、描述、封面
                let title = "";
                let description = "";
                let cover = "";
                
                // TODO: 从详情页面提取标题和描述
                // 提示：在页面的某个位置有 <h1> 或 <h2> 标题
                // 查找方式：document.querySelector("h1") 或 document.querySelector("[class*='title']")
                
                // 提取章节列表
                // 关键选择器：所有 <a href="/chapter/XXX.html"> 的元素
                const chapterElements = document.querySelectorAll("a[href*='/chapter/'][href*='.html']");
                
                const chapters = chapterElements
                    .map(el => {
                        const href = el.attributes["href"] || "";
                        if (!href.includes("/chapter/")) return null;
                        
                        // 从 "/chapter/4gbr9seXzK.html" 提取 "4gbr9seXzK"
                        const chapterId = href.split("/").pop().replace(".html", "");
                        const chapterTitle = el.text.trim();
                        
                        if (!chapterId || !chapterTitle) return null;
                        
                        return new Chapter({
                            id: chapterId,
                            title: chapterTitle,
                            order: 0
                        });
                    })
                    .filter(ch => ch !== null);
                
                return new ComicDetail({
                    id: comicId,
                    title: title || "未知",
                    description: description || "",
                    cover: cover || "",
                    chapters: chapters.reverse() // 反转使最新章节在上面
                });
            } catch (e) {
                throw `获取漫画详情失败：${e}`;
            }
        }
    }

    /**
     * 章节图片加载
     * 这是最关键的部分，需要处理网站的加密
     */
    chapterImages = {
        load: async (chapterId) => {
            try {
                // TODO: 获取章节页面
                const url = `https://www.fengchemh.com/chapter/${chapterId}.html`;
                const response = await Network.get(url, {}, this.headers);
                
                if (response.status !== 200) {
                    throw `获取章节失败：HTTP ${response.status}`;
                }
                
                // TODO: 从页面中提取加密的图片数据
                // 提示：网站使用了 LzString + CryptoJS 进行加密
                // 页面中有这样的结构：
                // <script>var params = 'xxxxx...'; </script>
                // 需要：
                // 1. 从 HTML 中提取 params 变量的值
                // 2. Base64 解码
                // 3. 使用 CryptoJS 解密
                // 4. 解析 JSON 获取图片 URL 列表
                
                const document = new HtmlDocument(response.body);
                
                // TODO: 使用正则表达式提取加密的 params 字符串
                // 提示：查找 var params = '...' 的内容
                // 这需要从原始 HTML 体中提取（HtmlDocument 可能不会保留脚本内容）
                // 可能需要在 HTML body 中搜索特定的 script 标签内容
                
                let imagesUrl = [];
                
                // TODO: 这里是解密的核心逻辑的占位符
                // 实现步骤：
                // 1. 从 HTML 中提取 params 字符串（这需要正则表达式或字符串查找）
                // 2. Base64 解码：Convert.decodeBase64(params)
                // 3. 使用 Convert.decrypt() 或类似的加密函数解密
                // 4. 从解密结果中解析图片 URL
                
                // 示例结构（需要实现）：
                // const paramsMatch = response.body.match(/var params = '([^']+)'/);
                // if (!paramsMatch) throw "未找到图片数据";
                // const encryptedData = paramsMatch[1];
                // const decryptedData = await decryptImageData(encryptedData);
                // imagesUrl = extractImagesFromDecrypted(decryptedData);
                
                if (imagesUrl.length === 0) {
                    throw "未能提取到图片列表，可能需要更新解密方法";
                }
                
                return {
                    images: imagesUrl
                };
            } catch (e) {
                throw `加载章节图片失败：${e}`;
            }
        }
    }
}

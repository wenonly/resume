const grayMatter = require("gray-matter");
const hljs = require("highlight.js");
const markdownIt = require("markdown-it");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");

// 设置布尔值，如果未提供则使用默认值
function setBooleanValue(value, defaultValue) {
  if (value === undefined) {
    return defaultValue;
  }
  return value;
}

// 读取文件
function readFile(filename) {
  try {
    return fs.readFileSync(filename);
  } catch (error) {
    throw new Error(`Failed to read file ${filename}: ${error.message}`);
  }
}

// Slug函数用于生成标题的锚点链接
function Slug(str) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

/**
 * 将Markdown文本转换为HTML
 * @param {string} filename - Markdown文件的路径
 * @param {Object} options - 配置选项
 * @returns {string} 转换后的HTML
 */
function convertMarkdownToHtml(filename, options = {}) {
  const text = readFile(filename);
  const matterParts = grayMatter(text);
  const defaultOptions = {
    breaks: true,
    emoji: true,
    plantumlOpenMarker: "@startuml",
    plantumlCloseMarker: "@enduml",
    plantumlServer: "",
    includeEnable: true,
  };

  const config = { ...defaultOptions, ...options };

  const md = markdownIt({
    html: true,
    breaks: setBooleanValue(matterParts.data.breaks, config.breaks),
    highlight: function (str, lang) {
      if (lang && lang.match(/\bmermaid\b/i)) {
        return `<div class="mermaid">${str}</div>`;
      }

      if (lang && hljs.getLanguage(lang)) {
        try {
          str = hljs.highlight(lang, str, true).value;
        } catch (error) {
          str = md.utils.escapeHtml(str);
          console.error("Highlight error:", error);
        }
      } else {
        str = md.utils.escapeHtml(str);
      }
      return '<pre class="hljs"><code><div>' + str + "</div></code></pre>";
    },
  });

  // 转换markdown中的图片路径
  const defaultRender = md.renderer.rules.image;
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const token = tokens[idx];
    let href = token.attrs[token.attrIndex("src")][1];
    href = decodeURIComponent(href).replace(/("|')/g, "");
    token.attrs[token.attrIndex("src")][1] = href;
    return defaultRender(tokens, idx, options, env, self);
  };

  // 转换HTML中的图片路径
  md.renderer.rules.html_block = function (tokens, idx) {
    const html = tokens[idx].content;
    const $ = cheerio.load(html);
    $("img").each(function () {
      const src = $(this).attr("src");
      $(this).attr("src", decodeURIComponent(src));
    });
    return $.html();
  };

  // 复选框支持
  md.use(require("markdown-it-checkbox"));

  // emoji支持
  if (setBooleanValue(matterParts.data.emoji, config.emoji)) {
    const emojies_defs = require(path.join(__dirname, "data", "emoji.json"));
    md.use(require("markdown-it-emoji").full, { defs: emojies_defs });
    md.renderer.rules.emoji = function (token, idx) {
      const emoji = token[idx].markup;
      const emojipath = path.join(
        __dirname,
        "node_modules",
        "emoji-images",
        "pngs",
        emoji + ".png",
      );
      const emojidata = readFile(emojipath).toString("base64");
      if (emojidata) {
        return (
          '<img class="emoji" alt="' +
          emoji +
          '" src="data:image/png;base64,' +
          emojidata +
          '" />'
        );
      } else {
        return ":" + emoji + ":";
      }
    };
  }

  // 目录支持
  md.use(require("markdown-it-named-headers"), { slugify: Slug });

  // 容器支持
  md.use(require("markdown-it-container"), "", {
    validate: function (name) {
      return name.trim().length;
    },
    render: function (tokens, idx) {
      if (tokens[idx].info.trim() !== "") {
        return `<div class="${tokens[idx].info.trim()}">\n`;
      } else {
        return "</div>\n";
      }
    },
  });

  // PlantUML支持
  const plantumlOptions = {
    openMarker:
      matterParts.data.plantumlOpenMarker || config.plantumlOpenMarker,
    closeMarker:
      matterParts.data.plantumlCloseMarker || config.plantumlCloseMarker,
    server: config.plantumlServer,
  };
  md.use(require("markdown-it-plantuml"), plantumlOptions);

  // markdown-it-include支持
  if (config.includeEnable) {
    md.use(require("markdown-it-include"), {
      root: path.dirname(filename),
      includeRe: /:\[.+\]\((.+\..+)\)/i,
    });
  }

  return md.render(matterParts.content);
}

function makeCss(filename) {
  try {
    var css = readFile(filename);
    if (css) {
      return "\n<style>\n" + css + "\n</style>\n";
    } else {
      return "";
    }
  } catch (error) {
    console.error("makeCss()", error);
  }
}

module.exports.makeCss = makeCss;
module.exports.convertMarkdownToHtml = convertMarkdownToHtml;
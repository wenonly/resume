const { convertMarkdownToHtml, makeCss } = require("./markdown-to-html");
const fs = require("fs");
const path = require("path");

const html = convertMarkdownToHtml("resume.md");
const css = makeCss(path.join(__dirname, "../lapis-cv.css"));
fs.writeFileSync(path.join(__dirname, "../resume.html"), css + html);

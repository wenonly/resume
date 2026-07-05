const fs = require("fs");
const path = require("path");
const { convertMarkdownToHtml, makeCss } = require("./markdown-to-html");
const convertHtmlToPdf = require("./html-to-pdf");

const ROOT = path.join(__dirname, "..");
const RESUMES_DIR = path.join(ROOT, "resumes");
const DIST_DIR = path.join(ROOT, "dist");
const CSS_PATH = path.join(ROOT, "lapis-cv.css");

// 从 markdown 内容中提取第一个一级标题作为页面标题
function extractTitle(mdContent, fallback) {
  const match = mdContent.match(/^#\s+(.+)$/m);
  return match ? `${match[1].trim()}的简历` : `${fallback} 简历`;
}

// 构建单份简历：md -> html -> pdf
async function buildOne(mdPath) {
  const basename = path.basename(mdPath, ".md");
  const outputPath = path.join(DIST_DIR, `${basename}.pdf`);

  const mdContent = fs.readFileSync(mdPath, "utf8");
  const html = convertMarkdownToHtml(mdPath);
  const css = makeCss(CSS_PATH);
  const title = extractTitle(mdContent, basename);

  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    ${css}
</head>
<body>
    ${html}
</body>
</html>
`;

  await convertHtmlToPdf(fullHtml, { outputPath });
  console.log(`✓ ${path.relative(ROOT, mdPath)} -> ${path.relative(ROOT, outputPath)}`);
  return outputPath;
}

// 收集待构建的简历文件列表
// - 有 CLI 参数：只构建指定的文件
// - 无参数：扫描 resumes/ 目录下所有 .md 文件
function collectTargets() {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args.map((p) => path.resolve(ROOT, p));
  }

  if (!fs.existsSync(RESUMES_DIR)) {
    console.error(`找不到简历目录: ${RESUMES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(RESUMES_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => path.join(RESUMES_DIR, f));

  if (files.length === 0) {
    console.error(`在 ${path.relative(ROOT, RESUMES_DIR)} 下没有找到 .md 文件`);
    process.exit(1);
  }

  return files;
}

(async () => {
  fs.mkdirSync(DIST_DIR, { recursive: true });

  const targets = collectTargets();
  console.log(`共 ${targets.length} 份简历待构建：`);
  targets.forEach((t) => console.log(`  - ${path.relative(ROOT, t)}`));

  for (const target of targets) {
    await buildOne(target);
  }

  console.log("全部构建完成");
})();

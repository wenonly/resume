const { convertMarkdownToHtml, makeCss } = require("./markdown-to-html");
const convertHtmlToPdf = require("./html-to-pdf");
const path = require("path");

const html = convertMarkdownToHtml("resume.md");
const css = makeCss(path.join(__dirname, "../lapis-cv.css"));
const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>陶文的简历</title>
    ${css}
</head>
<body>
    ${html}
</body>
</html>
`;

(async () => {
  await convertHtmlToPdf(fullHtml, {
    outputPath: path.join(__dirname, "../resume.pdf"),
  });
})();

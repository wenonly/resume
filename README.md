# 陶文的个人简历

支持**多份简历**同时维护：在 [resumes/](resumes) 目录下，每个 `.md` 文件即一份简历，构建时自动全部转成 PDF。

## 目录结构

```
resumes/          简历源文件（markdown）
  frontend.md     前端求职版
  agent.md        AI Agent 全栈求职版
dist/             构建产物（gitignore，不入库）
  frontend.pdf
  agent.pdf
lapis-cv.css      样式（多份简历共用）
src/              构建脚本
```

## 编辑简历

直接编辑 [resumes/](resumes) 下的 `.md` 文件即可。新增一份简历只需丢一个新的 `.md` 进去，无需改任何代码或配置。

## 本地构建

```bash
pnpm install
pnpm run build                         # 构建全部简历 -> dist/*.pdf
node src/main.js resumes/frontend.md   # 只构建指定的一份
```

## 自动发布

推送到 `main` 分支会触发 [GitHub Action](.github/workflows/build_deploy.yml)：自动构建 [resumes/](resumes) 下全部简历，并把 `dist/*.pdf` 发布到一个 Release。

## 自定义样式

修改 [lapis-cv.css](lapis-cv.css) 即可，所有简历共用同一份样式。

## VSCode 预览（可选）

如果想直接在 VSCode 里实时预览并应用项目样式：

1. 安装插件 **Markdown PDF**。
2. 项目根目录已配好 [.vscode/settings.json](.vscode/settings.json)，预览会自动应用 [lapis-cv.css](lapis-cv.css) 样式（路径相对于工作区根目录，与 `.md` 所在子目录无关）。
3. 打开 [resumes/](resumes) 下任意 `.md`，右上角 **Open Preview** 实时预览。

> 导出 PDF 推荐统一用 `pnpm run build`，保证多份简历产物一致。Markdown PDF 插件右键导出仅作备选，样式/分页可能与脚本构建略有差异。

## 项目参考

- [LapisCV](https://github.com/BingyanStudio/LapisCV)

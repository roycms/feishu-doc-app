// ================================================================
// @name         飞书文档复制浏览器插件
// @namespace    https://www.huggingface.org.cn/
// @version      1.0
// @description  将飞书文档复制为 Markdown 格式的纯文本
// @match        https://*.feishu.cn/docx/*
// ================================================================

(function () {

    // 创建一个悬浮按钮
    const button = document.createElement("button");
    button.textContent = "一键复制";
    button.classList.add("ud__button", "ud__button--filled", "ud__button--filled-default", "ud__button--size-md", "suite-share", "layout-row", "layout-cross-center", "layout-main-center", "note-btn", "note-title__share");
    button.style.position = "fixed";
    button.style.right = "60px";
    button.style.top = "120px";
    button.style.zIndex = "9999";

    // 将按钮添加到页面中
    document.body.appendChild(button);

    // 全选文章，滑动至最底端后继续

    button.addEventListener("click", convertToMarkdown);

    function convertToMarkdown() {

        // 选择需要处理的节点
        const nodesToProcess = document.querySelectorAll('.heading-h2, .heading-h3, .text-block, .image-block, .img, table, .list-content');

        // 定义一个空的 Map 对象来保存节点信息
        const nodes = new Map();

        // 遍历节点，将节点信息保存到 nodes 中
        nodesToProcess.forEach((node) => {
            let type, content;
            switch (true) {
                case node.classList.contains('heading-h2'):
                    type = 'heading-h2';
                    content = node.textContent.trim();
                    break;
                case node.classList.contains('heading-h3'):
                    type = 'heading-h3';
                    content = node.textContent.trim();
                    break;
                case node.classList.contains('text-block'):
                    // 判断文本节点是否在表格中
                    if (!node.closest || !node.closest('table')) {
                        type = 'text-block';
                        content = node.textContent.trim() == '\u200B' ? '<br/>' : node.textContent.trim();
                    }
                    break;
                case node.classList.contains('image-block'):
                    type = 'img';
                    content = 'https://';
                    break;
                case node.classList.contains('img'):
                        type = 'img';
                        content = 'https://';
                        break;
                case node.tagName.toLowerCase() === 'table':
                    type = 'table-block';
                    content = { rows: [] };

                    // 将表格中的行和列数据保存到 content.rows 中
                    const rows = node.querySelectorAll('tr');
                    rows.forEach((row) => {
                        const rowData = [];
                        const cells = row.querySelectorAll('td, th');
                        cells.forEach((cell) => {
                            rowData.push(cell.textContent.trim());
                        });
                        content.rows.push(rowData);
                    });
                    break;
                case node.classList.contains('list-content'):
                    type = 'list';
                    content = node.textContent.trim();
                    break;
                default:
                    break;
            }

            if (content) {
                const nodeId = nodes.size + 1;
                const nodeObj = { type: type, content: content, order: nodeId };
                nodes.set(nodeId, nodeObj);
            }
        });

        // 将节点信息转换为 Markdown 格式的文本
        let markdownContent = '';
        for (let i = 1; i <= nodes.size; i++) {
            const node = nodes.get(i);
            switch (node.type) {
                case 'heading-h2':
                    markdownContent += '## ' + node.content + '\n\n';
                    break;
                case 'heading-h3':
                    markdownContent += '### ' + node.content + '\n\n';
                    break;
                case 'text-block':
                    // 判断文本节点是否在表格中
                    if (!node.closest || !node.closest('table')) {
                        // 节点不在表格中
                        markdownContent += node.content + '\n\n';
                    }
                    break;
                case 'img':
                    markdownContent += '![](https://)' + '\n\n';
                    break;
                case 'list':
                    markdownContent += '- ' + node.content + '\n\n'
                    break;
                case 'table-block':
                    const table = node.content;
                    const rows = table.rows;
                    const columnCount = rows[0].length;
                    const rowCount = rows.length;

                    // 表头
                    markdownContent += '|';
                    for (let i = 0; i < columnCount; i++) {
                        markdownContent += rows[0][i] + '|';
                    }
                    markdownContent += '\n|';
                    for (let i = 0; i < columnCount; i++) {
                        markdownContent += ':---:|';
                    }
                    markdownContent += '\n';

                    // 表格内容
                    for (let i = 1; i < rowCount; i++) {
                        const row = rows[i];
                        markdownContent += '|';
                        for (let j = 0; j < columnCount; j++) {
                            markdownContent += row[j] + '|';
                        }
                        markdownContent += '\n';
                    }
                    markdownContent += '\n';
                    break;
                default:
                    break;
            }
        }

        console.log(markdownContent);
        navigator.clipboard.writeText(markdownContent).then(() => {
            console.log("Markdown content copied to clipboard.");
        }, () => {
            console.error("Failed to copy Markdown content to clipboard.");
        });
    }





})();
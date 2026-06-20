// Pinta Web - 绘图工具

class ToolManager {
    constructor(app) {
        this.app = app;
        this.currentTool = 'pencil';
        this.isDrawing = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;

        this.toolOptions = {
            pencil: {
                size: 5,
                opacity: 100,
                hardness: 100
            },
            brush: {
                size: 20,
                opacity: 100,
                hardness: 80
            },
            eraser: {
                size: 20,
                opacity: 100
            },
            fill: {
                tolerance: 32
            },
            text: {
                font: 'Arial',
                size: 24
            },
            rectangle: {
                filled: false,
                lineWidth: 2
            },
            ellipse: {
                filled: false,
                lineWidth: 2
            },
            line: {
                width: 2,
                arrow: false
            }
        };

        this.initEventListeners();
    }

    // 初始化事件监听
    initEventListeners() {
        const canvas = this.app.mainCanvas;

        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('mouseleave', (e) => this.onMouseUp(e));

        // 触摸事件支持
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        });

        canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const mouseEvent = new MouseEvent('mouseup', {});
            canvas.dispatchEvent(mouseEvent);
        });

        // 工具按钮
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tool = btn.dataset.tool;
                if (tool) {
                    this.setTool(tool);
                }
            });
        });

        // 工具选项
        document.getElementById('brush-size')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brush-size-value').textContent = value + 'px';
            this.updateToolOption('size', value);
        });

        document.getElementById('brush-opacity')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brush-opacity-value').textContent = value + '%';
            this.updateToolOption('opacity', value);
        });

        document.getElementById('brush-hardness')?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            document.getElementById('brush-hardness-value').textContent = value + '%';
            this.updateToolOption('hardness', value);
        });
    }

    // 设置工具
    setTool(tool) {
        this.currentTool = tool;

        // 更新UI
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === tool) {
                btn.classList.add('active');
            }
        });

        // 更新状态栏
        const toolNames = {
            'pencil': '铅笔',
            'brush': '画笔',
            'eraser': '橡皮擦',
            'fill': '油漆桶',
            'text': '文字',
            'rectangle': '矩形',
            'ellipse': '椭圆',
            'line': '直线',
            'arrow': '箭头',
            'select-rect': '矩形选择',
            'select-ellipse': '椭圆选择',
            'lasso': '套索',
            'move': '移动',
            'color-picker': '取色器',
            'pan': '平移',
            'zoom': '缩放'
        };

        document.getElementById('current-tool').textContent = '工具: ' + (toolNames[tool] || tool);

        // 更新工具选项显示
        this.updateToolOptionsUI();
    }

    // 更新工具选项UI
    updateToolOptionsUI() {
        const hardnessGroup = document.getElementById('hardness-group');
        if (hardnessGroup) {
            hardnessGroup.style.display = (this.currentTool === 'brush') ? 'flex' : 'none';
        }
    }

    // 更新工具选项
    updateToolOption(option, value) {
        if (this.toolOptions[this.currentTool]) {
            this.toolOptions[this.currentTool][option] = value;
        }
    }

    // 鼠标按下
    onMouseDown(e) {
        if (e.button === 2) return; // 右键不处理

        this.isDrawing = true;
        const pos = Utils.getMousePos(this.app.mainCanvas, e);
        this.startX = pos.x;
        this.startY = pos.y;
        this.lastX = pos.x;
        this.lastY = pos.y;

        const activeLayer = this.app.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) return;

        const ctx = activeLayer.canvas.getContext('2d');

        switch (this.currentTool) {
            case 'pencil':
            case 'brush':
                this.startBrushStroke(ctx, pos.x, pos.y);
                break;
            case 'eraser':
                this.startEraser(ctx, pos.x, pos.y);
                break;
            case 'fill':
                this.floodFill(ctx, Math.floor(pos.x), Math.floor(pos.y));
                break;
            case 'color-picker':
                this.pickColor(ctx, Math.floor(pos.x), Math.floor(pos.y));
                break;
            case 'text':
                this.addText(pos.x, pos.y);
                break;
        }

        this.app.layerManager.updateThumbnails();
    }

    // 鼠标移动
    onMouseMove(e) {
        const pos = Utils.getMousePos(this.app.mainCanvas, e);

        // 更新鼠标位置显示
        document.getElementById('mouse-pos').textContent = `${Math.floor(pos.x)}, ${Math.floor(pos.y)}`;

        if (!this.isDrawing) return;

        const activeLayer = this.app.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) return;

        const ctx = activeLayer.canvas.getContext('2d');

        switch (this.currentTool) {
            case 'pencil':
            case 'brush':
                this.continueBrushStroke(ctx, pos.x, pos.y);
                break;
            case 'eraser':
                this.continueEraser(ctx, pos.x, pos.y);
                break;
            case 'rectangle':
            case 'ellipse':
            case 'line':
            case 'arrow':
                this.drawShapePreview(pos.x, pos.y);
                break;
            case 'select-rect':
            case 'select-ellipse':
                this.drawSelectionPreview(pos.x, pos.y);
                break;
            case 'move':
                this.moveLayer(pos.x - this.lastX, pos.y - this.lastY);
                break;
            case 'pan':
                this.panCanvas(pos.x - this.lastX, pos.y - this.lastY);
                break;
        }

        this.lastX = pos.x;
        this.lastY = pos.y;

        this.app.render();
    }

    // 鼠标抬起
    onMouseUp(e) {
        if (!this.isDrawing) return;
        this.isDrawing = false;

        const activeLayer = this.app.layerManager.getActiveLayer();
        if (!activeLayer || activeLayer.locked) return;

        const pos = Utils.getMousePos(this.app.mainCanvas, e);

        switch (this.currentTool) {
            case 'rectangle':
            case 'ellipse':
            case 'line':
            case 'arrow':
                this.finishShape(pos.x, pos.y);
                break;
            case 'select-rect':
            case 'select-ellipse':
                this.finishSelection(pos.x, pos.y);
                break;
        }

        // 清除预览画布
        const previewCtx = this.app.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.app.previewCanvas.width, this.app.previewCanvas.height);

        // 添加到历史记录
        this.app.saveState(this.getToolName());

        this.app.layerManager.updateThumbnails();
        this.app.render();
    }

    // 获取工具名称
    getToolName() {
        const names = {
            'pencil': '铅笔绘制',
            'brush': '画笔绘制',
            'eraser': '橡皮擦',
            'fill': '填充',
            'text': '添加文字',
            'rectangle': '绘制矩形',
            'ellipse': '绘制椭圆',
            'line': '绘制直线',
            'arrow': '绘制箭头'
        };
        return names[this.currentTool] || '操作';
    }

    // 开始画笔笔触
    startBrushStroke(ctx, x, y) {
        const options = this.toolOptions[this.currentTool];
        ctx.globalAlpha = options.opacity / 100;
        ctx.strokeStyle = this.app.primaryColor;
        ctx.lineWidth = options.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (this.currentTool === 'brush' && options.hardness < 100) {
            ctx.shadowBlur = options.size * (1 - options.hardness / 100);
            ctx.shadowColor = this.app.primaryColor;
        }

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // 继续画笔笔触
    continueBrushStroke(ctx, x, y) {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // 开始橡皮擦
    startEraser(ctx, x, y) {
        const options = this.toolOptions.eraser;
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = options.opacity / 100;
        ctx.lineWidth = options.size;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y);
        ctx.stroke();
    }

    // 继续橡皮擦
    continueEraser(ctx, x, y) {
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }

    // 洪水填充
    floodFill(ctx, startX, startY) {
        const canvas = ctx.canvas;
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const startPos = (startY * canvas.width + startX) * 4;
        const startR = data[startPos];
        const startG = data[startPos + 1];
        const startB = data[startPos + 2];
        const startA = data[startPos + 3];

        const fillColor = Utils.hexToRgb(this.app.primaryColor);
        const tolerance = this.toolOptions.fill.tolerance;

        // 如果起始颜色和填充颜色相同，则不填充
        if (startR === fillColor.r && startG === fillColor.g && startB === fillColor.b) {
            return;
        }

        const stack = [[startX, startY]];
        const visited = new Set();

        while (stack.length > 0) {
            const [x, y] = stack.pop();
            const pos = (y * canvas.width + x) * 4;

            if (visited.has(pos)) continue;
            visited.add(pos);

            const r = data[pos];
            const g = data[pos + 1];
            const b = data[pos + 2];
            const a = data[pos + 3];

            // 检查颜色是否匹配
            if (Math.abs(r - startR) <= tolerance &&
                Math.abs(g - startG) <= tolerance &&
                Math.abs(b - startB) <= tolerance &&
                Math.abs(a - startA) <= tolerance) {

                // 填充颜色
                data[pos] = fillColor.r;
                data[pos + 1] = fillColor.g;
                data[pos + 2] = fillColor.b;
                data[pos + 3] = 255;

                // 添加相邻像素
                if (x > 0) stack.push([x - 1, y]);
                if (x < canvas.width - 1) stack.push([x + 1, y]);
                if (y > 0) stack.push([x, y - 1]);
                if (y < canvas.height - 1) stack.push([x, y + 1]);
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    // 取色器
    pickColor(ctx, x, y) {
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        const color = Utils.rgbToHex(pixel[0], pixel[1], pixel[2]);
        this.app.setPrimaryColor(color);
        Utils.showMessage(`已选取颜色: ${color}`);
    }

    // 添加文字
    addText(x, y) {
        Utils.showModal('添加文字', `
            <div class="form-group">
                <label>文字内容:</label>
                <input type="text" id="text-input" value="示例文字">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>字体:</label>
                    <select id="text-font">
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Courier New">Courier New</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Verdana">Verdana</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>大小:</label>
                    <input type="number" id="text-size" value="24" min="8" max="200">
                </div>
            </div>
        `, () => {
            const text = document.getElementById('text-input').value;
            const font = document.getElementById('text-font').value;
            const size = document.getElementById('text-size').value;

            const activeLayer = this.app.layerManager.getActiveLayer();
            if (activeLayer) {
                const ctx = activeLayer.canvas.getContext('2d');
                ctx.font = `${size}px ${font}`;
                ctx.fillStyle = this.app.primaryColor;
                ctx.fillText(text, x, y);
                this.app.render();
            }
        });
    }

    // 绘制形状预览
    drawShapePreview(x, y) {
        const previewCtx = this.app.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.app.previewCanvas.width, this.app.previewCanvas.height);

        previewCtx.strokeStyle = this.app.primaryColor;
        previewCtx.fillStyle = this.app.primaryColor;
        previewCtx.lineWidth = this.toolOptions[this.currentTool]?.lineWidth || 2;

        const width = x - this.startX;
        const height = y - this.startY;

        switch (this.currentTool) {
            case 'rectangle':
                previewCtx.strokeRect(this.startX, this.startY, width, height);
                break;
            case 'ellipse':
                previewCtx.beginPath();
                previewCtx.ellipse(
                    this.startX + width / 2,
                    this.startY + height / 2,
                    Math.abs(width / 2),
                    Math.abs(height / 2),
                    0, 0, 2 * Math.PI
                );
                previewCtx.stroke();
                break;
            case 'line':
                previewCtx.beginPath();
                previewCtx.moveTo(this.startX, this.startY);
                previewCtx.lineTo(x, y);
                previewCtx.stroke();
                break;
            case 'arrow':
                this.drawArrow(previewCtx, this.startX, this.startY, x, y);
                break;
        }
    }

    // 绘制箭头
    drawArrow(ctx, fromX, fromY, toX, toY) {
        const headLength = 10;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        // 箭头头部
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle - Math.PI / 6),
            toY - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(toX, toY);
        ctx.lineTo(
            toX - headLength * Math.cos(angle + Math.PI / 6),
            toY - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
    }

    // 完成形状绘制
    finishShape(x, y) {
        const activeLayer = this.app.layerManager.getActiveLayer();
        if (!activeLayer) return;

        const ctx = activeLayer.canvas.getContext('2d');
        ctx.strokeStyle = this.app.primaryColor;
        ctx.fillStyle = this.app.primaryColor;
        ctx.lineWidth = this.toolOptions[this.currentTool]?.lineWidth || 2;

        const width = x - this.startX;
        const height = y - this.startY;

        switch (this.currentTool) {
            case 'rectangle':
                ctx.strokeRect(this.startX, this.startY, width, height);
                break;
            case 'ellipse':
                ctx.beginPath();
                ctx.ellipse(
                    this.startX + width / 2,
                    this.startY + height / 2,
                    Math.abs(width / 2),
                    Math.abs(height / 2),
                    0, 0, 2 * Math.PI
                );
                ctx.stroke();
                break;
            case 'line':
                ctx.beginPath();
                ctx.moveTo(this.startX, this.startY);
                ctx.lineTo(x, y);
                ctx.stroke();
                break;
            case 'arrow':
                this.drawArrow(ctx, this.startX, this.startY, x, y);
                break;
        }
    }

    // 绘制选区预览
    drawSelectionPreview(x, y) {
        const previewCtx = this.app.previewCanvas.getContext('2d');
        previewCtx.clearRect(0, 0, this.app.previewCanvas.width, this.app.previewCanvas.height);

        previewCtx.strokeStyle = '#ffffff';
        previewCtx.setLineDash([5, 5]);
        previewCtx.lineWidth = 1;

        const width = x - this.startX;
        const height = y - this.startY;

        if (this.currentTool === 'select-rect') {
            previewCtx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.currentTool === 'select-ellipse') {
            previewCtx.beginPath();
            previewCtx.ellipse(
                this.startX + width / 2,
                this.startY + height / 2,
                Math.abs(width / 2),
                Math.abs(height / 2),
                0, 0, 2 * Math.PI
            );
            previewCtx.stroke();
        }

        previewCtx.setLineDash([]);
    }

    // 完成选区
    finishSelection(x, y) {
        // TODO: 实现选区功能
        Utils.showMessage('选区功能开发中...');
    }

    // 移动图层
    moveLayer(dx, dy) {
        const activeLayer = this.app.layerManager.getActiveLayer();
        if (!activeLayer) return;

        const canvas = activeLayer.canvas;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, dx, dy);
    }

    // 平移画布
    panCanvas(dx, dy) {
        // TODO: 实现画布平移
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToolManager;
}

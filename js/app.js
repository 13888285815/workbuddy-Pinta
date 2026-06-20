// Pinta Web - 主应用程序
// 最后加载，负责初始化整个应用

class PintaApp {
    constructor() {
        console.log('>>> PintaApp 构造函数开始...');
        
        // 画布配置
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.zoom = 1;
        this.primaryColor = '#000000';
        this.secondaryColor = '#ffffff';
        this.showGrid = false;
        this.documentName = '未命名.png';
        this.isInitialized = false;
        this.isDrawing = false;
        this.currentTool = 'pencil';

        // 获取画布元素
        this.mainCanvas = document.getElementById('main-canvas');
        this.previewCanvas = document.getElementById('preview-canvas');
        this.gridCanvas = document.getElementById('grid-canvas');

        if (!this.mainCanvas) {
            console.error('>>> 错误: 无法找到 main-canvas 元素！');
            return;
        }
        if (!this.previewCanvas) {
            console.error('>>> 错误: 无法找到 preview-canvas 元素！');
            return;
        }
        if (!this.gridCanvas) {
            console.error('>>> 错误: 无法找到 grid-canvas 元素！');
            return;
        }

        console.log('>>> 画布元素已找到');

        // 初始化管理器
        try {
            console.log('>>> 初始化 HistoryManager...');
            this.historyManager = new HistoryManager();
            console.log('>>> HistoryManager 初始化成功');
        } catch (e) {
            console.error('>>> HistoryManager 初始化失败:', e);
            return;
        }

        try {
            console.log('>>> 初始化 LayerManager...');
            this.layerManager = new LayerManager(this.canvasWidth, this.canvasHeight);
            console.log('>>> LayerManager 初始化成功');
        } catch (e) {
            console.error('>>> LayerManager 初始化失败:', e);
            return;
        }

        try {
            console.log('>>> 初始化 EffectsManager...');
            this.effectsManager = new EffectsManager(this);
            console.log('>>> EffectsManager 初始化成功');
        } catch (e) {
            console.error('>>> EffectsManager 初始化失败:', e);
            return;
        }

        try {
            console.log('>>> 初始化 ToolManager...');
            this.toolManager = new ToolManager(this);
            console.log('>>> ToolManager 初始化成功');
        } catch (e) {
            console.error('>>> ToolManager 初始化失败:', e);
            return;
        }

        console.log('>>> 开始调用 init()...');
        this.init();
    }

    // 初始化应用
    init() {
        console.log('>>> 执行 init()...');
        
        try {
            this.setupCanvas();
            console.log('>>> setupCanvas 完成');
        } catch (e) {
            console.error('>>> setupCanvas 失败:', e);
            return;
        }

        try {
            this.setupEventListeners();
            console.log('>>> setupEventListeners 完成');
        } catch (e) {
            console.error('>>> setupEventListeners 失败:', e);
            return;
        }

        try {
            this.createInitialLayer();
            console.log('>>> createInitialLayer 完成');
        } catch (e) {
            console.error('>>> createInitialLayer 失败:', e);
            return;
        }

        try {
            this.render();
            console.log('>>> render 完成');
        } catch (e) {
            console.error('>>> render 失败:', e);
            return;
        }

        try {
            this.saveState('新建文档');
            console.log('>>> saveState 完成');
        } catch (e) {
            console.error('>>> saveState 失败:', e);
        }

        this.isInitialized = true;
        
        console.log('✓✓✓ Pinta Web 初始化完成！✓✓✓');
        
        // 显示欢迎消息
        if (typeof Utils !== 'undefined' && Utils.showMessage) {
            Utils.showMessage('✓ Pinta Web 已就绪！');
        }
    }

    // 设置画布
    setupCanvas() {
        console.log('>>> setupCanvas 执行中...');
        this.mainCanvas.width = this.canvasWidth;
        this.mainCanvas.height = this.canvasHeight;
        this.previewCanvas.width = this.canvasWidth;
        this.previewCanvas.height = this.canvasHeight;
        this.gridCanvas.width = this.canvasWidth;
        this.gridCanvas.height = this.canvasHeight;

        // 更新canvas-wrapper的尺寸
        const canvasWrapper = document.getElementById('canvas-wrapper');
        if (canvasWrapper) {
            canvasWrapper.style.width = this.canvasWidth + 'px';
            canvasWrapper.style.height = this.canvasHeight + 'px';
        }

        // 重置缩放
        this.zoom = 1;
        this.mainCanvas.style.transform = 'scale(1)';
        this.previewCanvas.style.transform = 'scale(1)';
        this.gridCanvas.style.transform = 'scale(1)';

        // 填充白色背景
        const ctx = this.mainCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.updateCanvasInfo();
        console.log('>>> 画布大小设置完成: ' + this.canvasWidth + 'x' + this.canvasHeight);
    }

    // 更新画布信息
    updateCanvasInfo() {
        const canvasInfo = document.getElementById('canvas-info');
        if (canvasInfo) {
            canvasInfo.textContent = `${this.canvasWidth} × ${this.canvasHeight}`;
        }
    }

    // 设置事件监听
    setupEventListeners() {
        console.log('>>> 设置事件监听...');

        // 颜色选择器
        const primaryColorEl = document.getElementById('primary-color');
        const secondaryColorEl = document.getElementById('secondary-color');
        const colorPickerPrimary = document.getElementById('color-picker-primary');
        const colorPickerSecondary = document.getElementById('color-picker-secondary');

        if (primaryColorEl && colorPickerPrimary) {
            primaryColorEl.style.backgroundColor = this.primaryColor;
            primaryColorEl.addEventListener('click', () => {
                colorPickerPrimary.click();
            });
        }

        if (secondaryColorEl && colorPickerSecondary) {
            secondaryColorEl.style.backgroundColor = this.secondaryColor;
            secondaryColorEl.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                colorPickerSecondary.click();
            });
        }

        if (colorPickerPrimary) {
            colorPickerPrimary.value = this.primaryColor;
            colorPickerPrimary.addEventListener('input', (e) => {
                this.setPrimaryColor(e.target.value);
            });
        }

        if (colorPickerSecondary) {
            colorPickerSecondary.value = this.secondaryColor;
            colorPickerSecondary.addEventListener('input', (e) => {
                this.setSecondaryColor(e.target.value);
            });
        }

        // 颜色交换和重置
        const swapBtn = document.getElementById('swap-colors');
        const resetBtn = document.getElementById('reset-colors');
        
        if (swapBtn) swapBtn.addEventListener('click', () => this.swapColors());
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetColors());

        // 调色板
        document.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.setPrimaryColor(swatch.dataset.color);
            });
            swatch.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.setSecondaryColor(swatch.dataset.color);
            });
        });

        // 图层控制
        const layerOpacity = document.getElementById('layer-opacity');
        if (layerOpacity) {
            layerOpacity.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                const opacityValue = document.getElementById('layer-opacity-value');
                if (opacityValue) opacityValue.textContent = value + '%';
                const activeLayer = this.layerManager.getActiveLayer();
                if (activeLayer) {
                    activeLayer.opacity = value;
                    this.render();
                }
            });
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // 文件输入
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                console.log('>>> 文件选择变化');
                this.loadImage(e.target.files[0]);
            });
        }

        console.log('>>> 事件监听设置完成');
    }

    // 获取鼠标位置
    getMousePos(e) {
        const rect = this.mainCanvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }

    // 创建初始图层
    createInitialLayer() {
        console.log('>>> 创建初始图层...');
        const layer = this.layerManager.addLayer('背景');
        
        // 填充白色背景
        const ctx = layer.canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

        this.layerManager.updateThumbnails();
        this.updateLayersPanel();
        console.log('>>> 初始图层创建完成');
    }

    // 渲染
    render() {
        // 清除主画布
        const ctx = this.mainCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);

        // 绘制所有可见图层 - 从底层到顶层
        const layers = this.layerManager.getLayers();
        // 因为图层使用unshift添加到数组开头，所以需要反向遍历
        for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.visible) {
                ctx.save();
                ctx.globalAlpha = layer.opacity / 100;
                ctx.globalCompositeOperation = this.getCompositeOperation(layer.blendMode);
                ctx.drawImage(layer.canvas, 0, 0);
                ctx.restore();
            }
        }

        // 绘制网格
        if (this.showGrid) {
            this.drawGrid();
        }

        // 更新缩放显示
        const zoomLevel = document.getElementById('zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = Math.round(this.zoom * 100) + '%';
        }
    }

    // 获取混合模式
    getCompositeOperation(blendMode) {
        const modes = {
            'normal': 'source-over',
            'multiply': 'multiply',
            'screen': 'screen',
            'overlay': 'overlay',
            'darken': 'darken',
            'lighten': 'lighten'
        };
        return modes[blendMode] || 'source-over';
    }

    // 绘制网格
    drawGrid() {
        const ctx = this.gridCanvas.getContext('2d');
        ctx.clearRect(0, 0, this.gridCanvas.width, this.gridCanvas.height);
        
        const gridSize = 20;
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        for (let x = 0; x <= this.gridCanvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.gridCanvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= this.gridCanvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.gridCanvas.width, y);
            ctx.stroke();
        }
    }

    // 处理键盘事件
    handleKeyboard(e) {
        // Ctrl+Z: 撤销
        if (e.ctrlKey && e.key === 'z') {
            e.preventDefault();
            this.undo();
        }
        // Ctrl+Y: 重做
        if (e.ctrlKey && e.key === 'y') {
            e.preventDefault();
            this.redo();
        }
        // Ctrl+S: 保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            this.saveImage();
        }
        // Ctrl+N: 新建
        if (e.ctrlKey && e.key === 'n') {
            e.preventDefault();
            this.newDocument();
        }
    }

    // 保存状态
    saveState(actionName) {
        if (!this.historyManager) return;
        const state = {
            layers: this.layerManager.saveState(),
            canvasWidth: this.canvasWidth,
            canvasHeight: this.canvasHeight,
            documentName: this.documentName
        };
        this.historyManager.saveState(state, actionName);
        console.log('>>> 状态已保存:', actionName);
    }

    // 撤销
    undo() {
        if (!this.historyManager.canUndo()) return;
        const state = this.historyManager.undo();
        if (state) {
            this.layerManager.restoreState(state.layers);
            this.render();
            Utils.showMessage('已撤销');
        }
    }

    // 重做
    redo() {
        if (!this.historyManager.canRedo()) return;
        const state = this.historyManager.redo();
        if (state) {
            this.layerManager.restoreState(state.layers);
            this.render();
            Utils.showMessage('已重做');
        }
    }

    // ========== 菜单功能 ==========

    // 新建文档
    newDocument() {
        console.log('>>> newDocument 被调用');
        
        // 使用 prompt 获取尺寸
        const widthStr = prompt('请输入画布宽度 (1-10000):', '800');
        if (!widthStr) return;
        const width = parseInt(widthStr);
        if (isNaN(width) || width < 1 || width > 10000) {
            alert('无效的宽度！');
            return;
        }

        const heightStr = prompt('请输入画布高度 (1-10000):', '600');
        if (!heightStr) return;
        const height = parseInt(heightStr);
        if (isNaN(height) || height < 1 || height > 10000) {
            alert('无效的高度！');
            return;
        }

        console.log('>>> 创建新文档:', width, 'x', height);

        this.canvasWidth = width;
        this.canvasHeight = height;
        this.setupCanvas();

        this.layerManager = new LayerManager(width, height);
        const layer = this.layerManager.addLayer('背景');

        const ctx = layer.canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);

        this.layerManager.updateThumbnails();
        this.historyManager.clear();
        this.saveState('新建文档');
        this.render();
        this.updateLayersPanel();
        this.documentName = '未命名.png';
        
        Utils.showMessage('已创建新文档: ' + width + 'x' + height);
        console.log('>>> newDocument 完成');
    }

    // 打开图片
    openImage() {
        console.log('>>> openImage 被调用');
        document.getElementById('file-input').click();
    }

    // 加载图片
    loadImage(file) {
        console.log('>>> loadImage 被调用, file:', file);
        if (!file) {
            console.log('>>> 没有选择文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                console.log('>>> 图片加载完成:', img.width, 'x', img.height);
                
                this.canvasWidth = img.width;
                this.canvasHeight = img.height;
                this.setupCanvas();

                this.layerManager = new LayerManager(img.width, img.height);
                const layer = this.layerManager.addLayer('图层 1');

                const ctx = layer.canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                this.layerManager.updateThumbnails();
                this.historyManager.clear();
                this.saveState('打开图片');
                this.render();
                this.updateLayersPanel();
                this.documentName = file.name;
                
                Utils.showMessage(`已加载: ${file.name}`);
            };
            img.onerror = () => {
                console.error('>>> 图片加载失败');
                Utils.showMessage('图片加载失败！', 'error');
            };
            img.src = e.target.result;
        };
        reader.onerror = () => {
            console.error('>>> FileReader 错误');
            Utils.showMessage('读取文件失败！', 'error');
        };
        reader.readAsDataURL(file);
    }

    // 保存图片
    saveImage() {
        console.log('>>> saveImage 被调用');
        this.exportPNG();
    }

    // 导出为 PNG
    exportPNG() {
        console.log('>>> exportPNG 被调用');
        const mergedCanvas = this.layerManager.flattenLayers();
        const dataUrl = mergedCanvas.toDataURL('image/png');
        Utils.downloadFile(dataUrl, this.documentName);
        Utils.showMessage('已保存为 PNG');
    }

    // 导出为 JPG
    exportJPG() {
        console.log('>>> exportJPG 被调用');
        const mergedCanvas = this.layerManager.flattenLayers();
        const dataUrl = mergedCanvas.toDataURL('image/jpeg', 0.9);
        const filename = this.documentName.replace(/\.[^/.]+$/, '') + '.jpg';
        Utils.downloadFile(dataUrl, filename);
        Utils.showMessage('已保存为 JPG');
    }

    // ========== 工具功能 ==========

    // 选择工具
    selectTool(toolName) {
        console.log('>>> selectTool:', toolName);
        this.currentTool = toolName;
        
        // 更新工具栏高亮
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === toolName) {
                btn.classList.add('active');
            }
        });

        // 更新工具信息
        const toolLabel = document.getElementById('current-tool');
        if (toolLabel) toolLabel.textContent = toolName;

        this.toolManager.setTool(toolName);
    }

    // 设置主颜色
    setPrimaryColor(color) {
        this.primaryColor = color;
        const primaryColorEl = document.getElementById('primary-color');
        if (primaryColorEl) {
            primaryColorEl.style.backgroundColor = color;
        }
        const colorPicker = document.getElementById('color-picker-primary');
        if (colorPicker) colorPicker.value = color;
    }

    // 设置次要颜色
    setSecondaryColor(color) {
        this.secondaryColor = color;
        const secondaryColorEl = document.getElementById('secondary-color');
        if (secondaryColorEl) {
            secondaryColorEl.style.backgroundColor = color;
        }
        const colorPicker = document.getElementById('color-picker-secondary');
        if (colorPicker) colorPicker.value = color;
    }

    // 交换颜色
    swapColors() {
        const temp = this.primaryColor;
        this.setPrimaryColor(this.secondaryColor);
        this.setSecondaryColor(temp);
        Utils.showMessage('颜色已交换');
    }

    // 重置颜色
    resetColors() {
        this.setPrimaryColor('#000000');
        this.setSecondaryColor('#ffffff');
        Utils.showMessage('颜色已重置');
    }

    // ========== 图层功能 ==========

    // 添加图层
    addLayer() {
        console.log('>>> addLayer 被调用');
        const layer = this.layerManager.addLayer();
        this.layerManager.updateThumbnails();
        this.updateLayersPanel();
        this.saveState('添加图层');
        Utils.showMessage('已添加图层: ' + layer.name);
    }

    // 删除图层
    deleteLayer() {
        console.log('>>> deleteLayer 被调用');
        if (this.layerManager.layers.length <= 1) {
            Utils.showMessage('无法删除最后一个图层！', 'warning');
            return;
        }
        this.layerManager.removeLayer(this.layerManager.activeLayerIndex);
        this.layerManager.updateThumbnails();
        this.updateLayersPanel();
        this.render();
        this.saveState('删除图层');
        Utils.showMessage('图层已删除');
    }

    // 上移图层
    moveLayerUp() {
        const index = this.layerManager.activeLayerIndex;
        if (index < this.layerManager.layers.length - 1) {
            this.layerManager.moveLayer(index, index + 1);
            this.layerManager.updateThumbnails();
            this.updateLayersPanel();
            this.render();
            this.saveState('上移图层');
        }
    }

    // 下移图层
    moveLayerDown() {
        const index = this.layerManager.activeLayerIndex;
        if (index > 0) {
            this.layerManager.moveLayer(index, index - 1);
            this.layerManager.updateThumbnails();
            this.updateLayersPanel();
            this.render();
            this.saveState('下移图层');
        }
    }

    // 复制图层
    duplicateLayer() {
        this.layerManager.duplicateLayer(this.layerManager.activeLayerIndex);
        this.layerManager.updateThumbnails();
        this.updateLayersPanel();
        this.render();
        this.saveState('复制图层');
        Utils.showMessage('图层已复制');
    }

    // 向下合并
    mergeLayerDown() {
        if (this.layerManager.activeLayerIndex > 0) {
            this.layerManager.mergeDown(this.layerManager.activeLayerIndex);
            this.layerManager.updateThumbnails();
            this.updateLayersPanel();
            this.render();
            this.saveState('合并图层');
            Utils.showMessage('图层已合并');
        }
    }

    // 更新图层面板
    updateLayersPanel() {
        const layersList = document.getElementById('layers-list');
        if (!layersList) return;

        layersList.innerHTML = '';
        const layers = this.layerManager.getLayers();
        
        layers.forEach((layer, index) => {
            const div = document.createElement('div');
            div.className = 'layer-item' + (index === this.layerManager.activeLayerIndex ? ' active' : '');
            div.innerHTML = `
                <input type="checkbox" ${layer.visible ? 'checked' : ''} data-index="${index}">
                <span>${layer.name}</span>
            `;
            
            div.addEventListener('click', () => {
                this.layerManager.setActiveLayer(index);
                this.updateLayersPanel();
            });

            const checkbox = div.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                layer.visible = checkbox.checked;
                this.render();
            });

            layersList.appendChild(div);
        });
    }

    // ========== 图像功能 ==========

    // 调整画布大小
    resizeCanvas() {
        const width = prompt('新宽度:', this.canvasWidth);
        if (!width) return;
        const height = prompt('新高度:', this.canvasHeight);
        if (!height) return;

        this.canvasWidth = parseInt(width);
        this.canvasHeight = parseInt(height);
        this.setupCanvas();
        this.layerManager.resize(this.canvasWidth, this.canvasHeight);
        this.render();
        this.saveState('调整画布大小');
        Utils.showMessage(`画布已调整为 ${this.canvasWidth}x${this.canvasHeight}`);
    }

    // 旋转画布
    rotateCanvas(angle) {
        this.layerManager.rotate(angle);
        this.canvasWidth = angle === 90 || angle === -90 
            ? this.layerManager.canvasHeight 
            : this.canvasWidth;
        this.canvasHeight = angle === 90 || angle === -90 
            ? this.layerManager.canvasWidth 
            : this.canvasHeight;
        this.setupCanvas();
        this.render();
        this.saveState('旋转画布');
        Utils.showMessage(`画布已旋转 ${angle}°`);
    }

    // 翻转画布
    flipCanvas(direction) {
        this.layerManager.flip(direction);
        this.render();
        this.saveState('翻转画布');
        Utils.showMessage(`画布已${direction === 'horizontal' ? '水平' : '垂直'}翻转`);
    }

    // 清空画布
    clearCanvas() {
        if (confirm('确定要清空画布吗？')) {
            const activeLayer = this.layerManager.getActiveLayer();
            if (activeLayer) {
                const ctx = activeLayer.canvas.getContext('2d');
                ctx.clearRect(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);
                this.render();
                this.saveState('清空画布');
            }
        }
    }

    // 应用效果
    applyEffect(effectName) {
        console.log('>>> applyEffect:', effectName);
        this.effectsManager.applyEffect(effectName);
        this.render();
        this.saveState('应用效果: ' + effectName);
    }

    // ========== 视图功能 ==========

    // 放大
    zoomIn() {
        this.zoom = Math.min(this.zoom * 1.25, 10);
        this.mainCanvas.style.transform = `scale(${this.zoom})`;
        this.previewCanvas.style.transform = `scale(${this.zoom})`;
        this.gridCanvas.style.transform = `scale(${this.zoom})`;
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }

    // 缩小
    zoomOut() {
        this.zoom = Math.max(this.zoom / 1.25, 0.1);
        this.mainCanvas.style.transform = `scale(${this.zoom})`;
        this.previewCanvas.style.transform = `scale(${this.zoom})`;
        this.gridCanvas.style.transform = `scale(${this.zoom})`;
        document.getElementById('zoom-level').textContent = Math.round(this.zoom * 100) + '%';
    }

    // 重置缩放
    resetZoom() {
        this.zoom = 1;
        this.mainCanvas.style.transform = 'scale(1)';
        this.previewCanvas.style.transform = 'scale(1)';
        this.gridCanvas.style.transform = 'scale(1)';
        document.getElementById('zoom-level').textContent = '100%';
    }

    // 切换网格
    toggleGrid() {
        this.showGrid = !this.showGrid;
        this.gridCanvas.style.display = this.showGrid ? 'block' : 'none';
        this.render();
        Utils.showMessage(this.showGrid ? '网格已显示' : '网格已隐藏');
    }

    // ========== 帮助功能 ==========

    // 显示关于
    showAbout() {
        Utils.showModal('关于 Pinta Web', `
            <div style="text-align: center; padding: 20px;">
                <h2>🎨 Pinta Web</h2>
                <p>版本 1.0</p>
                <p>一个基于 HTML5 Canvas 的轻量级图像编辑器</p>
                <hr>
                <p>功能包括：</p>
                <ul style="text-align: left;">
                    <li>多种绘图工具</li>
                    <li>图层管理</li>
                    <li>图像效果</li>
                    <li>撤销/重做</li>
                </ul>
            </div>
        `, null);
    }

    // 显示快捷键
    showShortcuts() {
        Utils.showModal('快捷键', `
            <div style="padding: 10px;">
                <table style="width: 100%; border-collapse: collapse;">
                    <tr><td><b>Ctrl + Z</b></td><td>撤销</td></tr>
                    <tr><td><b>Ctrl + Y</b></td><td>重做</td></tr>
                    <tr><td><b>Ctrl + S</b></td><td>保存</td></tr>
                    <tr><td><b>Ctrl + N</b></td><td>新建</td></tr>
                </table>
            </div>
        `, null);
    }
}

// ========== 初始化 ==========

console.log('>>> 开始初始化 Pinta Web...');

// 等待 DOM 加载完成
function initApp() {
    console.log('>>> initApp 被调用');
    
    // 延迟一点确保所有脚本都加载完成
    setTimeout(() => {
        console.log('>>> 创建 PintaApp 实例...');
        try {
            window.app = new PintaApp();
            window.pintaApp = window.app;
            console.log('>>> PintaApp 实例已创建');
            console.log('>>> app 对象:', typeof window.app);
            console.log('>>> pintaApp 对象:', typeof window.pintaApp);
        } catch (e) {
            console.error('>>> 创建 PintaApp 实例失败:', e);
            alert('初始化失败: ' + e.message);
        }
    }, 200);
}

// 根据文档状态选择初始化时机
if (document.readyState === 'loading') {
    console.log('>>> 文档正在加载，添加 DOMContentLoaded 监听器');
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    console.log('>>> 文档已加载完成，直接调用 initApp');
    initApp();
}

console.log('>>> 脚本执行完成');
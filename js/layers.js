// Pinta Web - 图层管理

class LayerManager {
    constructor(canvasWidth, canvasHeight) {
        this.layers = [];
        this.activeLayerIndex = -1;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
    }

    // 添加图层
    addLayer(name = null) {
        const layer = {
            id: Utils.generateId(),
            name: name || `图层 ${this.layers.length + 1}`,
            visible: true,
            opacity: 100,
            blendMode: 'normal',
            locked: false,
            canvas: Utils.createOffscreenCanvas(this.canvasWidth, this.canvasHeight),
            thumbnail: null
        };

        this.layers.unshift(layer);
        this.activeLayerIndex = 0;
        this.updateUI();
        this.updateThumbnails();

        return layer;
    }

    // 删除图层
    deleteLayer(index = this.activeLayerIndex) {
        if (this.layers.length > 1 && index >= 0 && index < this.layers.length) {
            this.layers.splice(index, 1);
            if (this.activeLayerIndex >= this.layers.length) {
                this.activeLayerIndex = this.layers.length - 1;
            }
            this.updateUI();
            this.updateThumbnails();
            return true;
        }
        return false;
    }

    // 获取所有图层
    getLayers() {
        return this.layers;
    }

    // 获取活动图层
    getActiveLayer() {
        if (this.activeLayerIndex >= 0 && this.activeLayerIndex < this.layers.length) {
            return this.layers[this.activeLayerIndex];
        }
        return null;
    }

    // 设置活动图层
    setActiveLayer(index) {
        if (index >= 0 && index < this.layers.length) {
            this.activeLayerIndex = index;
            this.updateUI();
        }
    }

    // 移动图层
    moveLayer(fromIndex, toIndex) {
        if (fromIndex >= 0 && fromIndex < this.layers.length &&
            toIndex >= 0 && toIndex < this.layers.length) {
            const layer = this.layers.splice(fromIndex, 1)[0];
            this.layers.splice(toIndex, 0, layer);
            if (this.activeLayerIndex === fromIndex) {
                this.activeLayerIndex = toIndex;
            }
            this.updateUI();
        }
    }

    // 上移图层
    moveLayerUp() {
        if (this.activeLayerIndex > 0) {
            this.moveLayer(this.activeLayerIndex, this.activeLayerIndex - 1);
        }
    }

    // 下移图层
    moveLayerDown() {
        if (this.activeLayerIndex < this.layers.length - 1) {
            this.moveLayer(this.activeLayerIndex, this.activeLayerIndex + 1);
        }
    }

    // 复制图层
    duplicateLayer(index = this.activeLayerIndex) {
        if (index >= 0 && index < this.layers.length) {
            const sourceLayer = this.layers[index];
            const newLayer = {
                id: Utils.generateId(),
                name: sourceLayer.name + ' 副本',
                visible: true,
                opacity: sourceLayer.opacity,
                blendMode: sourceLayer.blendMode,
                locked: false,
                canvas: Utils.copyCanvas(sourceLayer.canvas),
                thumbnail: null
            };

            this.layers.splice(index, 0, newLayer);
            this.activeLayerIndex = index;
            this.updateUI();
            this.updateThumbnails();

            return newLayer;
        }
        return null;
    }

    // 向下合并图层
    mergeLayerDown() {
        if (this.activeLayerIndex < this.layers.length - 1) {
            const topLayer = this.layers[this.activeLayerIndex];
            const bottomLayer = this.layers[this.activeLayerIndex + 1];

            const ctx = bottomLayer.canvas.getContext('2d');
            ctx.globalAlpha = topLayer.opacity / 100;
            ctx.globalCompositeOperation = topLayer.blendMode;
            ctx.drawImage(topLayer.canvas, 0, 0);
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';

            this.layers.splice(this.activeLayerIndex, 1);
            this.updateUI();
            this.updateThumbnails();
        }
    }

    // 合并所有图层
    flattenLayers() {
        const resultCanvas = Utils.createOffscreenCanvas(this.canvasWidth, this.canvasHeight);
        const ctx = resultCanvas.getContext('2d');

        // 从底部到顶部绘制所有可见图层
        for (let i = this.layers.length - 1; i >= 0; i--) {
            const layer = this.layers[i];
            if (layer.visible) {
                ctx.globalAlpha = layer.opacity / 100;
                ctx.globalCompositeOperation = layer.blendMode;
                ctx.drawImage(layer.canvas, 0, 0);
            }
        }

        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';

        return resultCanvas;
    }

    // 更新缩略图
    updateThumbnails() {
        this.layers.forEach(layer => {
            const thumbCanvas = Utils.createOffscreenCanvas(40, 40);
            const ctx = thumbCanvas.getContext('2d');
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, 40, 40);
            ctx.drawImage(layer.canvas, 0, 0, 40, 40);
            layer.thumbnail = thumbCanvas.toDataURL();
        });
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        const layersList = document.getElementById('layers-list');
        if (!layersList) return;

        layersList.innerHTML = '';

        this.layers.forEach((layer, index) => {
            const div = document.createElement('div');
            div.className = 'layer-item' + (index === this.activeLayerIndex ? ' active' : '');
            div.innerHTML = `
                <input type="checkbox" ${layer.visible ? 'checked' : ''} onclick="app.toggleLayerVisibility(${index})">
                <img class="layer-thumbnail" src="${layer.thumbnail || ''}" alt="${layer.name}">
                <span class="layer-name">${layer.name}</span>
            `;
            div.onclick = (e) => {
                if (e.target.tagName !== 'INPUT') {
                    app.setActiveLayer(index);
                }
            };
            layersList.appendChild(div);
        });

        // 更新图层不透明度控制
        const activeLayer = this.getActiveLayer();
        if (activeLayer) {
            document.getElementById('layer-opacity').value = activeLayer.opacity;
            document.getElementById('layer-opacity-value').textContent = activeLayer.opacity + '%';
            document.getElementById('blend-mode').value = activeLayer.blendMode;
        }
    }

    // 设置图层属性
    setLayerProperty(index, property, value) {
        if (index >= 0 && index < this.layers.length) {
            this.layers[index][property] = value;
            this.updateUI();
        }
    }

    // 获取图层状态（用于历史记录）
    getState() {
        return {
            layers: this.layers.map(layer => ({
                id: layer.id,
                name: layer.name,
                visible: layer.visible,
                opacity: layer.opacity,
                blendMode: layer.blendMode,
                locked: layer.locked,
                imageData: layer.canvas.toDataURL()
            })),
            activeLayerIndex: this.activeLayerIndex
        };
    }

    // 保存状态（别名方法，供app.js调用）
    saveState() {
        return this.getState();
    }

    // 恢复图层状态（从历史记录）
    restoreState(state) {
        this.layers = state.layers.map(layerData => {
            const layer = {
                id: layerData.id,
                name: layerData.name,
                visible: layerData.visible,
                opacity: layerData.opacity,
                blendMode: layerData.blendMode,
                locked: layerData.locked,
                canvas: Utils.createOffscreenCanvas(this.canvasWidth, this.canvasHeight),
                thumbnail: null
            };

            const img = new Image();
            img.onload = () => {
                const ctx = layer.canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                this.updateThumbnails();
            };
            img.src = layerData.imageData;

            return layer;
        });

        this.activeLayerIndex = state.activeLayerIndex;
        this.updateUI();
    }

    // 调整画布大小
    resizeCanvas(newWidth, newHeight) {
        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;

        this.layers.forEach(layer => {
            const newCanvas = Utils.createOffscreenCanvas(newWidth, newHeight);
            const ctx = newCanvas.getContext('2d');
            ctx.drawImage(layer.canvas, 0, 0);
            layer.canvas = newCanvas;
        });

        this.updateThumbnails();
    }

    // 旋转画布
    rotate(angle) {
        const isRotate90 = Math.abs(angle) === 90;
        const newWidth = isRotate90 ? this.canvasHeight : this.canvasWidth;
        const newHeight = isRotate90 ? this.canvasWidth : this.canvasHeight;

        this.layers.forEach(layer => {
            const newCanvas = Utils.createOffscreenCanvas(newWidth, newHeight);
            const ctx = newCanvas.getContext('2d');
            
            if (angle === 90) {
                ctx.translate(newWidth, 0);
                ctx.rotate(Math.PI / 2);
            } else if (angle === -90) {
                ctx.translate(0, newHeight);
                ctx.rotate(-Math.PI / 2);
            } else if (angle === 180) {
                ctx.translate(newWidth, newHeight);
                ctx.rotate(Math.PI);
            }
            
            ctx.drawImage(layer.canvas, 0, 0);
            layer.canvas = newCanvas;
        });

        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;
        this.updateThumbnails();
    }

    // 翻转画布
    flip(direction) {
        this.layers.forEach(layer => {
            const newCanvas = Utils.createOffscreenCanvas(this.canvasWidth, this.canvasHeight);
            const ctx = newCanvas.getContext('2d');
            
            if (direction === 'horizontal') {
                ctx.translate(this.canvasWidth, 0);
                ctx.scale(-1, 1);
            } else {
                ctx.translate(0, this.canvasHeight);
                ctx.scale(1, -1);
            }
            
            ctx.drawImage(layer.canvas, 0, 0);
            layer.canvas = newCanvas;
        });

        this.updateThumbnails();
    }

    // 重置画布大小（调整大小）
    resize(width, height) {
        this.resizeCanvas(width, height);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LayerManager;
}

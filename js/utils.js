// Pinta Web - 工具函数

const Utils = {
    // 生成唯一ID
    generateId: () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    },

    // 颜色转换
    hexToRgb: (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    },

    rgbToHex: (r, g, b) => {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },

    // 限制值在范围内
    clamp: (value, min, max) => {
        return Math.min(Math.max(value, min), max);
    },

    // 获取鼠标在画布上的位置
    getMousePos: (canvas, evt) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (evt.clientX - rect.left) * scaleX,
            y: (evt.clientY - rect.top) * scaleY
        };
    },

    // 计算两点之间的距离
    distance: (x1, y1, x2, y2) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    },

    // 角度转弧度
    degToRad: (deg) => {
        return deg * Math.PI / 180;
    },

    // 弧度转角度
    radToDeg: (rad) => {
        return rad * 180 / Math.PI;
    },

    // 深拷贝对象
    deepClone: (obj) => {
        return JSON.parse(JSON.stringify(obj));
    },

    // 防抖函数
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // 节流函数
    throttle: (func, limit) => {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    // 创建离屏Canvas
    createOffscreenCanvas: (width, height) => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    // 复制Canvas内容
    copyCanvas: (sourceCanvas) => {
        const targetCanvas = document.createElement('canvas');
        targetCanvas.width = sourceCanvas.width;
        targetCanvas.height = sourceCanvas.height;
        const ctx = targetCanvas.getContext('2d');
        ctx.drawImage(sourceCanvas, 0, 0);
        return targetCanvas;
    },

    // 下载文件
    downloadFile: (dataUrl, filename) => {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // 显示状态消息
    showMessage: (message, duration = 3000) => {
        const statusMessage = document.getElementById('status-message');
        if (statusMessage) {
            statusMessage.textContent = message;
            if (duration > 0) {
                setTimeout(() => {
                    statusMessage.textContent = '就绪';
                }, duration);
            }
        }
    },

    // 显示模态对话框
    showModal: (title, content, onOk, onCancel) => {
        const overlay = document.getElementById('modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const contentEl = document.getElementById('modal-content');
        const okBtn = document.getElementById('modal-ok');
        const cancelBtn = document.getElementById('modal-cancel');
        const closeBtn = document.getElementById('modal-close');

        titleEl.textContent = title;
        contentEl.innerHTML = content;
        overlay.classList.remove('hidden');

        const closeModal = () => {
            overlay.classList.add('hidden');
            okBtn.onclick = null;
            cancelBtn.onclick = null;
            closeBtn.onclick = null;
        };

        okBtn.onclick = () => {
            if (onOk) onOk();
            closeModal();
        };

        cancelBtn.onclick = () => {
            if (onCancel) onCancel();
            closeModal();
        };

        closeBtn.onclick = cancelBtn.onclick;
    },

    // 快捷键处理
    shortcuts: {
        'ctrl+z': 'undo',
        'ctrl+y': 'redo',
        'ctrl+s': 'save',
        'ctrl+n': 'new',
        'ctrl+o': 'open',
        'delete': 'delete',
        'p': 'pencil',
        'b': 'brush',
        'e': 'eraser',
        'g': 'fill',
        't': 'text',
        'r': 'rectangle',
        'o': 'ellipse',
        'l': 'line',
        's': 'select-rect',
        'm': 'move',
        'i': 'color-picker',
        'z': 'zoom',
        'x': 'swap-colors',
        'd': 'reset-colors'
    },

    // 解析快捷键
    parseShortcut: (evt) => {
        let shortcut = '';
        if (evt.ctrlKey || evt.metaKey) shortcut += 'ctrl+';
        if (evt.shiftKey) shortcut += 'shift+';
        if (evt.altKey) shortcut += 'alt+';
        shortcut += evt.key.toLowerCase();
        return shortcut;
    }
};

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}

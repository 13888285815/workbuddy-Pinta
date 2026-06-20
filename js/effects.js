// Pinta Web - 图像效果

class EffectsManager {
    constructor(app) {
        this.app = app;
    }

    // 应用效果
    applyEffect(effectName) {
        const activeLayer = this.app.layerManager.getActiveLayer();
        if (!activeLayer) {
            Utils.showMessage('请先选择一个图层');
            return;
        }

        const ctx = activeLayer.canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, activeLayer.canvas.width, activeLayer.canvas.height);

        switch (effectName) {
            case 'blur':
                this.applyBlur(imageData);
                break;
            case 'sharpen':
                this.applySharpen(imageData);
                break;
            case 'emboss':
                this.applyEmboss(imageData);
                break;
            case 'grayscale':
                this.applyGrayscale(imageData);
                break;
            case 'invert':
                this.applyInvert(imageData);
                break;
            case 'sepia':
                this.applySepia(imageData);
                break;
            case 'brightness':
                this.showBrightnessContrastDialog(imageData);
                return;
        }

        ctx.putImageData(imageData, 0, 0);
        this.app.saveState(`应用${effectName}效果`);
        this.app.render();
        this.app.layerManager.updateThumbnails();
    }

    // 模糊效果
    applyBlur(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const radius = 2;

        const tempData = new Uint8ClampedArray(data);

        for (let y = radius; y < height - radius; y++) {
            for (let x = radius; x < width - radius; x++) {
                let r = 0, g = 0, b = 0, count = 0;

                for (let dy = -radius; dy <= radius; dy++) {
                    for (let dx = -radius; dx <= radius; dx++) {
                        const idx = ((y + dy) * width + (x + dx)) * 4;
                        r += tempData[idx];
                        g += tempData[idx + 1];
                        b += tempData[idx + 2];
                        count++;
                    }
                }

                const idx = (y * width + x) * 4;
                data[idx] = r / count;
                data[idx + 1] = g / count;
                data[idx + 2] = b / count;
            }
        }
    }

    // 锐化效果
    applySharpen(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;

        const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];

        this.applyConvolution(imageData, kernel, 3);
    }

    // 浮雕效果
    applyEmboss(imageData) {
        const kernel = [
            -2, -1, 0,
            -1, 1, 1,
            0, 1, 2
        ];

        this.applyConvolution(imageData, kernel, 3);
    }

    // 应用卷积核
    applyConvolution(imageData, kernel, kernelSize) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const tempData = new Uint8ClampedArray(data);

        const half = Math.floor(kernelSize / 2);

        for (let y = half; y < height - half; y++) {
            for (let x = half; x < width - half; x++) {
                let r = 0, g = 0, b = 0;

                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const idx = ((y + ky - half) * width + (x + kx - half)) * 4;
                        const weight = kernel[ky * kernelSize + kx];
                        r += tempData[idx] * weight;
                        g += tempData[idx + 1] * weight;
                        b += tempData[idx + 2] * weight;
                    }
                }

                const idx = (y * width + x) * 4;
                data[idx] = Utils.clamp(r, 0, 255);
                data[idx + 1] = Utils.clamp(g, 0, 255);
                data[idx + 2] = Utils.clamp(b, 0, 255);
            }
        }
    }

    // 灰度效果
    applyGrayscale(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }
    }

    // 反色效果
    applyInvert(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
        }
    }

    // 复古效果
    applySepia(imageData) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            data[i] = Utils.clamp((r * 0.393) + (g * 0.769) + (b * 0.189), 0, 255);
            data[i + 1] = Utils.clamp((r * 0.349) + (g * 0.686) + (b * 0.168), 0, 255);
            data[i + 2] = Utils.clamp((r * 0.272) + (g * 0.534) + (b * 0.131), 0, 255);
        }
    }

    // 显示亮度/对比度对话框
    showBrightnessContrastDialog(imageData) {
        Utils.showModal('亮度/对比度', `
            <div class="form-group">
                <label>亮度: <span id="brightness-value">0</span></label>
                <input type="range" id="brightness-slider" min="-100" max="100" value="0">
            </div>
            <div class="form-group">
                <label>对比度: <span id="contrast-value">0</span></label>
                <input type="range" id="contrast-slider" min="-100" max="100" value="0">
            </div>
        `, () => {
            const brightness = parseInt(document.getElementById('brightness-slider').value);
            const contrast = parseInt(document.getElementById('contrast-slider').value);
            this.applyBrightnessContrast(imageData, brightness, contrast);

            const ctx = this.app.layerManager.getActiveLayer().canvas.getContext('2d');
            ctx.putImageData(imageData, 0, 0);
            this.app.saveState('调整亮度/对比度');
            this.app.render();
            this.app.layerManager.updateThumbnails();
        });

        // 实时预览
        const brightnessSlider = document.getElementById('brightness-slider');
        const contrastSlider = document.getElementById('contrast-slider');

        brightnessSlider.addEventListener('input', (e) => {
            document.getElementById('brightness-value').textContent = e.target.value;
        });

        contrastSlider.addEventListener('input', (e) => {
            document.getElementById('contrast-value').textContent = e.target.value;
        });
    }

    // 应用亮度/对比度
    applyBrightnessContrast(imageData, brightness, contrast) {
        const data = imageData.data;
        const brightnessFactor = brightness * 2.55;
        const contrastFactor = (contrast + 100) / 100;
        const contrastOffset = 128 * (1 - contrastFactor);

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Utils.clamp((data[i] * contrastFactor + contrastOffset) + brightnessFactor, 0, 255);
            data[i + 1] = Utils.clamp((data[i + 1] * contrastFactor + contrastOffset) + brightnessFactor, 0, 255);
            data[i + 2] = Utils.clamp((data[i + 2] * contrastFactor + contrastOffset) + brightnessFactor, 0, 255);
        }
    }

    // 色相/饱和度调整
    applyHueSaturation(imageData, hue, saturation, lightness) {
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const hsl = this.rgbToHsl(data[i], data[i + 1], data[i + 2]);

            hsl.h = (hsl.h + hue / 360) % 1;
            hsl.s = Utils.clamp(hsl.s + saturation / 100, 0, 1);
            hsl.l = Utils.clamp(hsl.l + lightness / 100, 0, 1);

            const rgb = this.hslToRgb(hsl.h, hsl.s, hsl.l);

            data[i] = rgb.r;
            data[i + 1] = rgb.g;
            data[i + 2] = rgb.b;
        }
    }

    // RGB 转 HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                    break;
                case g:
                    h = ((b - r) / d + 2) / 6;
                    break;
                case b:
                    h = ((r - g) / d + 4) / 6;
                    break;
            }
        }

        return { h, s, l };
    }

    // HSL 转 RGB
    hslToRgb(h, s, l) {
        let r, g, b;

        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1 / 6) return p + (q - p) * 6 * t;
                if (t < 1 / 2) return q;
                if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                return p;
            };

            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;

            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }

        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EffectsManager;
}

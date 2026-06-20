// Pinta Web - 历史记录管理

class HistoryManager {
    constructor(maxHistory = 50) {
        this.history = [];
        this.currentIndex = -1;
        this.maxHistory = maxHistory;
    }

    // 添加历史记录
    addState(state, description = '操作') {
        // 删除当前位置之后的所有历史
        this.history = this.history.slice(0, this.currentIndex + 1);

        // 添加新状态
        this.history.push({
            state: Utils.deepClone(state),
            description: description,
            timestamp: Date.now()
        });

        // 限制历史记录数量
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.currentIndex++;
        }

        this.updateUI();
    }

    // 撤销
    undo() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateUI();
            return this.history[this.currentIndex].state;
        }
        return null;
    }

    // 重做
    redo() {
        if (this.currentIndex < this.history.length - 1) {
            this.currentIndex++;
            this.updateUI();
            return this.history[this.currentIndex].state;
        }
        return null;
    }

    // 获取当前状态
    getCurrentState() {
        if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
            return this.history[this.currentIndex].state;
        }
        return null;
    }

    // 是否可以撤销
    canUndo() {
        return this.currentIndex > 0;
    }

    // 是否可以重做
    canRedo() {
        return this.currentIndex < this.history.length - 1;
    }

    // 清空历史
    clear() {
        this.history = [];
        this.currentIndex = -1;
        this.updateUI();
    }

    // 更新UI
    updateUI() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        historyList.innerHTML = '';

        this.history.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'history-item' + (index === this.currentIndex ? ' active' : '');
            div.textContent = item.description;
            div.onclick = () => this.jumpTo(index);
            historyList.appendChild(div);
        });

        // 滚动到当前项
        const activeItem = historyList.querySelector('.active');
        if (activeItem) {
            activeItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    // 跳转到指定历史
    jumpTo(index) {
        if (index >= 0 && index < this.history.length) {
            this.currentIndex = index;
            this.updateUI();
            return this.history[index].state;
        }
        return null;
    }

    // 获取历史记录数量
    getHistoryCount() {
        return this.history.length;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HistoryManager;
}

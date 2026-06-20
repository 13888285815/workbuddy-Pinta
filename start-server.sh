#!/bin/bash

# Pinta Web 服务器启动脚本 (macOS/Linux)

echo "================================"
echo "Pinta Web 服务器"
echo "================================"
echo ""

# 检查 Python 是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未找到 Python 3"
    echo "请安装 Python 3"
    exit 1
fi

echo "启动服务器..."
echo ""

python3 server.py

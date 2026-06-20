#!/bin/bash

# Pinta 构建脚本
# 用于构建 Pinta 项目

set -e

echo "================================"
echo "Pinta 项目构建脚本"
echo "================================"
echo ""

# 检查 .NET SDK 是否安装
if ! command -v dotnet &> /dev/null; then
    echo "错误: 未找到 .NET SDK"
    echo "请从 https://dotnet.microsoft.com/ 安装 .NET 8 SDK 或更高版本"
    exit 1
fi

# 显示 .NET 版本
echo "检测到的 .NET 版本:"
dotnet --version
echo ""

# 检查依赖项（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "检测到 macOS 系统"
    echo ""

    # 检查 GTK 库路径
    if [[ $(uname -m) == 'arm64' ]]; then
        # Apple Silicon
        if [ -z "$DYLD_LIBRARY_PATH" ]; then
            echo "警告: DYLD_LIBRARY_PATH 未设置"
            echo "对于 Apple Silicon，建议设置: export DYLD_LIBRARY_PATH=/opt/homebrew/lib"
            echo ""
        fi
    else
        # Intel
        if [ -z "$DYLD_LIBRARY_PATH" ]; then
            echo "警告: DYLD_LIBRARY_PATH 未设置"
            echo "对于 Intel Mac，可能需要设置: export DYLD_LIBRARY_PATH=/usr/local/lib"
            echo ""
        fi
    fi
fi

# 清理之前的构建
echo "清理之前的构建..."
dotnet clean
echo ""

# 还原依赖项
echo "还原依赖项..."
dotnet restore
echo ""

# 构建项目
echo "构建项目..."
dotnet build --configuration Release
echo ""

echo "================================"
echo "构建完成！"
echo "================================"
echo ""
echo "输出目录: build/bin/"
echo ""
echo "要运行项目，请执行: ./run.sh"
echo "要运行测试，请执行: ./test.sh"

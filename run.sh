#!/bin/bash

# Pinta 运行脚本
# 用于运行 Pinta 应用程序

set -e

echo "================================"
echo "Pinta 应用程序启动脚本"
echo "================================"
echo ""

# 检查构建是否存在
if [ ! -f "build/bin/Pinta.dll" ]; then
    echo "错误: 未找到构建文件"
    echo "请先运行 ./build.sh 构建项目"
    exit 1
fi

# 设置 GTK 库路径（macOS）
if [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ $(uname -m) == 'arm64' ]]; then
        # Apple Silicon
        export DYLD_LIBRARY_PATH=/opt/homebrew/lib:$DYLD_LIBRARY_PATH
    else
        # Intel
        export DYLD_LIBRARY_PATH=/usr/local/lib:$DYLD_LIBRARY_PATH
    fi
fi

echo "启动 Pinta..."
echo ""

# 运行应用程序
dotnet run --project Pinta --configuration Release

#!/bin/bash

# Pinta 测试脚本
# 用于运行项目的单元测试

set -e

echo "================================"
echo "Pinta 测试脚本"
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

# 检查 .NET 8.0 运行时是否安装
echo "检查 .NET 运行时..."
if ! dotnet --list-runtimes | grep -q "Microsoft.NETCore.App.*8.0"; then
    echo "警告: 未检测到 .NET 8.0 运行时"
    echo "测试需要 .NET 8.0 运行时"
    echo ""
    echo "您有以下选项："
    echo "1. 安装 .NET 8.0 运行时: https://dotnet.microsoft.com/download/dotnet/8.0"
    echo "2. 或者使用环境变量指定目标框架: export TargetFramework=net10.0"
    echo ""
    read -p "是否继续尝试运行测试？(y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo "运行测试..."
echo ""

# 运行测试
dotnet test --verbosity normal

echo ""
echo "================================"
echo "测试完成！"
echo "================================"

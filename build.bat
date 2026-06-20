@echo off
REM Pinta 构建脚本 (Windows)
REM 用于构建 Pinta 项目

echo ================================
echo Pinta 项目构建脚本
echo ================================
echo.

REM 检查 .NET SDK 是否安装
dotnet --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 .NET SDK
    echo 请从 https://dotnet.microsoft.com/ 安装 .NET 8 SDK 或更高版本
    exit /b 1
)

REM 显示 .NET 版本
echo 检测到的 .NET 版本:
dotnet --version
echo.

REM 清理之前的构建
echo 清理之前的构建...
dotnet clean
echo.

REM 还原依赖项
echo 还原依赖项...
dotnet restore
echo.

REM 构建项目
echo 构建项目...
dotnet build --configuration Release
echo.

echo ================================
echo 构建完成！
echo ================================
echo.
echo 输出目录: build\bin\
echo.
echo 要运行项目，请执行: run.bat
echo 要运行测试，请执行: test.bat

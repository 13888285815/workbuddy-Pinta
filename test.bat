@echo off
REM Pinta 测试脚本 (Windows)
REM 用于运行项目的单元测试

echo ================================
echo Pinta 测试脚本
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

echo 运行测试...
echo.

REM 运行测试
dotnet test --verbosity normal

echo.
echo ================================
echo 测试完成！
echo ================================

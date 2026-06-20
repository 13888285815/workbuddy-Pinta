@echo off
REM Pinta 运行脚本 (Windows)
REM 用于运行 Pinta 应用程序

echo ================================
echo Pinta 应用程序启动脚本
echo ================================
echo.

REM 检查构建是否存在
if not exist "build\bin\Pinta.dll" (
    echo 错误: 未找到构建文件
    echo 请先运行 build.bat 构建项目
    exit /b 1
)

echo 启动 Pinta...
echo.

REM 运行应用程序
dotnet run --project Pinta --configuration Release

@echo off
REM Pinta Web 服务器启动脚本 (Windows)

echo ================================
echo Pinta Web 服务器
echo ================================
echo.

REM 检查 Python 是否安装
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到 Python
    echo 请从 https://www.python.org/ 安装 Python 3
    pause
    exit /b 1
)

echo 启动服务器...
echo.

python server.py

pause

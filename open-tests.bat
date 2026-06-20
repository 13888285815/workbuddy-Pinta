@echo off
REM Pinta Web - 打开测试页面

echo.
echo ========================================
echo Pinta Web 测试工具
echo ========================================
echo.
echo 请选择要打开的页面：
echo 1. 简化版测试页面 (simple.html)
echo 2. 完整版 Pinta Web (index.html)
echo 3. 诊断测试页面 (test.html)
echo.
set /p choice=请输入选项 (1/2/3):

if "%choice%"=="1" (
    start http://localhost:8000/simple.html
) else if "%choice%"=="2" (
    start http://localhost:8000/index.html
) else if "%choice%"=="3" (
    start http://localhost:8000/test.html
) else (
    echo 无效选项！
)

echo.
echo 如果浏览器没有自动打开，请手动访问:
echo http://localhost:8000
pause

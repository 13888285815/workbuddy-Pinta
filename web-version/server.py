#!/usr/bin/env python3
"""
Pinta Web - 简单的HTTP服务器
用于在本地运行 Pinta Web 应用
"""

import http.server
import socketserver
import os
import sys
from pathlib import Path

# 配置
PORT = 8000
DIRECTORY = Path(__file__).parent

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """自定义HTTP请求处理器"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(DIRECTORY), **kwargs)

    def end_headers(self):
        # 添加CORS头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        """处理OPTIONS请求"""
        self.send_response(200)
        self.end_headers()

def main():
    """启动服务器"""
    try:
        with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
            print(f"""
╔════════════════════════════════════════════════════════════╗
║                     Pinta Web 服务器                        ║
╠════════════════════════════════════════════════════════════╣
║  服务器已启动！                                              ║
║                                                              ║
║  本地访问地址:                                                ║
║  → http://localhost:{PORT}                                    ║
║  → http://127.0.0.1:{PORT}                                    ║
║                                                              ║
║  按 Ctrl+C 停止服务器                                        ║
╚════════════════════════════════════════════════════════════╝
            """)

            # 尝试打开浏览器
            try:
                import webbrowser
                webbrowser.open(f'http://localhost:{PORT}')
                print("✓ 已自动打开浏览器")
            except:
                print("请手动在浏览器中打开上述地址")

            print("\n服务器日志:")
            print("-" * 60)

            httpd.serve_forever()

    except KeyboardInterrupt:
        print("\n\n服务器已停止")
        sys.exit(0)
    except OSError as e:
        if e.errno == 98:  # 端口已被占用
            print(f"错误: 端口 {PORT} 已被占用")
            print(f"请尝试使用其他端口: python3 server.py <端口号>")
            sys.exit(1)
        else:
            raise
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # 检查是否指定了端口
    if len(sys.argv) > 1:
        try:
            PORT = int(sys.argv[1])
        except ValueError:
            print(f"错误: 无效的端口号 '{sys.argv[1]}'")
            sys.exit(1)

    main()

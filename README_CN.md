# Pinta - 简单的 Gtk# 绘图程序

<a href='https://flathub.org/apps/com.github.PintaProject.Pinta'><img width='200' alt='在 Flathub 上获取' src='https://flathub.org/api/badge?locale=en'/></a>
[![从 Snap Store 获取](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/pinta)

[![翻译状态](https://hosted.weblate.org/widget/pinta/pinta/287x66-grey.png)](https://hosted.weblate.org/engage/pinta/)
[![构建状态](https://github.com/PintaProject/Pinta/workflows/Build/badge.svg)](https://github.com/PintaProject/Pinta/actions)

版权所有 (C) 2010 Jonathan Pobst <monkey AT jpobst DOT com>

Pinta 是 [Paint.Net 3.0](http://www.getpaint.net/) 的 GTK 克隆版本，支持 Linux、Windows 和 macOS。

原始 Pinta 代码采用 MIT 许可证授权：
有关 MIT 许可证，请参阅 `license-mit.txt`

来自 Paint.Net 3.36 的代码在 MIT 许可证下使用，并保留源文件上的原始标题。

有关 Paint.Net 的原始许可证，请参阅 `license-pdn.txt`。

## 图标来源：

- [Paint.Net 3.0](http://www.getpaint.net/)
在 [MIT 许可证](http://www.opensource.org/licenses/mit-license.php)下使用

- [Silk 图标集](https://github.com/markjames/famfamfam-silk-icons)
在 [知识共享署名 3.0 许可证](http://creativecommons.org/licenses/by/3.0/)下使用

- [Fugue 图标集](https://p.yusukekamiyamane.com)
在 [知识共享署名 3.0 许可证](http://creativecommons.org/licenses/by/3.0/)下使用

- Pinta 贡献者，采用与项目本身相同的许可证
（有关此类图标的列表，请参阅 `Pinta.Resources/icons/pinta-icons.md`）

## 在 Windows 上构建

首先，安装所需的 GTK 相关依赖项：
- 通过 [MSYS2](https://www.msys2.org) 安装 MinGW64
- 从 MinGW64 终端运行 `pacman -S mingw-w64-x86_64-libadwaita mingw-w64-x86_64-webp-pixbuf-loader`

然后可以通过在 [Visual Studio](https://visualstudio.microsoft.com/) 中打开 `Pinta.sln` 来构建 Pinta。
确保通过 Visual Studio 安装程序安装了 .NET 8。

在命令行上构建：
- [安装 .NET 8 SDK](https://dotnet.microsoft.com/)
- 构建：
  - `dotnet build`
- 运行：
  - `dotnet run --project Pinta`

## 在 macOS 上构建

- 安装 .NET 8 和 GTK4
  - `brew install dotnet-sdk libadwaita adwaita-icon-theme gettext webp-pixbuf-loader`
  - 对于 Apple Silicon，在环境中设置 `DYLD_LIBRARY_PATH=/opt/homebrew/lib`，以便 Pinta 可以加载 GTK 库
  - 对于 Intel，在使用 .NET 9 或更高版本时，可能需要设置 `DYLD_LIBRARY_PATH=/usr/local/lib`
- 构建：
  - `dotnet build`
- 运行：
  - `dotnet run --project Pinta`

## 在 Linux 上构建

- 按照 Linux 发行版的说明安装 [.NET 8](https://dotnet.microsoft.com/)
- 安装其他依赖项（说明适用于 Ubuntu 22.10，但对于其他发行版应该类似）：
  - `sudo apt install autotools-dev autoconf-archive gettext intltool libadwaita-1-dev`
  - 最低库版本：`gtk` >= 4.18 和 `libadwaita` >= 1.7
  - 可选依赖项：`webp-pixbuf-loader`
- 构建（选项 1，用于开发和测试）：
  - `dotnet build`
  - `dotnet run --project Pinta`
- 构建（选项 2，用于安装）：
  - `./autogen.sh`
    - 如果从 tarball 构建，请改为运行 `./configure`
    - 添加 `--prefix=<安装目录>` 参数以安装到 `/usr/local` 以外的目录
  - `make install`

## 快速开始

### 使用构建脚本

我们提供了便捷的构建脚本：

**macOS/Linux:**
```bash
# 构建项目
./build.sh

# 运行项目
./run.sh

# 运行测试
./test.sh
```

**Windows:**
```cmd
REM 构建项目
build.bat

REM 运行项目
run.bat

REM 运行测试
test.bat
```

### 使用 .NET CLI

```bash
# 构建项目
dotnet build

# 运行项目
dotnet run --project Pinta

# 运行测试
dotnet test

# 发布项目
dotnet publish -c Release
```

## 项目结构

```
workbuddy-Pinta/
├── Pinta/                    # 主应用程序
├── Pinta.Core/              # 核心功能库
├── Pinta.Docking/           # 停靠窗口功能
├── Pinta.Effects/           # 图像效果
├── Pinta.Gui.Widgets/       # GUI 组件
├── Pinta.Gui.Addins/        # 插件 GUI
├── Pinta.Tools/             # 工具库
├── Pinta.Resources/         # 资源文件（图标、翻译等）
├── tests/                   # 测试项目
│   ├── Pinta.Core.Tests/
│   ├── Pinta.Effects.Tests/
│   └── PintaBenchmarks/
├── installer/               # 安装程序相关文件
└── po/                      # 翻译文件
```

## 功能特性

- **绘图工具**：铅笔、画笔、橡皮擦、油漆桶等
- **选择工具**：矩形选择、椭圆选择、套索工具等
- **图层支持**：支持多图层编辑
- **效果滤镜**：模糊、锐化、扭曲等多种效果
- **颜色调整**：亮度/对比度、色相/饱和度、曲线等
- **撤销/重做**：完整的历史记录支持
- **插件系统**：支持通过插件扩展功能

## 获取帮助 / 贡献

- 您可以在 [GitHub Discussions](https://github.com/PintaProject/Pinta/discussions) 获取技术帮助
- 您可以在 [GitHub Issues](https://github.com/PintaProject/Pinta/issues) 报告错误/问题
- 您可以在 [Ideas 分类](https://github.com/PintaProject/Pinta/discussions/categories/ideas)提出建议
- 您可以帮助将 Pinta [翻译成您的母语](https://hosted.weblate.org/engage/pinta/)
- 您可以在 [GitHub](https://github.com/PintaProject/Pinta) 上 fork 项目
- 您可以在 irc.gnome.org 的 #pinta 频道获取帮助
- 有关每个版本的显著更改的详细信息，请查看 [CHANGELOG](https://github.com/PintaProject/Pinta/blob/master/CHANGELOG.md)
- 有关补丁的详细信息，请查看仓库中的 `patch-guidelines.md`

## 开发环境设置

### 推荐的 IDE

- **Visual Studio Code**：轻量级，支持 C# 扩展
- **Visual Studio**（Windows）：完整的 IDE 支持
- **JetBrains Rider**：跨平台的 .NET IDE

### 调试

在 Visual Studio Code 中调试：
1. 安装 C# 扩展
2. 打开项目文件夹
3. 按 F5 开始调试

### 运行测试

```bash
# 运行所有测试
dotnet test

# 运行特定测试项目
dotnet test tests/Pinta.Core.Tests

# 运行基准测试
dotnet run --project tests/PintaBenchmarks
```

## 代码签名政策

- Windows 上的免费代码签名由 [SignPath.io](https://about.signpath.io/) 提供，证书由 [SignPath Foundation](https://signpath.org/) 提供
- 提交者和批准者：[Pinta 维护者](https://github.com/orgs/PintaProject/people)
- 隐私政策：除非用户或安装或操作它的人明确要求，否则此程序不会将任何信息传输到其他网络系统

## 许可证

本项目采用 MIT 许可证。有关详细信息，请参阅 [license-mit.txt](license-mit.txt) 文件。

## 致谢

感谢所有为 Pinta 项目做出贡献的开发者、设计师和翻译人员！

# qwq - 浏览器增强工具

![Extension Icon](icon.png)

## 简介 (Introduction)

qwq 是一个集成了多种实用工具，从页面截图、IP 地址查询到高级的 DeepSeek 对话背景自定义和图像编辑功能的小插件 qwq

qwq is a feature-rich browser extension designed to enhance your daily browsing experience. It integrates a variety of practical tools, ranging from page screenshots and IP address lookups to advanced DeepSeek chat background customization and image editing features, and many more convenient operations.

## 功能列表 (Features)

*   **页面截图到剪贴板 (Page Screenshot to Clipboard)**: 快速截取当前可见页面并复制到剪贴板
*   **查看并复制出网 IP (View and Copy Egress IP)**: 一键查询并复制您的公共 IP 地址
*   **剪贴板图像另存为 (Save Clipboard Image As)**: 将剪贴板中的图像保存到本地文件
*   **剪贴板图像编辑 (Clipboard Image Editor)**: 打开一个简单的图像编辑器，对剪贴板中的图片进行亮度、对比度、饱和度、锐化调整和裁剪
*   **填满 GitHub 贡献格 (Fill GitHub Contribution Grid)**: 在 GitHub 个人资料页上，将未点亮的贡献格子填充为最深绿色（仅为视觉效果，不影响实际贡献）
*   **抹除当前页面缓存 (Clear Current Page Cache)**: 清除当前网站的所有缓存数据（包括 Cookies, Local Storage 等）
*   **页面密码明文显示 (Show Page Passwords in Plain Text)**: 将当前页面所有密码输入框的内容以明文形式显示
*   **推特预览自动点赞 (Twitter Preview Auto-Like)**: 自动点赞 Twitter (X.com) 页面上加载的推文预览
*   **测试发送系统通知 (Test System Notification)**: 自定义并发送一个系统通知，支持自定义标题、消息和图标
*   **修改 DeepSeek 对话背景 (Customize DeepSeek Chat Background)**: 为 `chat.deepseek.com` 网站设置自定义背景图片，支持调整透明度、填充方式、位置，并可选择背景图片下方的底色（黑/白）所有设置将持久化保存

## 安装 (Installation)

### 从微软 Edge 扩展中心安装 (Install from Microsoft Edge Add-ons)

qwq 扩展已上架到 [微软 Edge 扩展中心](https://microsoftedge.microsoft.com/addons/detail/qwq/oigkjikdbpkbkcejacmppafakjgmjpoi)

您可以通过访问上述链接，点击“获取”按钮即可轻松安装

qwq is available on the [Microsoft Edge Add-ons store](https://microsoftedge.microsoft.com/addons/detail/qwq/oigkjikdbpkbkcejacmppafakjgmjpoi).

You can easily install it by visiting the link above and clicking the "Get" button.

### 从 GitHub 手动安装 (Manual Installation from GitHub)

如果您希望从源代码手动安装，请按照以下步骤操作：

If you prefer to install manually from the source code, please follow these steps:

1.  **克隆仓库 (Clone the repository)**:
    ```bash
    git clone https://github.com/ra1nyxin/qwq.git
    ```
2.  **打开扩展管理页面 (Open Extension Management Page)**:
    *   在 Microsoft Edge 浏览器中，访问 `edge://extensions`
    *   In Microsoft Edge, navigate to `edge://extensions`.
3.  **开启开发者模式 (Enable Developer Mode)**:
    *   在扩展管理页面的右上角，打开“开发者模式”开关
    *   Toggle on "Developer mode" in the top right corner of the extensions page.
4.  **加载解压缩的扩展 (Load Unpacked Extension)**:
    *   点击“加载解压缩的扩展”按钮
    *   Click the "Load unpacked" button.
5.  **选择扩展目录 (Select Extension Directory)**:
    *   导航到您克隆的 `qwq` 仓库目录，并选择它
    *   Navigate to and select the `qwq` repository directory you cloned.

扩展现在应该已安装并显示在您的浏览器中

The extension should now be installed and visible in your browser.

## 使用方法 (Usage)

点击浏览器工具栏中的 qwq 图标，将弹出扩展界面，您可以在其中访问所有功能

Click the qwq icon in your browser toolbar to open the extension popup, where you can access all features.

### DeepSeek 对话背景修改 (DeepSeek Chat Background Customization)

1.  点击主界面中的“修改 dps 对话背景”按钮
2.  在弹出的配置界面中，点击“选择文件”上传您喜欢的背景图片（支持 PNG/JPG）
3.  调整透明度、填充方式和位置，以达到最佳视觉效果
4.  选择背景图片下方的底色（黑色或白色），以优化半透明壁纸的显示
5.  点击“应用”按钮保存并应用设置设置将自动保存，并在您下次访问 `chat.deepseek.com` 时生效

1.  Click the "修改 dps 对话背景" (Customize DeepSeek Chat Background) button on the main interface.
2.  In the configuration panel, click "选择文件" (Select File) to upload your preferred background image (PNG/JPG supported).
3.  Adjust the opacity, size, and position for the best visual effect.
4.  Choose a base background color (black or white) to appear beneath your wallpaper, optimizing the look of semi-transparent images.
5.  Click the "应用" (Apply) button to save and apply the settings. Your settings will be automatically saved and take effect the next time you visit `chat.deepseek.com`.

### 图像编辑器 (Image Editor)

1.  将一张图片复制到剪贴板
2.  点击主界面中的“剪贴板图像编辑”按钮
3.  一个新的浏览器标签页将打开图像编辑器
4.  您可以在编辑器中调整亮度、对比度、饱和度、锐化，并进行裁剪
5.  完成编辑后，点击“完成”按钮，编辑后的图像将复制回剪贴板

1.  Copy an image to your clipboard.
2.  Click the "剪贴板图像编辑" (Clipboard Image Editor) button on the main interface.
3.  A new browser tab will open with the image editor.
4.  You can adjust brightness, contrast, saturation, sharpen, and crop the image.
5.  After editing, click the "完成" (Done) button to copy the edited image back to your clipboard.

### 系统通知测试 (System Notification Test)

1.  点击主界面中的“测试发送系统通知”按钮
2.  在配置界面中，您可以输入通知标题、消息，并选择一个 PNG 格式的图标
3.  点击“发送通知”按钮，浏览器将发送一个系统通知

1.  Click the "测试发送系统通知" (Test System Notification) button on the main interface.
2.  In the configuration panel, you can enter a notification title, message, and select a PNG icon.
3.  Click the "发送通知" (Send Notification) button, and the browser will send a system notification.

## 贡献 (Contributing)

欢迎任何形式的贡献！如果您有任何建议、错误报告或功能请求，请随时在 [GitHub 仓库](https://github.com/ra1nyxin/qwq) 中提交 Issue 或 Pull Request

Contributions of any kind are welcome! If you have any suggestions, bug reports, or feature requests, please feel free to submit an Issue or Pull Request on the [GitHub repository](https://github.com/ra1nyxin/qwq).

## 许可证 (License)

本项目采用 MIT 许可证详情请参阅 [LICENSE](LICENSE) 文件

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

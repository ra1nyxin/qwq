// DOM 元素获取
const screenshotButton = document.getElementById('screenshotButton');
const ipButton = document.getElementById('ipButton');
const saveImageButton = document.getElementById('saveImageButton');
const fillGithubButton = document.getElementById('fillGithubButton');
const clearDataButton = document.getElementById('clearDataButton');
const showPasswordsButton = document.getElementById('showPasswordsButton');
const editImageButton = document.getElementById('editImageButton'); // 新增按钮
const autoLikeTwitterButton = document.getElementById('autoLikeTwitterButton'); // 新增自动点赞按钮
const testNotificationButton = document.getElementById('testNotificationButton'); // 新增测试通知按钮
const notificationConfig = document.getElementById('notificationConfig');
const notificationTitleInput = document.getElementById('notificationTitle');
const notificationMessageInput = document.getElementById('notificationMessage');
const notificationIconInput = document.getElementById('notificationIcon');
const notificationIconPreview = document.getElementById('notificationIconPreview');
const sendNotificationButton = document.getElementById('sendNotificationButton');
const cancelNotificationButton = document.getElementById('cancelNotificationButton');
const currentTimeElement = document.getElementById('currentTime');
const browserLanguageElement = document.getElementById('browserLanguage');

// DeepSeek 背景相关 DOM 元素
const changeDeepseekBgButton = document.getElementById('changeDeepseekBgButton');
const deepseekBgConfig = document.getElementById('deepseekBgConfig');
const bgImageUpload = document.getElementById('bgImageUpload');
const bgImagePreview = document.getElementById('bgImagePreview');
const bgOpacity = document.getElementById('bgOpacity');
const bgOpacityValue = document.getElementById('bgOpacityValue');
const bgSize = document.getElementById('bgSize');
const bgPosition = document.getElementById('bgPosition');
const applyDeepseekBgButton = document.getElementById('applyDeepseekBgButton');
const cancelDeepseekBgButton = document.getElementById('cancelDeepseekBgButton');
const baseBgColorBlack = document.getElementById('baseBgColorBlack');
const baseBgColorWhite = document.getElementById('baseBgColorWhite');
const customBgImageUploadButton = document.getElementById('customBgImageUploadButton');
const customNotificationIconUploadButton = document.getElementById('customNotificationIconUploadButton');

// 分组相关 DOM 元素
const clipboardGroupHeader = document.getElementById('clipboardGroupHeader');
const clipboardGroupContent = document.getElementById('clipboardGroupContent');
const utilitiesGroupHeader = document.getElementById('utilitiesGroupHeader');
const utilitiesGroupContent = document.getElementById('utilitiesGroupContent');
const entertainmentGroupHeader = document.getElementById('entertainmentGroupHeader');
const entertainmentGroupContent = document.getElementById('entertainmentGroupContent');
const othersGroupHeader = document.getElementById('othersGroupHeader');
const othersGroupContent = document.getElementById('othersGroupContent');

// IP 按钮原始文本，用于恢复
const originalIpButtonText = ipButton.textContent;

let autoLikeTwitterEnabled = false; // 默认关闭
let currentDeepseekBgImage = null; // 用于存储当前壁纸的 Data URL

// 定义存储配额 (5MB)
const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024; 

// 初始化自动点赞按钮状态
async function initializeAutoLikeButton() {
  const result = await chrome.storage.local.get(['autoLikeTwitterEnabled']);
  autoLikeTwitterEnabled = result.autoLikeTwitterEnabled || false;
  updateAutoLikeButtonText();
}

function updateAutoLikeButtonText() {
  autoLikeTwitterButton.textContent = '推特预览自动点赞';
}

// 辅助函数 - 显示通知 (通过内容脚本注入)
async function showNotification(message, duration = 3000) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    console.error('无法获取当前标签页信息，无法显示通知。');
    return;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: (msg, dur) => {
      const notificationDiv = document.createElement('div');
      notificationDiv.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background-color: #373e47;
        color: #c9d1d9;
        padding: 10px 15px;
        border-radius: 6px;
        border: 1px solid rgba(240, 246, 252, 0.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        min-width: 180px;
        max-width: 250px;
        font-size: 13px;
      `;
      notificationDiv.textContent = msg;
      document.body.appendChild(notificationDiv);

      void notificationDiv.offsetWidth; // 强制重绘

      notificationDiv.style.opacity = '1';
      notificationDiv.style.transform = 'translateX(0)';

      setTimeout(() => {
        notificationDiv.style.opacity = '0';
        notificationDiv.style.transform = 'translateX(100%)';
        setTimeout(() => notificationDiv.remove(), 300);
      }, dur);
    },
    args: [message, duration]
  });
}

// 辅助函数 - 时间显示
function updateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const formattedTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  currentTimeElement.textContent = formattedTime;
}

// 辅助函数 - 浏览器语言显示
function updateLanguage() {
  browserLanguageElement.textContent = `浏览器语言: ${navigator.language}`;
}

// 初始化：立即更新时间、语言并每秒更新时间
updateTime();
setInterval(updateTime, 1000);
updateLanguage();
initializeAutoLikeButton(); // 初始化自动点赞按钮状态

// 分组切换逻辑
function toggleGroup(header, content) {
  const arrow = header.querySelector('.arrow');
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'flex';
    header.classList.add('expanded');
  } else {
    content.style.display = 'none';
    header.classList.remove('expanded');
  }
}

// 为每个分组标题添加事件监听器
clipboardGroupHeader.addEventListener('click', () => toggleGroup(clipboardGroupHeader, clipboardGroupContent));
utilitiesGroupHeader.addEventListener('click', () => toggleGroup(utilitiesGroupHeader, utilitiesGroupContent));
entertainmentGroupHeader.addEventListener('click', () => toggleGroup(entertainmentGroupHeader, entertainmentGroupContent));
othersGroupHeader.addEventListener('click', () => toggleGroup(othersGroupHeader, othersGroupContent));

// 事件监听器 - 页面截图到剪贴板
screenshotButton.addEventListener('click', async () => {
  try {
    const dataUrl = await chrome.tabs.captureVisibleTab(null, { format: 'png' });
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    await showNotification('页面截图已复制到剪贴板');
  } catch (error) {
    console.error('截图或复制到剪贴板失败:', error);
    await showNotification('截图或复制到剪贴板失败: ' + error.message);
  }
});

// 事件监听器 - 查看并复制我的出口IP
ipButton.addEventListener('click', async () => {
  try {
    ipButton.textContent = '获取中...';
    const response = await fetch('https://ifconfig.me/ip');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const ipAddress = await response.text();
    ipButton.textContent = ipAddress.trim();
    await navigator.clipboard.writeText(ipAddress.trim());
    await showNotification('出口IP已复制到剪贴板！');
  } catch (error) {
    console.error('获取或复制IP失败:', error);
    ipButton.textContent = '获取IP失败';
    await showNotification('获取或复制IP失败: ' + error.message);
  }
});

// 当插件菜单关闭时恢复IP按钮文本
window.addEventListener('blur', () => {
  ipButton.textContent = originalIpButtonText;
});

// 事件监听器 - 剪贴板图像另存为
saveImageButton.addEventListener('click', async () => {
  console.log('剪贴板图像另存为按钮被点击。');
  try {
    const clipboardItems = await navigator.clipboard.read();
    console.log('已读取剪贴板内容:', clipboardItems);

    let imageFound = false;
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          imageFound = true;
          console.log('在剪贴板中找到图像类型:', type);
          const blob = await clipboardItem.getType(type);
          const url = URL.createObjectURL(blob);
          const filename = `clipboard_image_${Date.now()}.${type.split('/')[1]}`;

          console.log('开始下载图像:', filename);
          chrome.downloads.download({
            url: url,
            filename: filename,
            saveAs: true
          }, (downloadId) => {
            if (chrome.runtime.lastError) {
              console.error('下载失败:', chrome.runtime.lastError.message, chrome.runtime.lastError);
              showNotification('图像下载失败。请查看控制台获取详情。');
            } else {
              console.log('下载开始, ID:', downloadId);
              showNotification('请选择保存位置以保存图像');
            }
            URL.revokeObjectURL(url);
          });
          return; // 找到第一个图像并处理后即返回
        }
      }
    }

    if (!imageFound) {
      console.log('剪贴板中没有找到图像类型。');
      await showNotification('剪贴板中没有找到图像。请确保您已复制图像。');
    }
  } catch (error) {
    console.error('读取剪贴板图像失败:', error);
    await showNotification('读取剪贴板图像失败。请查看控制台获取详情。');
  }
});

// 事件监听器 - 剪贴板图像编辑
editImageButton.addEventListener('click', async () => {
  console.log('剪贴板图像编辑按钮被点击。');
  try {
    const clipboardItems = await navigator.clipboard.read();
    console.log('已读取剪贴板内容:', clipboardItems);

    let imageFound = false;
    for (const clipboardItem of clipboardItems) {
      for (const type of clipboardItem.types) {
        if (type.startsWith('image/')) {
          imageFound = true;
          console.log('在剪贴板中找到图像类型:', type);
          const blob = await clipboardItem.getType(type);
          const reader = new FileReader();
          reader.onloadend = async (event) => {
            const imageDataUrl = event.target.result;
            try {
              await chrome.storage.local.set({ 'imageDataForEditor': imageDataUrl });
              console.log('图像数据已存储到 chrome.storage.local。');
              chrome.tabs.create({ url: chrome.runtime.getURL('image_editor.html') });
              await showNotification('正在打开图像编辑页面...');
            } catch (storageError) {
              console.error('存储图像数据到 chrome.storage.local 失败:', storageError);
              showNotification('存储图像数据失败。请查看控制台获取详情。');
            }
          };
          reader.onerror = (error) => {
            console.error('读取 Blob 失败:', error);
            showNotification('读取图像数据失败。请查看控制台获取详情。');
          };
          reader.readAsDataURL(blob);
          return; // 找到第一个图像并处理后即返回
        }
      }
    }

    if (!imageFound) {
      console.log('剪贴板中没有找到图像类型。');
      await showNotification('剪贴板中没有找到图像。请确保您已复制图像。');
    }
  } catch (error) {
    console.error('读取剪贴板图像失败:', error);
    await showNotification('读取剪贴板图像失败。请查看控制台获取详情。');
  }
});

// 事件监听器 - 推特预览自动点赞
autoLikeTwitterButton.addEventListener('click', async () => {
  autoLikeTwitterEnabled = !autoLikeTwitterEnabled;
  await chrome.storage.local.set({ autoLikeTwitterEnabled: autoLikeTwitterEnabled });
  updateAutoLikeButtonText();

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id) {
    try {
      // 确保内容脚本已注入
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content_script.js']
      });

      // 发送一个消息给内容脚本，请求它发送 ready 信号
      const response = await chrome.tabs.sendMessage(tab.id, { action: 'popupReadyCheck' });
      if (response && response.action === 'contentScriptReady') {
        // 收到 ready 响应后，发送 toggleAutoLikeTwitter 消息
        chrome.tabs.sendMessage(tab.id, { action: 'toggleAutoLikeTwitter', enabled: autoLikeTwitterEnabled }).catch(error => {
          console.error('popup.js: 发送 toggleAutoLikeTwitter 消息失败:', error);
          showNotification('自动点赞功能操作失败: ' + error.message);
        });
        showNotification(`推特预览自动点赞已${autoLikeTwitterEnabled ? '开启' : '关闭'}`);
      } else {
        console.error('popup.js: 未收到内容脚本 ready 响应或响应不正确。', response);
        showNotification('自动点赞功能操作失败: 内容脚本未准备好。');
      }

    } catch (scriptingError) {
      console.error('popup.js: 注入或发送消息到内容脚本失败:', scriptingError);
      await showNotification('自动点赞功能操作失败: ' + scriptingError.message);
    }
  } else {
    await showNotification('无法获取当前标签页信息，无法切换自动点赞功能。');
  }
});

// 事件监听器 - 测试发送系统通知
testNotificationButton.addEventListener('click', () => {
  // 切换通知配置界面的可见性
  if (notificationConfig.style.display === 'none') {
    notificationConfig.style.display = 'flex';
    // 默认使用扩展图标
    notificationIconPreview.src = chrome.runtime.getURL('icon.png');
    notificationIconPreview.style.display = 'block';
  } else {
    notificationConfig.style.display = 'none';
    // 清空输入框和预览
    notificationTitleInput.value = '';
    notificationMessageInput.value = '';
    notificationIconInput.value = '';
    notificationIconPreview.src = '';
    notificationIconPreview.style.display = 'none';
  }
});

notificationIconInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file && file.type === 'image/png') {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const targetSize = 48; // 通知图标的推荐尺寸，例如 48x48 或 64x64

        let width = img.width;
        let height = img.height;

        // 计算缩放比例，保持宽高比
        if (width > height) {
          if (width > targetSize) {
            height *= targetSize / width;
            width = targetSize;
          }
        } else {
          if (height > targetSize) {
            width *= targetSize / height;
            height = targetSize;
          }
        }

        canvas.width = targetSize;
        canvas.height = targetSize;

        // 清空 canvas 并绘制缩放后的图像，居中显示
        ctx.clearRect(0, 0, targetSize, targetSize);
        ctx.drawImage(img, (targetSize - width) / 2, (targetSize - height) / 2, width, height);

        notificationIconPreview.src = canvas.toDataURL('image/png');
        notificationIconPreview.style.display = 'block';
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    notificationIconPreview.src = '';
    notificationIconPreview.style.display = 'none';
    showNotification('请上传 PNG 格式的图片作为图标。');
  }
});

// 事件监听器 - 发送通知
sendNotificationButton.addEventListener('click', async () => {
  const title = notificationTitleInput.value || '默认标题';
  const message = notificationMessageInput.value || '这是一条测试通知。';
  const iconUrl = notificationIconPreview.src || chrome.runtime.getURL('icon.png');

  try {
    await chrome.notifications.create(
      {
        type: 'basic',
        iconUrl: iconUrl,
        title: title,
        message: message,
        priority: 2
      }
    );
    showNotification('系统通知已发送！');
    notificationConfig.style.display = 'none'; // 发送后关闭配置界面
    // 清空输入框和预览
    notificationTitleInput.value = '';
    notificationMessageInput.value = '';
    notificationIconInput.value = '';
    notificationIconPreview.src = '';
    notificationIconPreview.style.display = 'none';
  } catch (error) {
    console.error('发送系统通知失败:', error);
    showNotification('发送系统通知失败: ' + error.message);
  }
});

// 事件监听器 - 取消通知配置
cancelNotificationButton.addEventListener('click', () => {
  notificationConfig.style.display = 'none';
  // 清空输入框和预览
  notificationTitleInput.value = '';
  notificationMessageInput.value = '';
  notificationIconInput.value = '';
  notificationIconPreview.src = '';
  notificationIconPreview.style.display = 'none';
});

// 事件监听器 - 一键填满GitHub贡献表绿格子
fillGithubButton.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      await showNotification('无法获取当前标签页信息');
      return;
    }
    if (!tab.url || !tab.url.includes('github.com')) {
      await showNotification('此功能仅适用于 GitHub 页面');
      return;
    }

    // 确保内容脚本已注入
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_script.js']
    });

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'fillGithub' });
    if (response && response.success) {
      await showNotification(response.message);
    } else {
      await showNotification(response.message || '填满GitHub贡献表失败。');
    }
  } catch (error) {
    console.error('填满GitHub贡献表失败:', error);
    await showNotification('填满GitHub贡献表失败: ' + error.message);
  }
});

// 事件监听器 - 抹除当前页面数据和缓存
clearDataButton.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.url) {
      await showNotification('无法获取当前标签页信息或URL');
      return;
    }
    const origin = new URL(tab.url).origin;
    await chrome.browsingData.remove({ origins: [origin] }, {
          cache: true, cookies: true, fileSystems: true,
      indexedDB: true, localStorage: true, serviceWorkers: true, webSQL: true
    });
    await showNotification(`已抹除 ${origin} 的所有数据和缓存`);
    chrome.tabs.reload(tab.id);
  } catch (error) {
    console.error('抹除数据和缓存失败:', error);
    await showNotification('抹除数据和缓存失败: ' + error.message);
  }
}
);

// 事件监听器 - 页面所有密码明文显示
showPasswordsButton.addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      await showNotification('无法获取当前标签页信息');
      return;
    }

    // 确保内容脚本已注入
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_script.js']
    });

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'showPasswords' });
    if (response && response.success) {
      await showNotification(response.message);
    } else {
      await showNotification(response.message || '显示密码失败。');
    }
  } catch (error) {
    console.error('显示密码失败:', error);
    await showNotification('显示密码失败: ' + error.message);
  }
});

// DeepSeek 背景功能相关事件监听器
changeDeepseekBgButton.addEventListener('click', () => {
  if (deepseekBgConfig.style.display === 'none') {
    deepseekBgConfig.style.display = 'flex';
    // 加载已保存的设置到界面
    loadDeepseekBgSettings();
  } else {
    deepseekBgConfig.style.display = 'none';
    resetDeepseekBgConfig();
  }
});

// 代理自定义按钮的点击事件到实际的文件输入框
customBgImageUploadButton.addEventListener('click', () => {
  bgImageUpload.click();
});

// 代理自定义通知图标选择按钮的点击事件到实际的文件输入框
customNotificationIconUploadButton.addEventListener('click', () => {
  notificationIconInput.click();
});

bgImageUpload.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (file && (file.type === 'image/png' || file.type === 'image/jpeg')) {
    // 估算 Data URL 的大小 (Data URL 大约是原始文件大小的 4/3)
    const estimatedSize = file.size * 4 / 3;

    const bytesInUse = await chrome.storage.local.getBytesInUse();
    if (bytesInUse + estimatedSize > STORAGE_QUOTA_BYTES) {
      showNotification(`壁纸文件过大！当前已用 ${Math.round(bytesInUse / 1024)}KB，剩余 ${Math.round((STORAGE_QUOTA_BYTES - bytesInUse) / 1024)}KB。请选择更小的图片。`);
      bgImageUpload.value = ''; // 清空文件输入
      currentDeepseekBgImage = null;
      bgImagePreview.src = '';
      bgImagePreview.style.display = 'none';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      currentDeepseekBgImage = e.target.result;
      bgImagePreview.src = currentDeepseekBgImage;
      bgImagePreview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    currentDeepseekBgImage = null;
    bgImagePreview.src = '';
    bgImagePreview.style.display = 'none';
    showNotification('请上传 PNG 或 JPG 格式的图片作为壁纸。');
  }
});

bgOpacity.addEventListener('input', () => {
  bgOpacityValue.textContent = `${Math.round(bgOpacity.value * 100)}%`;
});

applyDeepseekBgButton.addEventListener('click', async () => {
  const selectedBaseBgColor = document.querySelector('input[name="baseBgColor"]:checked').value;
  const settings = {
    imageUrl: currentDeepseekBgImage, // 确保将 currentDeepseekBgImage 传递给内容脚本
    opacity: parseFloat(bgOpacity.value),
    size: bgSize.value,
    position: bgPosition.value,
    baseBackgroundColor: selectedBaseBgColor // 新增：底色选择
  };

  // 存储所有设置，包括图片数据。如果 currentDeepseekBgImage 为 null，则存储 null。
  await chrome.storage.local.set({ deepseekBgSettings: settings });

  await applyDeepseekBg(settings);
  showNotification('DeepSeek 背景设置已应用并保存！');
  deepseekBgConfig.style.display = 'none';
});

cancelDeepseekBgButton.addEventListener('click', () => {
  deepseekBgConfig.style.display = 'none';
  resetDeepseekBgConfig();
});

// 辅助函数：重置 DeepSeek 背景配置界面
function resetDeepseekBgConfig() {
  bgImageUpload.value = '';
  bgImagePreview.src = '';
  bgImagePreview.style.display = 'none';
  bgOpacity.value = '1';
  bgOpacityValue.textContent = '100%';
  bgSize.value = 'cover';
  bgPosition.value = 'center';
  currentDeepseekBgImage = null;
  baseBgColorBlack.checked = true; // 默认选中黑色
}

// 辅助函数：加载 DeepSeek 背景设置到界面
async function loadDeepseekBgSettings() {
  const result = await chrome.storage.local.get(['deepseekBgSettings']);
  const settings = result.deepseekBgSettings;

  if (settings) {
    currentDeepseekBgImage = settings.imageUrl;
    if (settings.imageUrl) {
      bgImagePreview.src = settings.imageUrl;
      bgImagePreview.style.display = 'block';
    } else {
      bgImagePreview.src = '';
      bgImagePreview.style.display = 'none';
    }
    bgOpacity.value = settings.opacity !== undefined ? settings.opacity : 1;
    bgOpacityValue.textContent = `${Math.round(bgOpacity.value * 100)}%`;
    bgSize.value = settings.size || 'cover';
    bgPosition.value = settings.position || 'center';
    // 加载底色设置
    if (settings.baseBackgroundColor === 'white') {
      baseBgColorWhite.checked = true;
    } else {
      baseBgColorBlack.checked = true;
    }
  } else {
    resetDeepseekBgConfig();
  }
}

// 辅助函数：应用 DeepSeek 背景到当前活动标签页
async function applyDeepseekBg(settings) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id || !tab.url || !tab.url.includes('chat.deepseek.com')) {
    // 如果不是 DeepSeek 页面，则不应用背景，但仍然保存设置
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content_script.js'] // 确保内容脚本已注入
    });

    chrome.tabs.sendMessage(tab.id, { action: 'applyDeepseekBg', settings: settings }).catch(error => {
      console.error('popup.js: 发送 applyDeepseekBg 消息失败:', error);
      showNotification('应用 DeepSeek 背景失败: ' + error.message);
    });
  } catch (scriptingError) {
    console.error('popup.js: 注入或发送消息到内容脚本失败:', scriptingError);
    showNotification('应用 DeepSeek 背景失败: ' + scriptingError.message);
  }
}

// 初始化时加载并应用 DeepSeek 背景设置
async function initializeDeepseekBg() {
  const result = await chrome.storage.local.get(['deepseekBgSettings']);
  const settings = result.deepseekBgSettings;
  // 始终应用设置，即使没有图片，以便内容脚本可以清除现有背景
  if (settings) {
    await applyDeepseekBg(settings);
  } else {
    // 如果没有保存的设置，也发送一个空设置，确保背景被清除
    await applyDeepseekBg({ imageUrl: null, opacity: 1, size: 'cover', position: 'center', baseBackgroundColor: 'black' }); // 默认黑色底色
  }
}

// 在所有初始化之后调用 DeepSeek 背景初始化
initializeDeepseekBg();

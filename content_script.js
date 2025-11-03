(async () => {
  // 状态变量
  let isAutoLikingEnabled = false;
  let autoLikeNotificationDiv = null;
  let autoLikeTimeout = null;
  let isProcessingLikes = false;

  // 辅助函数：在页面右上角显示/隐藏自动点赞状态通知
  function showAutoLikeNotification(show) {
    try {
      if (show) {
        if (!autoLikeNotificationDiv) {
          autoLikeNotificationDiv = document.createElement('div');
          autoLikeNotificationDiv.id = 'auto-like-twitter-notification';
          autoLikeNotificationDiv.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background-color: #2d333b;
            color: #28a745; /* 绿色字体 */
            padding: 5px 8px;
            border-radius: 4px;
            border: 1px solid rgba(40, 167, 69, 0.3);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            z-index: 99999;
            font-size: 10px; /* 非常小的字体 */
            font-weight: bold;
          `;
          autoLikeNotificationDiv.textContent = '推特预览自动点赞已开启';
          document.body.appendChild(autoLikeNotificationDiv);
        }
        autoLikeNotificationDiv.style.display = 'block';
      } else {
        if (autoLikeNotificationDiv) {
          autoLikeNotificationDiv.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('显示/隐藏自动点赞通知失败:', error);
    }
  }

  // 辅助函数：在页面上显示临时通知
  function showContentNotification(message, duration = 3000) {
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
    notificationDiv.textContent = message;
    document.body.appendChild(notificationDiv);

    void notificationDiv.offsetWidth; // 强制重绘

    notificationDiv.style.opacity = '1';
    notificationDiv.style.transform = 'translateX(0)';

    setTimeout(() => {
      notificationDiv.style.opacity = '0';
      notificationDiv.style.transform = 'translateX(100%)';
      setTimeout(() => notificationDiv.remove(), 300);
    }, duration);
  }

  // 核心点赞逻辑
  async function processLikes() {
    if (!isAutoLikingEnabled || isProcessingLikes) {
      return;
    }

    isProcessingLikes = true;
    try {
      const likeButtons = document.querySelectorAll('button[data-testid="like"]');
      const unlikedButtons = Array.from(likeButtons).filter(button => {
        const ariaLabel = button.getAttribute('aria-label');
        // 检查 aria-label 是否包含 "Like" 且不包含 "Liked"，表示未点赞
        return ariaLabel && ariaLabel.includes('Like') && !ariaLabel.includes('Liked');
      });

      for (const button of unlikedButtons) {
        if (!isAutoLikingEnabled) {
          break; // 如果功能被关闭，则停止点赞
        }
        // 确保按钮仍然可见且可点击
        if (button.offsetParent !== null) {
          button.click();
          const delay = Math.random() * 1000 + 1000; // 1到2秒随机延迟
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    } catch (error) {
      console.error('处理点赞时发生错误:', error);
    } finally {
      isProcessingLikes = false;
    }
  }

  // MutationObserver 监听 DOM 变化
  const observer = new MutationObserver((mutations) => {
    if (isAutoLikingEnabled) {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // 延迟执行，避免在 DOM 还在构建时操作
          clearTimeout(autoLikeTimeout);
          autoLikeTimeout = setTimeout(processLikes, 500); // 稍作延迟处理新节点
        }
      });
    }
  });

// 辅助函数：应用 DeepSeek 背景样式通过注入 <style> 标签
function applyDeepseekBgStyles(settings) {
  let styleElement = document.getElementById('deepseek-bg-style');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'deepseek-bg-style';
    document.head.appendChild(styleElement);
  }

  const baseBgColor = settings.baseBackgroundColor === 'white' ? '#ffffff' : '#000000'; // 默认黑色

  let cssRules = '';
  if (settings && settings.imageUrl) {
    cssRules = `
      /* 设置 html/body 的底色 */
      html, body {
        background-color: ${baseBgColor} !important;
        background-image: none !important; /* 清除任何直接的 body 背景 */
      }
      body[data-ds-dark-theme] {
        --dsw-alias-bg-base: transparent !important; /* 保持 DeepSeek 的基础背景透明 */
      }

      /* 为背景图片注入一个全屏伪元素 */
      body::before {
        content: '';
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-image: url('${settings.imageUrl}') !important;
        background-repeat: no-repeat !important;
        background-size: ${settings.size} !important;
        background-position: ${settings.position} !important;
        opacity: ${settings.opacity} !important; /* 在这里应用透明度 */
        z-index: -1 !important; /* 确保它在内容后面 */
      }

      /* 使可能覆盖的元素透明，如果它们有实体背景 */
      #root,
      #root > div[class*="main-content"],
      #root > div > main,
      #root > div > div[class*="layout"] {
        background-color: rgba(0, 0, 0, 0) !important;
      }
    `;
  } else {
    // 移除所有自定义背景样式并恢复到底色
    cssRules = `
      html, body {
        background-color: ${baseBgColor} !important; /* 应用选定的底色 */
        background-image: initial !important;
      }
      body[data-ds-dark-theme] {
        --dsw-alias-bg-base: initial !important; /* 恢复 */
      }
      body::before {
        content: none !important; /* 移除伪元素 */
      }
      #root,
      #root > div[class*="main-content"],
      #root > div > main,
      #root > div > div[class*="layout"] {
        background-color: initial !important;
      }
    `;
  }
  styleElement.textContent = cssRules;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleAutoLikeTwitter') {
    if (window.location.hostname === 'twitter.com' || window.location.hostname === 'x.com') {
      if (request.enabled) {
        startAutoLike();
        sendResponse({ success: true, message: 'Twitter 自动点赞已开启。' });
      } else {
        stopAutoLike();
        sendResponse({ success: true, message: 'Twitter 自动点赞已关闭。' });
      }
    } else {
      sendResponse({ success: false, message: '当前页面不是 Twitter 或 X，无法操作自动点赞。' });
    }
  } else if (request.action === 'popupReadyCheck') {
    sendResponse({ action: 'contentScriptReady' });
  } else if (request.action === 'fillGithub') {
    if (window.location.hostname.includes('github.com')) {
      fillGithubContributions();
      sendResponse({ success: true, message: 'GitHub 贡献表已尝试填满。' });
    } else {
      sendResponse({ success: false, message: '此功能仅适用于 GitHub 页面。' });
    }
  } else if (request.action === 'showPasswords') {
    showPasswords();
    sendResponse({ success: true, message: '页面密码已尝试明文显示。' });
  } else if (request.action === 'applyDeepseekBg') {
    if (window.location.hostname === 'chat.deepseek.com') {
      applyDeepseekBgStyles(request.settings); // 使用新的函数
      sendResponse({ success: true, message: 'DeepSeek 背景已应用。' });
    } else {
      console.log('content_script.js: 当前页面不是 chat.deepseek.com，不应用背景。');
      sendResponse({ success: false, message: '当前页面不是 chat.deepseek.com，无法应用背景。' });
    }
  }
});

// 初始加载：尝试应用已保存的 DeepSeek 背景设置
(async () => {
  if (window.location.hostname === 'chat.deepseek.com') {
    const storedSettings = await chrome.storage.local.get(['deepseekBgSettings']);
    if (storedSettings.deepseekBgSettings) {
      applyDeepseekBgStyles(storedSettings.deepseekBgSettings);
    } else {
      // 如果没有保存的设置，确保背景被清除
      applyDeepseekBgStyles({ imageUrl: null, opacity: 1, size: 'cover', position: 'center', baseBackgroundColor: 'black' }); // 默认黑色底色
    }
  }
})();

// 以下是原有的辅助函数和逻辑，保持不变

// Twitter 自动点赞功能
let autoLikeInterval = null;

function startAutoLike() {
  if (autoLikeInterval) return;
  console.log('Twitter 自动点赞功能已开启。');
  autoLikeInterval = setInterval(() => {
    document.querySelectorAll('article').forEach(article => {
      const likeButton = article.querySelector('[data-testid="like"]');
      if (likeButton && likeButton.getAttribute('aria-label') === 'Like') {
        likeButton.click();
        console.log('已点赞一条推文。');
      }
    });
  }, 3000);
}

function stopAutoLike() {
  if (autoLikeInterval) {
    clearInterval(autoLikeInterval);
    autoLikeInterval = null;
    console.log('Twitter 自动点赞功能已关闭。');
  }
}

// GitHub 贡献表填满功能
function fillGithubContributions() {
  const cells = document.querySelectorAll('.ContributionCalendar-day[data-level="0"]');
  cells.forEach(cell => {
    cell.setAttribute('data-level', '4');
    cell.style.backgroundColor = '#216e39'; // 最深绿色
  });
  console.log(`已将 ${cells.length} 个 GitHub 贡献格子填满。`);
}

// 密码明文显示功能
function showPasswords() {
  document.querySelectorAll('input[type="password"]').forEach(input => {
    input.setAttribute('type', 'text');
  });
  console.log('所有密码输入框已尝试明文显示。');
}


  // 初始加载时检查状态
  const result = await chrome.storage.local.get(['autoLikeTwitterEnabled']);
  isAutoLikingEnabled = result.autoLikeTwitterEnabled || false;
  showAutoLikeNotification(isAutoLikingEnabled);
  if (isAutoLikingEnabled) {
    observer.observe(document.body, { childList: true, subtree: true });
    processLikes();
  }
})();

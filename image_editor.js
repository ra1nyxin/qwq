document.addEventListener('DOMContentLoaded', async () => {
  const imageCanvas = document.getElementById('imageCanvas');
  const ctx = imageCanvas.getContext('2d');
  const brightnessControl = document.getElementById('brightness');
  const contrastControl = document.getElementById('contrast');
  const saturationControl = document.getElementById('saturation'); // 新增饱和度滑条
  const sharpenControl = document.getElementById('sharpen');     // 新增锐化滑条
  const cropButton = document.getElementById('cropButton');
  const resetButton = document.getElementById('resetButton');
  const doneButton = document.getElementById('doneButton');
  const cancelButton = document.getElementById('cancelButton');

  let originalImage = new Image();
  let currentImage = new Image();
  let initialImage = new Image(); // 新增：用于存储最初加载的图像
  let imageDataUrl = null;
  let isCropping = false;
  let cropStartX, cropStartY, cropWidth, cropHeight;
  let startMouseX, startMouseY;

  // 新增变量用于存储图像在 canvas 上实际绘制的位置和尺寸
  let renderedImageX = 0;
  let renderedImageY = 0;
  let renderedImageWidth = 0;
  let renderedImageHeight = 0;

  // 辅助函数：将鼠标事件的客户端坐标转换为 canvas 内部的坐标
  function getCanvasCoordinates(event) {
    const rect = imageCanvas.getBoundingClientRect();
    const scaleX = imageCanvas.width / rect.width; // 计算 canvas 实际像素与显示像素的比例
    const scaleY = imageCanvas.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    return { x, y };
  }

  // 从 chrome.storage.local 获取图像数据
  const data = await chrome.storage.local.get('imageDataForEditor');
  if (data.imageDataForEditor) {
    imageDataUrl = data.imageDataForEditor;
    initialImage.onload = () => {
      originalImage.src = initialImage.src; // originalImage 初始时与 initialImage 相同
      currentImage.src = initialImage.src; // currentImage 初始时与 initialImage 相同
      drawImage();
    };
    initialImage.src = imageDataUrl;
  } else {
    console.error('未找到剪贴板图像数据。');
    alert('未找到剪贴板图像数据。请从插件菜单重新打开图像编辑。');
    window.close();
    return;
  }

  function drawImage(brightness = 100, contrast = 100, saturation = 100, sharpen = 0) {
    if (!currentImage.complete) {
      currentImage.onload = () => drawImage(brightness, contrast, saturation, sharpen);
      return;
    }

    // 获取 canvas 容器的尺寸
    const canvasContainer = imageCanvas.parentElement;
    const containerWidth = canvasContainer.clientWidth;
    const containerHeight = canvasContainer.clientHeight;

    // 计算缩放比例以适应容器，同时保持宽高比
    const imageAspectRatio = currentImage.width / currentImage.height;
    const containerAspectRatio = containerWidth / containerHeight;

    if (imageAspectRatio > containerAspectRatio) {
      // 图像更宽，按宽度适应
      renderedImageWidth = containerWidth;
      renderedImageHeight = containerWidth / imageAspectRatio;
    } else {
      // 图像更高，按高度适应
      renderedImageHeight = containerHeight;
      renderedImageWidth = containerHeight * imageAspectRatio;
    }

    // 更新 canvas 元素的实际尺寸，使其与渲染图像的尺寸匹配
    imageCanvas.width = renderedImageWidth;
    imageCanvas.height = renderedImageHeight;

    // 计算图像在 canvas 中的居中位置
    renderedImageX = (containerWidth - renderedImageWidth) / 2;
    renderedImageY = (containerHeight - renderedImageHeight) / 2;

    // 清空 canvas
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

    // 构建滤镜字符串
    let filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
    if (sharpen > 0) {
      filterString += ` url(#sharpenFilter)`;
    }
    ctx.filter = filterString;

    ctx.drawImage(currentImage, 0, 0, renderedImageWidth, renderedImageHeight);
    ctx.filter = 'none'; // 重置滤镜，避免影响后续绘制

    // 通过 CSS 调整 canvas 的显示尺寸，使其适应容器
    imageCanvas.style.maxWidth = '100%';
    imageCanvas.style.maxHeight = '100%';
    imageCanvas.style.width = `${renderedImageWidth}px`;
    imageCanvas.style.height = `${renderedImageHeight}px`;
    imageCanvas.style.left = `${renderedImageX}px`;
    imageCanvas.style.top = `${renderedImageY}px`;
    imageCanvas.style.position = 'absolute'; // 允许通过 left/top 定位
  }

  // 亮度/对比度调整
  brightnessControl.addEventListener('input', () => {
    drawImage(brightnessControl.value, contrastControl.value);
  });

  contrastControl.addEventListener('input', () => {
    drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value);
  });

  saturationControl.addEventListener('input', () => {
    drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value);
  });

  sharpenControl.addEventListener('input', () => {
    drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value);
  });

  // 重置按钮
  resetButton.addEventListener('click', () => {
    brightnessControl.value = 100;
    contrastControl.value = 100;
    saturationControl.value = 100; // 重置饱和度
    sharpenControl.value = 0;    // 重置锐化
    originalImage.src = initialImage.src; // 恢复 originalImage 到最初加载的图像
    currentImage.src = initialImage.src; // 恢复 currentImage 到最初加载的图像
    isCropping = false; // 停止裁剪模式
    drawImage();
  });

  // 裁剪功能
  cropButton.addEventListener('click', () => {
    isCropping = !isCropping;
    cropButton.textContent = isCropping ? '完成裁剪' : '裁剪';
    if (!isCropping) {
      applyCrop();
    } else {
      // 进入裁剪模式时，重新绘制图像以清除之前的裁剪框
      drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value);
    }
  });

  imageCanvas.addEventListener('mousedown', (e) => {
    if (isCropping) {
      const { x, y } = getCanvasCoordinates(e);
      cropStartX = x;
      cropStartY = y;
      cropWidth = 0;
      cropHeight = 0;
    }
  });

  imageCanvas.addEventListener('mousemove', (e) => {
    if (isCropping && e.buttons === 1) { // 鼠标左键按下并移动
      const { x, y } = getCanvasCoordinates(e);
      cropWidth = x - cropStartX;
      cropHeight = y - cropStartY;
      drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value); // 重新绘制图像
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropStartX, cropStartY, cropWidth, cropHeight);
    }
  });

  imageCanvas.addEventListener('mouseup', () => {
    if (isCropping) {
      // 鼠标抬起时，如果裁剪模式仍然激活，则绘制最终裁剪框
      drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropStartX, cropStartY, cropWidth, cropHeight);
    }
  });

  function applyCrop() {
    if (cropWidth === 0 || cropHeight === 0) {
      console.log('裁剪区域无效。');
      return;
    }

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // 计算裁剪区域在原始图像上的实际像素
    const scaleX = originalImage.width / renderedImageWidth;
    const scaleY = originalImage.height / renderedImageHeight;

    const actualCropX = cropStartX * scaleX;
    const actualCropY = cropStartY * scaleY;
    const actualCropWidth = cropWidth * scaleX;
    const actualCropHeight = cropHeight * scaleY;

    tempCanvas.width = Math.abs(actualCropWidth);
    tempCanvas.height = Math.abs(actualCropHeight);

    tempCtx.drawImage(
      originalImage,
      actualCropX,
      actualCropY,
      actualCropWidth,
      actualCropHeight,
      0,
      0,
      tempCanvas.width,
      tempCanvas.height
    );

    currentImage.src = tempCanvas.toDataURL();
    currentImage.onload = () => {
      // 裁剪完成后，将 currentImage 的内容更新为裁剪后的图像
      // 并且将 originalImage 也更新为裁剪后的图像，这样下次裁剪就是基于当前图像
      originalImage.src = currentImage.src;
      drawImage(brightnessControl.value, contrastControl.value, saturationControl.value, sharpenControl.value);
    };
    isCropping = false;
    cropButton.textContent = '裁剪';
  }


  // 完成按钮
  doneButton.addEventListener('click', async () => {
    console.log('完成按钮被点击。');
    try {
      // 创建一个临时的 canvas，用于应用滤镜并获取最终图像数据
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');

      // 设置临时 canvas 的尺寸为原始图像的尺寸，以保持画质
      finalCanvas.width = currentImage.width;
      finalCanvas.height = currentImage.height;

      // 应用滤镜到临时 canvas
      finalCtx.filter = `brightness(${brightnessControl.value}%) contrast(${contrastControl.value}%) saturate(${saturationControl.value}%)`;
      if (sharpenControl.value > 0) {
        finalCtx.filter += ` url(#sharpenFilter)`;
      }
      finalCtx.drawImage(currentImage, 0, 0, finalCanvas.width, finalCanvas.height);
      finalCtx.filter = 'none'; // 重置滤镜

      const finalDataUrl = finalCanvas.toDataURL('image/png');
      const response = await fetch(finalDataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob })
      ]);
      console.log('编辑后的图像已写入剪贴板。');
      alert('编辑后的图像已写入剪贴板！'); // 使用 alert 临时通知用户
      window.close();
    } catch (error) {
      console.error('写入剪贴板失败:', error);
      alert('写入剪贴板失败: ' + error.message); // 使用 alert 临时通知用户
    }
  });

  // 取消按钮
  cancelButton.addEventListener('click', () => {
    console.log('取消按钮被点击。');
    window.close();
  });
});

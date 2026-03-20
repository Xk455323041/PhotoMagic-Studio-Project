// PhotoMagic Studio - 背景移除页面交互脚本
// 版本: 1.0
// 最后更新: 2026-03-20

// DOM元素引用
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const previewThumbnail = document.getElementById('previewThumbnail');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const fileDimensions = document.getElementById('fileDimensions');
const removeFileButton = document.getElementById('removeFile');
const processButton = document.getElementById('processButton');
const processText = document.getElementById('processText');
const processLoading = document.getElementById('processLoading');
const downloadButton = document.getElementById('downloadButton');
const resetButton = document.getElementById('resetButton');
const toggleAdvancedButton = document.getElementById('toggleAdvanced');
const advancedOptions = document.getElementById('advancedOptions');
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
const originalPreview = document.getElementById('originalPreview');
const resultPreview = document.getElementById('resultPreview');
const syncZoomCheckbox = document.getElementById('syncZoom');
const resetZoomButton = document.getElementById('resetZoom');
const zoomInOriginalButton = document.getElementById('zoomInOriginal');
const zoomOutOriginalButton = document.getElementById('zoomOutOriginal');
const zoomInResultButton = document.getElementById('zoomInResult');
const zoomOutResultButton = document.getElementById('zoomOutResult');
const addBatchItemButton = document.getElementById('addBatchItem');
const batchGrid = document.getElementById('batchGrid');
const batchProcessButton = document.getElementById('batchProcessButton');
const clearBatchButton = document.getElementById('clearBatchButton');
const loadingOverlay = document.getElementById('loadingOverlay');

// 状态变量
let currentFile = null;
let processing = false;
let batchFiles = [];
let zoomLevels = {
    original: 1.0,
    result: 1.0
};
let currentResult = null;
let isAdvancedOptionsVisible = false;

// 初始化函数
function init() {
    console.log('PhotoMagic Studio - 背景移除页面初始化');
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始化UI状态
    updateUIState();
    
    // 显示版本信息
    showToast('页面已加载完成', 'success');
}

// 初始化事件监听器
function initEventListeners() {
    // 上传区域点击事件
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });
    
    // 文件选择事件
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽事件
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileSelect();
        }
    });
    
    // 移除文件按钮
    removeFileButton.addEventListener('click', resetFile);
    
    // 处理按钮
    processButton.addEventListener('click', processImage);
    
    // 下载按钮
    downloadButton.addEventListener('click', downloadResult);
    
    // 重置按钮
    resetButton.addEventListener('click', resetAll);
    
    // 高级选项切换
    toggleAdvancedButton.addEventListener('click', toggleAdvancedOptions);
    
    // 质量滑块
    qualitySlider.addEventListener('input', updateQualityValue);
    
    // 缩放控制
    zoomInOriginalButton.addEventListener('click', () => adjustZoom('original', 'in'));
    zoomOutOriginalButton.addEventListener('click', () => adjustZoom('original', 'out'));
    zoomInResultButton.addEventListener('click', () => adjustZoom('result', 'in'));
    zoomOutResultButton.addEventListener('click', () => adjustZoom('result', 'out'));
    resetZoomButton.addEventListener('click', resetZoom);
    
    // 批量处理
    addBatchItemButton.addEventListener('click', addBatchItem);
    batchProcessButton.addEventListener('click', processBatch);
    clearBatchButton.addEventListener('click', clearBatch);
    
    // 背景切换
    document.querySelectorAll('input[name="previewBackground"]').forEach(radio => {
        radio.addEventListener('change', updatePreviewBackground);
    });
    
    // 参数变化监听
    document.querySelectorAll('input[name="format"], input[name="background"], input[name="edge"]').forEach(input => {
        input.addEventListener('change', updateParameters);
    });
}

// 处理文件选择
function handleFileSelect() {
    if (fileInput.files.length === 0) return;
    
    const file = fileInput.files[0];
    
    // 验证文件类型
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        showToast('不支持的文件格式。请选择 JPG、PNG 或 WebP 格式的图片。', 'error');
        return;
    }
    
    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showToast('文件大小超过 10MB 限制。请选择较小的图片。', 'error');
        return;
    }
    
    currentFile = file;
    
    // 显示文件信息
    const fileURL = URL.createObjectURL(file);
    
    // 更新预览缩略图
    previewThumbnail.src = fileURL;
    previewThumbnail.onload = () => {
        URL.revokeObjectURL(fileURL);
    };
    
    // 更新文件信息
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    
    // 获取图片尺寸
    const img = new Image();
    img.onload = () => {
        fileDimensions.textContent = `${img.width} × ${img.height} 像素`;
        
        // 显示原图预览
        showOriginalPreview(fileURL, img.width, img.height);
    };
    img.src = fileURL;
    
    // 显示文件信息区域
    fileInfo.style.display = 'block';
    
    // 启用处理按钮
    processButton.disabled = false;
    
    // 禁用下载按钮 (等待处理完成)
    downloadButton.disabled = true;
    
    // 更新批量处理按钮
    updateBatchProcessButton();
    
    showToast('图片上传成功', 'success');
}

// 显示原图预览
function showOriginalPreview(url, width, height) {
    originalPreview.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = url;
    img.alt = '原图预览';
    img.id = 'originalImage';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.transform = `scale(${zoomLevels.original})`;
    img.style.transition = 'transform 0.3s ease';
    
    originalPreview.appendChild(img);
    
    // 重置缩放级别
    zoomLevels.original = 1.0;
    updateImageZoom('original', zoomLevels.original);
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 重置文件
function resetFile() {
    currentFile = null;
    currentResult = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    originalPreview.innerHTML = `
        <div class="preview-placeholder">
            <div class="preview-placeholder-icon">🖼️</div>
            <div>请先上传图片</div>
        </div>
    `;
    resultPreview.innerHTML = `
        <div class="preview-placeholder">
            <div class="preview-placeholder-icon">✨</div>
            <div>处理后将显示结果</div>
        </div>
    `;
    processButton.disabled = true;
    downloadButton.disabled = true;
    resetZoom();
    
    showToast('已移除图片', 'info');
}

// 处理图片
function processImage() {
    if (!currentFile || processing) return;
    
    processing = true;
    
    // 显示加载状态
    processText.textContent = '处理中...';
    processLoading.style.display = 'inline-block';
    processButton.disabled = true;
    loadingOverlay.style.display = 'flex';
    
    // 获取处理参数
    const params = getProcessingParameters();
    
    // 模拟处理过程 (实际项目中这里会调用API)
    const totalSteps = 5;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
        currentStep++;
        const progress = Math.round((currentStep / totalSteps) * 100);
        
        // 更新进度显示
        processText.textContent = `处理中... ${progress}%`;
        
        if (currentStep >= totalSteps) {
            clearInterval(progressInterval);
            
            // 模拟处理完成
            setTimeout(() => {
                processing = false;
                
                // 生成模拟结果
                generateMockResult();
                
                // 显示结果预览
                showResultPreview();
                
                // 更新按钮状态
                processText.textContent = '处理完成';
                processLoading.style.display = 'none';
                downloadButton.disabled = false;
                loadingOverlay.style.display = 'none';
                
                // 显示成功消息
                showToast('背景移除处理完成！', 'success');
            }, 500);
        }
    }, 500);
}

// 获取处理参数
function getProcessingParameters() {
    const format = document.querySelector('input[name="format"]:checked').value;
    const background = document.querySelector('input[name="background"]:checked').value;
    const edge = document.querySelector('input[name="edge"]:checked').value;
    const quality = qualitySlider.value;
    const resolution = document.querySelector('input[name="resolution"]:checked').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    
    return {
        format,
        background,
        edge,
        quality: parseInt(quality),
        resolution,
        mode
    };
}

// 生成模拟结果
function generateMockResult() {
    // 在实际项目中，这里会从服务器获取处理结果
    // 这里我们创建一个模拟的结果对象
    currentResult = {
        id: Date.now().toString(),
        filename: currentFile.name.replace(/\.[^/.]+$/, "") + '_processed.png',
        size: Math.round(currentFile.size * 0.7), // 模拟压缩后的大小
        url: URL.createObjectURL(currentFile), // 实际项目中应该是服务器返回的URL
        processedAt: new Date().toISOString(),
        parameters: getProcessingParameters()
    };
}

// 显示结果预览
function showResultPreview() {
    resultPreview.innerHTML = '';
    
    const img = document.createElement('img');
    img.src = currentResult.url;
    img.alt = '处理结果';
    img.id = 'resultImage';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.objectFit = 'contain';
    img.style.transform = `scale(${zoomLevels.result})`;
    img.style.transition = 'transform 0.3s ease';
    
    // 添加处理效果标记
    const badge = document.createElement('div');
    badge.style.position = 'absolute';
    badge.style.top = '10px';
    badge.style.right = '10px';
    badge.style.background = 'var(--color-success-500)';
    badge.style.color = 'white';
    badge.style.padding = '4px 8px';
    badge.style.borderRadius = '4px';
    badge.style.fontSize = '12px';
    badge.style.fontWeight = '600';
    badge.textContent = '已处理';
    
    resultPreview.appendChild(img);
    resultPreview.appendChild(badge);
    
    // 重置结果缩放级别
    zoomLevels.result = 1.0;
    updateImageZoom('result', zoomLevels.result);
}

// 下载结果
function downloadResult() {
    if (!currentResult) {
        showToast('没有可下载的结果', 'error');
        return;
    }
    
    // 在实际项目中，这里会触发文件下载
    // 这里我们模拟下载过程
    showToast('开始下载处理结果...', 'info');
    
    setTimeout(() => {
        // 创建下载链接
        const link = document.createElement('a');
        link.href = currentResult.url;
        link.download = currentResult.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('下载完成！', 'success');
    }, 1000);
}

// 重置所有
function resetAll() {
    resetFile();
    resetZoom();
    clearBatch();
    resetParameters();
    
    showToast('已重置所有设置', 'info');
}

// 重置参数
function resetParameters() {
    // 重置所有参数到默认值
    document.querySelector('input[name="format"][value="png"]').checked = true;
    document.querySelector('input[name="background"][value="transparent"]').checked = true;
    document.querySelector('input[name="edge"][value="auto"]').checked = true;
    document.querySelector('input[name="resolution"][value="original"]').checked = true;
    document.querySelector('input[name="mode"][value="fast"]').checked = true;
    
    qualitySlider.value = 85;
    qualityValue.textContent = '85%';
    
    // 隐藏高级选项
    if (isAdvancedOptionsVisible) {
        toggleAdvancedOptions();
    }
}

// 切换高级选项
function toggleAdvancedOptions() {
    isAdvancedOptionsVisible = !isAdvancedOptionsVisible;
    
    if (isAdvancedOptionsVisible) {
        advancedOptions.style.display = 'grid';
        toggleAdvancedButton.textContent = '高级选项 ▲';
        advancedOptions.classList.add('fade-in');
    } else {
        advancedOptions.style.display = 'none';
        toggleAdvancedButton.textContent = '高级选项 ▼';
    }
}

// 更新质量值显示
function updateQualityValue() {
    qualityValue.textContent = `${qualitySlider.value}%`;
}

// 调整缩放
function adjustZoom(type, direction) {
    const step = 0.25;
    
    if (direction === 'in') {
        zoomLevels[type] += step;
    } else {
        zoomLevels[type] = Math.max(0.25, zoomLevels[type] - step);
    }
    
    updateImageZoom(type, zoomLevels[type]);
    
    // 如果同步缩放已启用，同步另一个预览
    if (syncZoomCheckbox.checked) {
        const otherType = type === 'original' ? 'result' : 'original';
        zoomLevels[otherType] = zoomLevels[type];
        updateImageZoom(otherType, zoomLevels[otherType]);
    }
}

// 更新图片缩放
function updateImageZoom(type, level) {
    const image = document.getElementById(`${type}Image`);
    if (image) {
        image.style.transform = `scale(${level})`;
    }
}

// 重置缩放
function resetZoom() {
    zoomLevels.original = 1.0;
    zoomLevels.result = 1.0;
    
    updateImageZoom('original', zoomLevels.original);
    updateImageZoom('result', zoomLevels.result);
}

// 更新预览背景
function updatePreviewBackground() {
    const background = document.querySelector('input[name="previewBackground"]:checked').value;
    
    // 在实际项目中，这里会更新预览区域的背景
    // 这里我们只是显示一个提示
    showToast(`已切换到${getBackgroundName(background)}背景`, 'info');
}

function getBackgroundName(value) {
    const backgrounds = {
        'white': '白色',
        'gray': '灰色',
        'checker': '棋盘'
    };
    return backgrounds[value] || value;
}

// 添加批量处理项目
function addBatchItem() {
    if (batchFiles.length >= 10) {
        showToast('最多只能添加10张图片', 'warning');
        return;
    }
    
    // 创建文件输入
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png,.webp';
    input.style.display = 'none';
    
    input.onchange = (e) => {
        if (e.target.files.length) {
            const file = e.target.files[0];
            
            // 验证文件
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showToast('不支持的文件格式', 'error');
                return;
            }
            
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                showToast('文件大小超过限制', 'error');
                return;
            }
            
            // 添加到批量文件列表
            batchFiles.push(file);
            
            // 创建批量项目
            createBatchItem(file);
            
            // 更新批量处理按钮
            updateBatchProcessButton();
            
            showToast('图片已添加到批量处理列表', 'success');
        }
        
        // 移除文件输入
        document.body.removeChild(input);
    };
    
    document.body.appendChild(input);
    input.click();
}

// 创建批量处理项目
function createBatchItem(file) {
    const item = document.createElement('div');
    item.className = 'batch-item';
    item.dataset.filename = file.name;
    
    // 创建缩略图
    const thumbnail = document.createElement('img');
    thumbnail.src = URL.createObjectURL(file);
    thumbnail.alt = file.name;
    thumbnail.onload = () => {
        URL.revokeObjectURL(thumbnail.src);
    };
    
    // 创建移除按钮
    const removeButton = document.createElement('button');
    removeButton.className = 'batch-remove';
    removeButton.innerHTML = '×';
    removeButton.onclick = () => {
        removeBatchItem(file.name);
    };
    
    item.appendChild(thumbnail);
    item.appendChild(removeButton);
    
    // 在添加按钮前插入
    batchGrid.insertBefore(item, addBatchItemButton);
}

// 移除批量处理项目
function removeBatchItem(filename) {
    // 从数组中移除
    batchFiles = batchFiles.filter(file => file.name !== filename);
    
    // 从DOM中移除
    const item = document.querySelector(`.batch-item[data-filename="${filename}"]`);
    if (item) {
        item.remove();
    }
    
    // 更新批量处理按钮
    updateBatchProcessButton();
    
    showToast('已从批量处理列表中移除', 'info');
}

// 更新批量处理按钮
function updateBatchProcessButton() {
    const count = batchFiles.length;
    batchProcessButton.textContent = `批量处理 (${count})`;
    batchProcessButton.disabled = count === 0;
}

// 处理批量图片
function processBatch() {
    if (batchFiles.length === 0) {
        showToast('批量处理列表为空', 'warning');
        return;
    }
    
    showToast(`开始批量处理 ${batchFiles.length} 张图片...`, 'info');
    
    // 在实际项目中，这里会调用批量处理API
    // 这里我们模拟批量处理过程
    let processed = 0;
    const total = batchFiles.length;
    
    const processNext = () => {
        if (processed >= total) {
            showToast('批量处理完成！', 'success');
            return;
        }
        
        const file = batchFiles[processed];
        processed++;
        
        // 模拟处理延迟
        setTimeout(() => {
            showToast(`已处理: ${file.name} (${processed}/${total})`, 'info');
            processNext();
        }, 1000);
    };
    
    processNext();
}

// 清空批量处理
function clearBatch() {
    batchFiles = [];
    
    // 移除所有批量项目
    document.querySelectorAll('.batch-item').forEach(item => {
        item.remove();
    });
    
    // 更新批量处理按钮
    updateBatchProcessButton();
    
    showToast('已清空批量处理列表', 'info');
}

// 更新参数
function updateParameters() {
    // 在实际项目中，这里会更新处理参数
    // 这里我们只是记录参数变化
    const params = getProcessingParameters();
    console.log('参数已更新:', params);
}

// 更新UI状态
function updateUIState() {
    // 初始状态更新
    updateBatchProcessButton();
    updateQualityValue();
}

// 显示提示消息
function showToast(message, type = 'info') {
    // 在实际项目中，这里会显示一个美观的toast消息
    // 这里我们使用简单的alert作为示例
    const messages = {
        'success': `✅ ${message}`,
        'error': `❌ ${message}`,
        'warning': `⚠️ ${message}`,
        'info': `ℹ️ ${message}`
    };
    
    console.log(messages[type] || message);
    
    // 简单的浏览器通知
    if (type === 'error' || type === 'warning') {
        alert(messages[type]);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init);

// 导出函数供外部使用 (如果需要)
window.PhotoMagic = {
    init,
    handleFileSelect,
    processImage,
    downloadResult,
    resetAll,
    showToast
};

console.log('PhotoMagic Studio 背景移除页面脚本已加载');
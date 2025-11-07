/**
 * 图片版权信息标注模块
 * 为网站中的战斗机图片添加来源标注和版权信息
 */

const CopyrightAnnotator = {
    // 配置参数
    config: {
        showSource: true,              // 是否显示来源
        showCopyright: true,           // 是否显示版权信息
        position: 'bottom-right',      // 标注位置: bottom-right, bottom-left, top-right, top-left
        opacity: 0.9,                  // 标注透明度
        showOnHover: false,            // 是否仅在鼠标悬停时显示
        fontSize: '12px',              // 字体大小
        bgColor: 'rgba(0, 0, 0, 0.7)'  // 背景颜色
    },

    // 版权信息数据映射
    copyrightData: {
        // 示例数据，实际项目中可以从API获取
        'f22-001': {
            source: '美国空军官方',
            copyright: 'U.S. Air Force',
            license: 'Public Domain',
            year: '2023'
        },
        'f35-001': {
            source: '美国空军官方',
            copyright: 'U.S. Air Force',
            license: 'Public Domain',
            year: '2022'
        },
        'j20-001': {
            source: '中国空军官方',
            copyright: 'People\'s Liberation Army Air Force',
            license: 'Official Release',
            year: '2023'
        },
        'su57-001': {
            source: '俄罗斯国防部',
            copyright: 'Russian Ministry of Defense',
            license: 'Official Release',
            year: '2023'
        },
        'f16-001': {
            source: '美国空军官方',
            copyright: 'U.S. Air Force',
            license: 'Public Domain',
            year: '2021'
        },
        'rafale-001': {
            source: '法国国防部',
            copyright: 'Ministère des Armées',
            license: 'Official Release',
            year: '2023'
        }
    },

    // 默认版权信息
    defaultCopyright: {
        source: '军事航空图库',
        copyright: 'Military Aircraft Gallery',
        license: 'All Rights Reserved',
        year: new Date().getFullYear().toString()
    },

    // 初始化
    init(options = {}) {
        // 合并配置
        this.config = { ...this.config, ...options };
        
        // 初始化版权标注样式
        this.initStyles();
        
        // 添加所有图片的版权标注
        this.annotateAllImages();
        
        // 监听新添加的图片元素
        this.setupMutationObserver();
    },

    // 初始化样式
    initStyles() {
        // 检查是否已存在样式
        if (document.getElementById('copyright-annotator-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'copyright-annotator-styles';
        style.textContent = `
            .copyright-annotation {
                position: absolute;
                color: white;
                font-size: ${this.config.fontSize};
                background-color: ${this.config.bgColor};
                padding: 4px 8px;
                border-radius: 4px;
                pointer-events: none;
                z-index: 10;
                opacity: ${this.config.opacity};
                transition: opacity 0.3s ease;
                max-width: 80%;
                line-height: 1.3;
                backdrop-filter: blur(2px);
            }
            
            .copyright-annotation.copyright-position-bottom-right {
                bottom: 5px;
                right: 5px;
            }
            
            .copyright-annotation.copyright-position-bottom-left {
                bottom: 5px;
                left: 5px;
            }
            
            .copyright-annotation.copyright-position-top-right {
                top: 5px;
                right: 5px;
            }
            
            .copyright-annotation.copyright-position-top-left {
                top: 5px;
                left: 5px;
            }
            
            .copyright-annotation-hidden {
                opacity: 0;
            }
            
            .image-container {
                position: relative;
                display: inline-block;
            }
            
            .copyright-source {
                font-weight: 500;
                margin-bottom: 2px;
                display: block;
            }
            
            .copyright-info {
                font-size: 11px;
                opacity: 0.9;
            }
            
            .copyright-icon {
                margin-right: 4px;
                font-size: 10px;
            }
            
            /* 悬停显示效果 */
            ${this.config.showOnHover ? `
                .image-container:not(:hover) .copyright-annotation,
                .card-image-container:not(:hover) .copyright-annotation,
                .aircraft-gallery:not(:hover) .copyright-annotation {
                    opacity: 0;
                }
                
                .image-container:hover .copyright-annotation,
                .card-image-container:hover .copyright-annotation,
                .aircraft-gallery:hover .copyright-annotation {
                    opacity: ${this.config.opacity};
                }
            ` : ''}
        `;
        
        document.head.appendChild(style);
    },

    // 标注所有图片
    annotateAllImages() {
        // 标注卡片图片
        this.annotateCardImages();
        
        // 标注详情页图片
        this.annotateGalleryImages();
        
        // 标注其他图片
        this.annotateStandaloneImages();
    },

    // 标注卡片图片
    annotateCardImages() {
        document.querySelectorAll('.card-image-container').forEach(container => {
            const img = container.querySelector('img');
            if (img && !container.querySelector('.copyright-annotation')) {
                const imageId = this.getImageId(img);
                this.addAnnotation(container, imageId);
            }
        });
    },

    // 标注画廊图片
    annotateGalleryImages() {
        document.querySelectorAll('.aircraft-gallery, .gallery-main-image-container').forEach(container => {
            const img = container.querySelector('img');
            if (img && !container.querySelector('.copyright-annotation')) {
                const imageId = this.getImageId(img);
                this.addAnnotation(container, imageId);
            }
        });
    },

    // 标注独立图片
    annotateStandaloneImages() {
        document.querySelectorAll('img:not(.no-copyright):not([aria-hidden="true"])').forEach(img => {
            // 跳过已经有容器的图片
            if (img.closest('.card-image-container, .aircraft-gallery, .gallery-main-image-container')) {
                return;
            }
            
            // 如果图片没有容器，创建一个容器
            if (img.parentElement && img.parentElement.style.position !== 'relative') {
                const container = document.createElement('div');
                container.className = 'image-container';
                
                // 复制图片属性
                const cloneImg = img.cloneNode(true);
                
                // 替换图片
                img.parentNode.insertBefore(container, img);
                container.appendChild(img);
                
                // 获取图片ID
                const imageId = this.getImageId(img);
                
                // 添加标注
                this.addAnnotation(container, imageId);
            }
        });
    },

    // 添加标注
    addAnnotation(container, imageId) {
        // 确保容器有相对定位
        if (container.style.position !== 'relative') {
            container.style.position = 'relative';
        }
        
        // 获取版权信息
        const copyright = this.getCopyrightInfo(imageId);
        
        // 创建标注元素
        const annotation = document.createElement('div');
        annotation.className = `copyright-annotation copyright-position-${this.config.position}`;
        
        // 构建标注内容
        let content = '';
        
        if (this.config.showSource && copyright.source) {
            content += `<div class="copyright-source">
                <i class="fa fa-camera copyright-icon" aria-hidden="true"></i>
                ${copyright.source}
            </div>`;
        }
        
        if (this.config.showCopyright) {
            content += `<div class="copyright-info">
                <i class="fa fa-copyright copyright-icon" aria-hidden="true"></i>
                ${copyright.copyright} ${copyright.year}
            </div>`;
            
            if (copyright.license) {
                content += `<div class="copyright-info">
                    <i class="fa fa-certificate copyright-icon" aria-hidden="true"></i>
                    ${copyright.license}
                </div>`;
            }
        }
        
        annotation.innerHTML = content;
        container.appendChild(annotation);
    },

    // 获取图片ID
    getImageId(img) {
        // 尝试从data-id属性获取
        if (img.dataset.id) {
            return img.dataset.id;
        }
        
        // 尝试从父元素的data-id获取
        const parent = img.closest('[data-id]');
        if (parent) {
            return parent.dataset.id;
        }
        
        // 尝试从URL解析
        const url = img.src;
        if (url) {
            // 从URL中提取可能的ID
            const match = url.match(/id=(\w+)/) || 
                         url.match(/\/(\w+)-\d+\./) ||
                         url.match(/\/(\w+)\./);
            
            if (match && match[1]) {
                return match[1];
            }
        }
        
        // 返回默认ID
        return 'default';
    },

    // 获取版权信息
    getCopyrightInfo(imageId) {
        // 如果有对应ID的版权信息，返回它
        if (this.copyrightData[imageId]) {
            return this.copyrightData[imageId];
        }
        
        // 否则返回默认版权信息
        return this.defaultCopyright;
    },

    // 设置MutationObserver以监听新添加的图片
    setupMutationObserver() {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) { // 元素节点
                        // 检查是否添加了新的图片容器
                        if (node.classList.contains('card-image-container') || 
                            node.classList.contains('aircraft-gallery') ||
                            node.classList.contains('gallery-main-image-container')) {
                            const img = node.querySelector('img');
                            if (img && !node.querySelector('.copyright-annotation')) {
                                const imageId = this.getImageId(img);
                                this.addAnnotation(node, imageId);
                            }
                        }
                        
                        // 检查子节点中是否有图片
                        node.querySelectorAll('.card-image-container, .aircraft-gallery, .gallery-main-image-container').forEach(container => {
                            const img = container.querySelector('img');
                            if (img && !container.querySelector('.copyright-annotation')) {
                                const imageId = this.getImageId(img);
                                this.addAnnotation(container, imageId);
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    },

    // 添加版权数据
    addCopyrightData(imageId, data) {
        this.copyrightData[imageId] = { ...this.copyrightData[imageId], ...data };
        
        // 更新对应的标注
        const containers = document.querySelectorAll(`[data-id="${imageId}"]`);
        containers.forEach(container => {
            const annotation = container.querySelector('.copyright-annotation');
            if (annotation) {
                container.removeChild(annotation);
                this.addAnnotation(container, imageId);
            }
        });
    },

    // 更新配置
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // 更新所有标注的样式
        document.querySelectorAll('.copyright-annotation').forEach(annotation => {
            annotation.style.opacity = this.config.opacity;
            annotation.style.fontSize = this.config.fontSize;
            annotation.style.backgroundColor = this.config.bgColor;
            
            // 更新位置
            Object.keys(this.config).forEach(key => {
                if (key.startsWith('position-')) {
                    annotation.classList.remove(key);
                }
            });
            
            annotation.classList.add(`copyright-position-${this.config.position}`);
        });
        
        // 重新初始化样式
        const styleElement = document.getElementById('copyright-annotator-styles');
        if (styleElement) {
            styleElement.remove();
        }
        this.initStyles();
    },

    // 显示/隐藏所有标注
    toggleVisibility(show) {
        const annotations = document.querySelectorAll('.copyright-annotation');
        
        annotations.forEach(annotation => {
            if (show) {
                annotation.classList.remove('copyright-annotation-hidden');
            } else {
                annotation.classList.add('copyright-annotation-hidden');
            }
        });
    },

    // 导出版权信息为JSON
    exportCopyrightData() {
        return JSON.stringify(this.copyrightData, null, 2);
    },

    // 导入版权信息
    importCopyrightData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.copyrightData = { ...this.copyrightData, ...data };
            
            // 重新标注所有图片
            this.removeAllAnnotations();
            this.annotateAllImages();
            
            return true;
        } catch (error) {
            console.error('导入版权数据失败:', error);
            return false;
        }
    },

    // 移除所有标注
    removeAllAnnotations() {
        document.querySelectorAll('.copyright-annotation').forEach(annotation => {
            if (annotation.parentNode) {
                annotation.parentNode.removeChild(annotation);
            }
        });
    }
};

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // 默认配置，可以根据需要修改
        CopyrightAnnotator.init({
            showSource: true,
            showCopyright: true,
            position: 'bottom-right',
            opacity: 0.7,
            showOnHover: false
        });
    });
} else {
    // DOM已加载完成
    CopyrightAnnotator.init({
        showSource: true,
        showCopyright: true,
        position: 'bottom-right',
        opacity: 0.7,
        showOnHover: false
    });
}

// 导出模块，供其他脚本使用
export default CopyrightAnnotator;
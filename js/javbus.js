// JavBus 热门电影推荐功能（参考 douban.js 结构）

// 默认标签
const defaultMovieTags = [
    '热门', '最新', '无码', '有码', '中文', '欧美', '日本', '韩国', '剧情', '制服', '萝莉', '素人', '巨乳', '熟女', '美乳', '颜值', '剧情片'
];

// 用户标签列表
let movieTags = [];

// 加载用户标签（本地存储）
function loadUserTags() {
    try {
        const savedMovieTags = localStorage.getItem('userJavbusMovieTags');
        if (savedMovieTags) {
            movieTags = JSON.parse(savedMovieTags);
        } else {
            movieTags = [...defaultMovieTags];
        }
    } catch (e) {
        console.error('加载标签失败：', e);
        movieTags = [...defaultMovieTags];
    }
}

// 保存用户标签
function saveUserTags() {
    try {
        localStorage.setItem('userJavbusMovieTags', JSON.stringify(movieTags));
    } catch (e) {
        console.error('保存标签失败：', e);
        showToast('保存标签失败', 'error');
    }
}

let javbusCurrentTag = '热门';
let javbusPageStart = 0;
const javbusPageSize = 16;

// 渲染标签选择器
function renderJavbusTags() {
    const tagContainer = document.getElementById('javbus-tags');
    if (!tagContainer) return;
    tagContainer.innerHTML = '';

    // 标签管理按钮
    const manageBtn = document.createElement('button');
    manageBtn.className = 'py-1.5 px-3.5 rounded text-sm font-medium transition-all duration-300 bg-[#1a1a1a] text-gray-300 hover:bg-pink-700 hover:text-white border border-[#333] hover:border-white';
    manageBtn.innerHTML = '<span class="flex items-center"><svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>管理</span>';
    manageBtn.onclick = function() {
        showJavbusTagManageModal();
    };
    tagContainer.appendChild(manageBtn);

    // 渲染标签
    movieTags.forEach(tag => {
        const btn = document.createElement('button');
        let btnClass = 'py-1.5 px-3.5 rounded text-sm font-medium transition-all duration-300 border ';
        if (tag === javbusCurrentTag) {
            btnClass += 'bg-pink-600 text-white shadow-md border-white';
        } else {
            btnClass += 'bg-[#1a1a1a] text-gray-300 hover:bg-pink-700 hover:text-white border-[#333] hover:border-white';
        }
        btn.className = btnClass;
        btn.textContent = tag;
        btn.onclick = function() {
            if (javbusCurrentTag !== tag) {
                javbusCurrentTag = tag;
                javbusPageStart = 0;
                renderJavbusRecommend(javbusCurrentTag, javbusPageSize, javbusPageStart);
                renderJavbusTags();
            }
        };
        tagContainer.appendChild(btn);
    });
}

// 换一批按钮事件
function setupJavbusRefreshBtn() {
    const btn = document.getElementById('javbus-refresh');
    if (!btn) return;
    btn.onclick = function() {
        javbusPageStart += javbusPageSize;
        if (javbusPageStart > 9 * javbusPageSize) {
            javbusPageStart = 0;
        }
        renderJavbusRecommend(javbusCurrentTag, javbusPageSize, javbusPageStart);
    };
}

// 渲染推荐内容
function renderJavbusRecommend(tag, pageLimit, pageStart) {
    const container = document.getElementById('javbus-results');
    if (!container) return;

    const loadingOverlayHTML = `
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-10">
            <div class="flex items-center justify-center">
                <div class="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin inline-block"></div>
                <span class="text-pink-500 ml-4">加载中...</span>
            </div>
        </div>
    `;

    container.classList.add("relative");
    container.insertAdjacentHTML('beforeend', loadingOverlayHTML);

    fetchJavbusData(tag, pageLimit, pageStart)
        .then(data => {
            renderJavbusCards(data, container);
        })
        .catch(error => {
            console.error("获取JavBus数据失败：", error);
            container.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <div class="text-red-400">❌ 获取JavBus数据失败，请稍后重试</div>
                </div>
            `;
        });
}

// 伪造的JavBus数据获取函数（实际应为页面爬取/接口请求并解析）
async function fetchJavbusData(tag, pageLimit, pageStart) {
    // 这里仅作演示，实际应爬取或解析JavBus页面数据
    // 可根据 tag、pageLimit、pageStart 拼接URL和爬取
    return {
        subjects: Array.from({length: pageLimit}).map((_, i) => ({
            title: `${tag} 影片${pageStart + i + 1}`,
            cover: `https://dummyimage.com/300x450/000/fff&text=${encodeURIComponent(tag)}${pageStart+i+1}`,
            rate: (Math.random() * 2 + 7).toFixed(1),
            url: `https://www.javbus.com/FAKE${pageStart + i + 1}`
        }))
    };
}

// 渲染卡片
function renderJavbusCards(data, container) {
    const fragment = document.createDocumentFragment();
    if (!data.subjects || data.subjects.length === 0) {
        const emptyEl = document.createElement("div");
        emptyEl.className = "col-span-full text-center py-8";
        emptyEl.innerHTML = `<div class="text-pink-500">❌ 暂无数据，请尝试其他分类或刷新</div>`;
        fragment.appendChild(emptyEl);
    } else {
        data.subjects.forEach(item => {
            const card = document.createElement("div");
            card.className = "bg-[#111] hover:bg-[#222] transition-all duration-300 rounded-lg overflow-hidden flex flex-col transform hover:scale-105 shadow-md hover:shadow-lg";
            const safeTitle = item.title.replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
            const safeRate = (item.rate || "暂无").replace(/</g,'&lt;').replace(/>/g,'&gt;');
            card.innerHTML = `
                <div class="relative w-full aspect-[2/3] overflow-hidden cursor-pointer" onclick="fillSearchInput('${safeTitle}')">
                    <img src="${item.cover}" alt="${safeTitle}" 
                        class="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                        loading="lazy" referrerpolicy="no-referrer">
                    <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
                    <div class="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm">
                        <span class="text-yellow-400">★</span> ${safeRate}
                    </div>
                    <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-sm hover:bg-[#333] transition-colors">
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer" title="在JavBus查看" onclick="event.stopPropagation();">
                            🔗
                        </a>
                    </div>
                </div>
                <div class="p-2 text-center bg-[#111]">
                    <button onclick="fillSearchInput('${safeTitle}')" 
                            class="text-sm font-medium text-white truncate w-full hover:text-pink-400 transition"
                            title="${safeTitle}">
                        ${safeTitle}
                    </button>
                </div>
            `;
            fragment.appendChild(card);
        });
    }
    container.innerHTML = "";
    container.appendChild(fragment);
}

// 标签管理模态框
function showJavbusTagManageModal() {
    let modal = document.getElementById('javbusTagManageModal');
    if (modal) document.body.removeChild(modal);

    modal = document.createElement('div');
    modal.id = 'javbusTagManageModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40';

    modal.innerHTML = `
        <div class="bg-[#191919] rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
            <button id="closeJavbusTagModal" class="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">&times;</button>
            <h3 class="text-xl font-bold text-white mb-4">标签管理</h3>
            <div class="mb-4">
                <div class="flex justify-between items-center mb-2">
                    <h4 class="text-lg font-medium text-gray-300">标签列表</h4>
                    <button id="resetJavbusTagsBtn" class="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded">恢复默认标签</button>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4" id="javbusTagsGrid">
                    ${movieTags.length ? movieTags.map(tag => {
                        const canDelete = tag !== '热门';
                        return `
                            <div class="bg-[#1a1a1a] text-gray-300 py-1.5 px-3 rounded text-sm font-medium flex justify-between items-center group">
                                <span>${tag}</span>
                                ${canDelete ? 
                                    `<button class="delete-javbus-tag-btn text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                                        data-tag="${tag}">✕</button>` : 
                                    `<span class="text-gray-500 text-xs italic opacity-0 group-hover:opacity-100">必需</span>`
                                }
                            </div>
                        `;
                    }).join('') : 
                    `<div class="col-span-full text-center py-4 text-gray-500">无标签，请添加或恢复默认</div>`}
                </div>
            </div>
            <div class="border-t border-gray-700 pt-4">
                <h4 class="text-lg font-medium text-gray-300 mb-3">添加新标签</h4>
                <form id="addJavbusTagForm" class="flex items-center">
                    <input type="text" id="newJavbusTagInput" placeholder="输入标签名称..." 
                           class="flex-1 bg-[#222] text-white border border-gray-700 rounded px-3 py-2 focus:outline-none focus:border-pink-500">
                    <button type="submit" class="ml-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded">添加</button>
                </form>
                <p class="text-xs text-gray-500 mt-2">提示：标签名称不能为空，不能重复，不能包含特殊字符</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    setTimeout(() => { document.getElementById('newJavbusTagInput').focus(); }, 100);

    document.getElementById('closeJavbusTagModal').addEventListener('click', function() {
        document.body.removeChild(modal);
    });
    modal.addEventListener('click', function(e) {
        if (e.target === modal) document.body.removeChild(modal);
    });
    document.getElementById('resetJavbusTagsBtn').addEventListener('click', function() {
        resetJavbusTagsToDefault();
        showJavbusTagManageModal();
    });
    document.querySelectorAll('.delete-javbus-tag-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tagToDelete = this.getAttribute('data-tag');
            deleteJavbusTag(tagToDelete);
            showJavbusTagManageModal();
        });
    });
    document.getElementById('addJavbusTagForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const input = document.getElementById('newJavbusTagInput');
        const newTag = input.value.trim();
        if (newTag) {
            addJavbusTag(newTag);
            input.value = '';
            showJavbusTagManageModal();
        }
    });
}

// 添加标签
function addJavbusTag(tag) {
    const safeTag = tag.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const exists = movieTags.some(existingTag => existingTag.toLowerCase() === safeTag.toLowerCase());
    if (exists) {
        showToast('标签已存在', 'warning');
        return;
    }
    movieTags.push(safeTag);
    saveUserTags();
    renderJavbusTags();
    showToast('标签添加成功', 'success');
}

// 删除标签
function deleteJavbusTag(tag) {
    if (tag === '热门') {
        showToast('热门标签不能删除', 'warning');
        return;
    }
    const index = movieTags.indexOf(tag);
    if (index !== -1) {
        movieTags.splice(index, 1);
        saveUserTags();
        if (javbusCurrentTag === tag) {
            javbusCurrentTag = '热门';
            javbusPageStart = 0;
            renderJavbusRecommend(javbusCurrentTag, javbusPageSize, javbusPageStart);
        }
        renderJavbusTags();
        showToast('标签删除成功', 'success');
    }
}

// 恢复默认标签
function resetJavbusTagsToDefault() {
    movieTags = [...defaultMovieTags];
    javbusCurrentTag = '热门';
    javbusPageStart = 0;
    saveUserTags();
    renderJavbusTags();
    renderJavbusRecommend(javbusCurrentTag, javbusPageSize, javbusPageStart);
    showToast('已恢复默认标签', 'success');
}

// 只填充搜索框
function fillSearchInput(title) {
    if (!title) return;
    const safeTitle = title.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const input = document.getElementById('searchInput');
    if (input) {
        input.value = safeTitle;
        input.focus();
        showToast('已填充搜索内容，点击搜索按钮开始搜索', 'info');
    }
}

// 初始化
function initJavbus() {
    loadUserTags();
    renderJavbusTags();
    setupJavbusRefreshBtn();
    renderJavbusRecommend(javbusCurrentTag, javbusPageSize, javbusPageStart);
}

document.addEventListener('DOMContentLoaded', initJavbus);

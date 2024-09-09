// Commit画面にprev, nextボタンを追加する
function createNavigationButton(prevCommitId, nextCommitId, githubUserId, githubRepoName) {
    const parentNode = document.getElementsByClassName("commit-branches")[0];
    // parentNodeが存在するか確認
    if (!parentNode) {
        console.error("Parent node 'commit-branches' not found.");
        return;
    }

    // 両方のボタンが無効な場合は処理を中断
    if (!prevCommitId && !nextCommitId) {
        return;
    }

    // 既にボタンが存在する場合は処理を中断
    if (document.getElementById('prev-button') || document.getElementById('next-button')) {
        return;
    }

    const githubRepositoryUrl = `https://github.com/${githubUserId}/${githubRepoName}`;

    // Prevボタンの作成
    const prevButton = document.createElement('button');
    prevButton.id = 'prev-button';
    prevButton.textContent = 'Prev';
    prevButton.style.padding = '10px';
    prevButton.classList.add('navigation-button');
    prevButton.disabled = !prevCommitId;

    try {
        const prevSvg = new DOMParser().parseFromString(getPrevSvg(), 'image/svg+xml').documentElement;
        prevButton.prepend(prevSvg);
    } catch (e) {
        console.error('Error parsing Prev SVG:', e);
    }

    prevButton.onclick = function () {
        if (prevCommitId) {
            window.location.href = `${githubRepositoryUrl}/commit/${prevCommitId}`;
        }
    };

    // Nextボタンの作成
    const nextButton = document.createElement('button');
    nextButton.id = 'next-button';
    nextButton.textContent = 'Next';
    nextButton.style.padding = '10px';
    nextButton.classList.add('navigation-button');
    nextButton.disabled = !nextCommitId;

    try {
        const nextSvg = new DOMParser().parseFromString(getNextSvg(), 'image/svg+xml').documentElement;
        nextButton.appendChild(nextSvg);
    } catch (e) {
        console.error('Error parsing Next SVG:', e);
    }

    nextButton.onclick = function () {
        if (nextCommitId) {
            window.location.href = `${githubRepositoryUrl}/commit/${nextCommitId}`;
        }
    };

    // ボタンコンテナの作成
    const navigationButtonContainer = document.createElement('div');
    navigationButtonContainer.style.display = 'flex';
    navigationButtonContainer.style.justifyContent = 'end';
    navigationButtonContainer.style.marginBottom = '10px';

    navigationButtonContainer.append(prevButton);
    navigationButtonContainer.append(nextButton);

    parentNode.append(navigationButtonContainer);
}

// 前のコミットボタンのSVG
function getPrevSvg() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="bi bi-arrow-right" width="16" height="16">
        <path fill-rule="evenodd" d="M8.646 11.354a.5.5 0 0 0 .793-.707L5.707 8l3.732-3.732a.5.5 0 0 0-.793-.707l-4 4a.5.5 0 0 0 0 .707l4 4z"/>
    </svg>
    `;
}

// 次のコミットボタンのSVG
function getNextSvg() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="bi bi-arrow-left" width="16" height="16">
        <path fill-rule="evenodd" d="M7.354 11.354a.5.5 0 0 0 .793.707l4-4a.5.5 0 0 0 0-.707l-4-4a.5.5 0 0 0-.793.707L10.293 8l-2.939 2.939a.5.5 0 0 0 0 .707z"/>
    </svg>
    `;
}

async function fetchCommitIds(githubUserId, githubRepoName, expiration = 60 * 60 * 1000) {
    const url = `https://api.github.com/repos/${githubUserId}/${githubRepoName}/commits`;
    const cacheKey = getCommitCacheKey(githubUserId, githubRepoName);
    const cache = localStorage.getItem(cacheKey);

    // キャッシュが存在し、有効期限内であればキャッシュを返す
    if (cache) {
        const cachedData = JSON.parse(cache);
        if ((Date.now() - cachedData.timestamp) < expiration) {
            return cachedData.data;
        }
    }

    // キャッシュがないか期限切れの場合はAPIから取得
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();

        // キャッシュを更新
        localStorage.setItem(cacheKey, JSON.stringify({ data: data, timestamp: Date.now() }));

        // 取得したデータを返す
        return data;
    } catch (error) {
        console.error('Error fetching commit data:', error);
        throw error;  // エラーを呼び出し元に投げる
    }
}

// 前後のコミットIDを取得
function getPrevNextCommitId(commitIds, currentCommitId)
{
    const commitIdIndex = commitIds.findIndex(commit => commit.sha === currentCommitId);
    const prevCommitId = commitIds[commitIdIndex + 1]?.sha;
    const nextCommitId = commitIds[commitIdIndex - 1]?.sha;
    return {prevCommitId, nextCommitId};
}

// GitHubのユーザーIDを取得
function getGithubUserId() {
    return location.href.split('/')[3];
}

// GitHubのリポジトリ名を取得
function getGithubRepoName() {
    return location.href.split('/')[4];
}

// CSSの追加
function injectCSS(cssFileName, id) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = chrome.runtime.getURL(cssFileName);
    css.id = id;
    document.head.appendChild(css);
}

function getCommitCacheKey(githubUserId, githubRepoName)
{
    return `commit_cache_${githubUserId}_${githubRepoName}`;
}

// ページの遷移を監視するための変数
var currentUrl = window.location.href;

// メイン処理
function main() {
    if (!window.location.pathname.includes('/commit/')) {
        return;
    }

    // content_scriptで追加しないようにしたのでCSSを動的に追加する
    injectCSS('content.css', 'github-commit-navigation-css');
    const githubUserId = getGithubUserId();
    const githubRepoName = getGithubRepoName();
    const currentCommitId = location.href.split('/').pop();

    // APIからデータを取得し、ボタンを作成
    fetchCommitIds(githubUserId, githubRepoName).then(commitIds => {
        const {prevCommitId, nextCommitId} = getPrevNextCommitId(commitIds, currentCommitId);
        createNavigationButton(prevCommitId, nextCommitId, githubUserId, githubRepoName);
    })
}

main();

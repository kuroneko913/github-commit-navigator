// Commit画面にprev, nextボタンを追加する
function createNavigationButton(prevCommitId, nextCommitId, githubUserId, githubRepoName)
{
    const parentNode = document.getElementsByClassName("commit-branches")[0];
    const githubRepositoryUrl = `https://github.com/${githubUserId}/${githubRepoName}`;

    const prevButton = document.createElement('button');
    prevButton.id = 'prev-button';
    prevButton.textContent = 'Prev';
    prevButton.style.padding = '10px';
    prevButton.classList.add('navigation-button');
    prevButton.disabled = !prevCommitId;
    prevButton.prepend(new DOMParser().parseFromString(getPrevSvg(), 'image/svg+xml').documentElement);
    prevButton.onclick = function () {
        if (prevCommitId) {
            window.location.href = `${githubRepositoryUrl}/commit/${prevCommitId}`;
        }
    };

    const nextButton = document.createElement('button');
    nextButton.id = 'next-button';
    nextButton.textContent = 'Next';
    nextButton.style.padding = '10px';
    nextButton.classList.add('navigation-button');
    nextButton.disabled = !nextCommitId;
    nextButton.appendChild(new DOMParser().parseFromString(getNextSvg(), 'image/svg+xml').documentElement);
    nextButton.onclick = function () {
        if (nextCommitId) {
            window.location.href = `${githubRepositoryUrl}/commit/${nextCommitId}`;
        }
    };

    const navigationButtonContainer = document.createElement('div');
    navigationButtonContainer.style.display = 'flex';
    navigationButtonContainer.style.justifyContent = 'end';
    navigationButtonContainer.style.marginBottom = '10px';
    navigationButtonContainer.append(prevButton);
    navigationButtonContainer.append(nextButton);

    parentNode.append(navigationButtonContainer);
}

function getPrevSvg() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle">
        <path fill-rule="evenodd" d="M10.707 3.293a1 1 0 0 1 1.414 1.414L7.414 10l4.707 4.707a1 1 0 0 1-1.414 1.414l-5-5a1 1 0 0 1 0-1.414l5-5z"/>
    </svg>
    `;
}

function getNextSvg() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" style="vertical-align: middle">
        <path fill-rule="evenodd" d="M9.293 16.707a1 1 0 0 1-1.414-1.414L12.586 10 7.879 5.293a1 1 0 0 1 1.414-1.414l5 5a1 1 0 0 1 0 1.414l-5 5z"/>
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
        console.log('Fetching commit data...');
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

function getPrevNextCommitId(commitIds, currentCommitId)
{
    const commitIdIndex = commitIds.findIndex(commit => commit.sha === currentCommitId);
    const prevCommitId = commitIds[commitIdIndex + 1]?.sha;
    const nextCommitId = commitIds[commitIdIndex - 1]?.sha;
    return {prevCommitId, nextCommitId};
}

function getGithubUserId()
{
    return location.href.split('/')[3];
}

function getGithubRepoName()
{
    return location.href.split('/')[4];
}

function clearCache()
{
    localStorage.clear();
}

// ページ遷移を監視して、Commitページに遷移したら処理を行う
function detectPageChange() {
    let currentPath = window.location.pathname;
  
    setInterval(() => {
      if (currentPath !== window.location.pathname) {
        currentPath = window.location.pathname;
  
        // Commitページに移動したか確認
        if (currentPath.includes('/commit/')) {
          main();  // ボタンを追加する処理
        }
      }
    }, 1000); // 1秒ごとにURLの変更をチェック
}

function getCommitCacheKey(githubUserId, githubRepoName)
{
    return `commit_cache_${githubUserId}_${githubRepoName}`;
}

function main()
{
    if (!window.location.pathname.includes('/commit/')) {
        return;
    }
    const githubUserId = getGithubUserId();
    const githubRepoName = getGithubRepoName();
    const currentCommitId = location.href.split('/').pop();
    fetchCommitIds(githubUserId, githubRepoName).then(commitIds => {
        const {prevCommitId, nextCommitId} = getPrevNextCommitId(commitIds, currentCommitId);
        createNavigationButton(prevCommitId, nextCommitId, githubUserId, githubRepoName);
    });
}

main();
  
// ページ遷移を監視
detectPageChange();

/**
 * GitHubのリポジトリからコミット情報を取得する
 * キャッシュが存在し、有効期限内であればキャッシュを返す
 * 
 * @param string githubUserId 
 * @param string githubRepoName 
 * @param string cacheKey 
 * @param int expiration 
 * @returns array data  
 */
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

/**
 * キャッシュキーを取得する
 * 
 * @param string githubUserId 
 * @param string githubRepoName 
 * @returns string
 */
function getCommitCacheKey(githubUserId, githubRepoName)
{
    return `commit_cache_${githubUserId}_${githubRepoName}`;
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

export { fetchCommitIds, getPrevNextCommitId, getGithubUserId, getGithubRepoName };


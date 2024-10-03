/**
 * GitHubのCommitページに前後のコミットへのナビゲーションボタンを追加する
 */
import { 
    fetchCommitIds, 
    getGithubRepoName,
    getGithubUserId, 
    getPrevNextCommitId 
} from './fetcher/GithubCommitFetcher.js';
import { createNavigationButton } from './createNavigationButton.js';

// CSSの追加
function injectCSS(cssFileName, id) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = chrome.runtime.getURL(cssFileName);
    css.id = id;
    document.head.appendChild(css);
}

// メイン処理
function main() {
    if (!window.location.pathname.includes('/commit/')) {
        return;
    }
    console.log('GitHub Commit Navigation Extension loaded.');
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

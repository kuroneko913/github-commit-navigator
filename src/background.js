// デバウンス関数を追加
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// onHistoryStateUpdatedイベントをデバウンス
chrome.webNavigation.onHistoryStateUpdated.addListener(debounce(function(details) {
    if (details.url.includes('github.com')) {
        // 現在のタブでボタンがすでに表示されているかどうかを確認
        chrome.scripting.executeScript({
            target: {tabId: details.tabId},
            func: () => {
                // コミットページじゃない場合はスクリプトを実行しない
                const isCommitPage = window.location.pathname.includes('/commit/');
                if (!isCommitPage) {
                    return false;
                }

                const prevButtonExists = !!document.getElementById('prev-button');
                const nextButtonExists = !!document.getElementById('next-button');
                // ボタンが存在しない場合のみスクリプトを実行
                return !(prevButtonExists && nextButtonExists);
            },
        }, (results) => {
            if (chrome.runtime.lastError) {
                console.error('Error:', chrome.runtime.lastError.message);
                return;
            }
            if (results && !results[0]) {
                return;
            }
            chrome.scripting.executeScript({
                target: {tabId: details.tabId},
                files: ['dist/bundle.js'],
            });
        });
    }
}, 500), {url: [{hostContains: 'github.com'}]});

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

export { createNavigationButton };
function renderBookmarkList() {
    const listContainer = document.getElementById('bookmark-list');
    if (!listContainer) return;

    const bookmarks = bookmarkManager.getBookmarks();

    if (bookmarks.length === 0) {
        listContainer.innerHTML = '<p class="empty-state">저장된 북마클릿이 없습니다.</p>';
        return;
    }

    listContainer.innerHTML = `
        <div class="bookmark-grid">
            ${bookmarks.map(bookmark => `
                <div class="bookmark-card" data-id="${bookmark.id}">
                    <div class="bookmark-header">
                        <div style="display: flex; gap: 0.5rem; align-items: center;">
                            <span class="system-badge ${bookmark.system.toLowerCase()}">
                                ${bookmark.systemName}
                            </span>
                            ${bookmark.isFloating ?
            '<span style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">🎯 플로팅</span>' :
            '<span style="background: #2196F3; color: white; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem;">📌 일반</span>'
        }
                        </div>
                        <button class="delete-btn" onclick="removeBookmark('${bookmark.id}')">✕</button>
                    </div>
                    <h3>${bookmark.title}</h3>
                    <p class="bookmark-date">${new Date(bookmark.createdAt).toLocaleDateString()}</p>
                    ${bookmark.isFloating ?
            '<p style="color: #764ba2; font-size: 0.875rem; margin-top: 0.5rem;">민원 사이트에 고정 버튼이 생성됩니다</p>' :
            '<p style="color: #2196F3; font-size: 0.875rem; margin-top: 0.5rem;">북마크 바에서 실행하는 일반 북마클릿</p>'
        }
                    <div class="bookmark-actions">
                        ${bookmark.isFloating ?
            `<button onclick="navigator.clipboard.writeText('${bookmark.bookmarkletUrl.replace(/'/g, "\\'")}').then(() => showNotification('플로팅 버튼 코드 복사됨', 'success'))">
                                📋 코드 복사
                            </button>` :
            `<button onclick="bookmarkManager.executeBookmarklet('${bookmark.bookmarkletUrl}')">
                                실행
                            </button>`
        }
                        <button onclick="showBookmarkDetail('${bookmark.id}')">
                            상세보기
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// 북마클릿 상세 정보 표시 함수 추가
function showBookmarkDetail(id) {
    const bookmark = bookmarkManager.getBookmarks().find(b => b.id === id);
    if (!bookmark) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${bookmark.isFloating ? '🎯' : '📌'} ${bookmark.systemName} - ${bookmark.title}</h3>
            <div style="margin: 1rem 0;">
                <p><strong>타입:</strong> ${bookmark.isFloating ? '플로팅 버튼' : '일반 북마클릿'}</p>
                <p><strong>생성일:</strong> ${new Date(bookmark.createdAt).toLocaleString()}</p>
                <p><strong>시스템:</strong> ${bookmark.systemName}</p>
            </div>
            <div style="background: #f5f5f5; padding: 1rem; border-radius: 4px; margin: 1rem 0;">
                <p style="font-size: 0.875rem; color: #666; word-break: break-all;">
                    <strong>북마클릿 코드 (처음 100자):</strong><br>
                    ${bookmark.bookmarkletUrl.substring(0, 100)}...
                </p>
            </div>
            <div class="bookmark-actions">
                <button onclick="navigator.clipboard.writeText('${bookmark.bookmarkletUrl.replace(/'/g, "\\'")}').then(() => showNotification('클립보드에 복사됨', 'success'))">
                    📋 전체 코드 복사
                </button>
                <button onclick="this.parentElement.parentElement.parentElement.remove()">
                    닫기
                </button>
            </div>
            ${bookmark.isFloating ?
            `<div style="background: linear-gradient(135deg, #667eea20, #764ba220); padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <p style="color: #764ba2; font-weight: bold;">사용 방법:</p>
                    <ol style="color: #666; padding-left: 20px;">
                        <li>복사한 코드를 북마크 URL로 저장</li>
                        <li>민원 사이트 접속</li>
                        <li>북마크 클릭 → 플로팅 버튼 생성</li>
                        <li>플로팅 버튼 클릭 → 자동 입력!</li>
                    </ol>
                </div>` :
            `<div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin-top: 1rem;">
                    <p style="color: #1976d2; font-weight: bold;">사용 방법:</p>
                    <ol style="color: #666; padding-left: 20px;">
                        <li>북마크 바에 저장</li>
                        <li>민원 사이트 접속</li>
                        <li>북마크 클릭 → 자동 입력!</li>
                    </ol>
                </div>`
        }
        </div>
    `;
    document.body.appendChild(modal);
}

function removeBookmark(id) {
    if (confirm('이 북마클릿을 삭제하시겠습니까?')) {
        bookmarkManager.removeBookmark(id);
        renderBookmarkList();
        showNotification('북마클릿이 삭제되었습니다.', 'info');
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('클립보드에 복사되었습니다.', 'success');
    });
}
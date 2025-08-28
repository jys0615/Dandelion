class BookmarkManager {
    constructor() {
        this.storageKey = 'autoComplaintBookmarks';
        this.bookmarks = this.loadBookmarks();
    }

    loadBookmarks() {
        const stored = localStorage.getItem(this.storageKey);
        return stored ? JSON.parse(stored) : [];
    }

    saveBookmarks() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks));
    }

    addBookmark(bookmarkData) {
        const bookmark = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...bookmarkData
        };
        
        this.bookmarks.unshift(bookmark);
        this.saveBookmarks();
        return bookmark;
    }

    removeBookmark(id) {
        this.bookmarks = this.bookmarks.filter(b => b.id !== id);
        this.saveBookmarks();
    }

    getBookmarks() {
        return this.bookmarks;
    }

    executeBookmarklet(bookmarkletUrl) {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            this.executeMobile(bookmarkletUrl);
        } else {
            this.executeDesktop(bookmarkletUrl);
        }
    }

    executeDesktop(bookmarkletUrl) {
        const bookmarkCode = decodeURIComponent(bookmarkletUrl.replace('javascript:', ''));
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
            newWindow.location.href = this.getSystemUrl(bookmarkletUrl);
            setTimeout(() => {
                newWindow.eval(bookmarkCode);
            }, 2000);
        }
    }

    executeMobile(bookmarkletUrl) {
        const bookmarkCode = decodeURIComponent(bookmarkletUrl.replace('javascript:', ''));
        
        navigator.clipboard.writeText(bookmarkCode).then(() => {
            alert('북마클릿 코드가 클립보드에 복사되었습니다.\n민원 사이트에서 개발자 콘솔에 붙여넣기하세요.');
            window.open(this.getSystemUrl(bookmarkletUrl), '_blank');
        });
    }

    getSystemUrl(bookmarkletUrl) {
        if (bookmarkletUrl.includes('SAFETY')) {
            return 'https://www.safetyreport.go.kr';
        } else if (bookmarkletUrl.includes('DDM')) {
            return 'https://www.ddm.go.kr/www/contents.do?key=735';
        } else if (bookmarkletUrl.includes('SAEOL')) {
            return 'https://eminwon.ddm.go.kr';
        }
        return '';
    }
}

const bookmarkManager = new BookmarkManager();
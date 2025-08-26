// IndexedDB를 활용한 스토리지 서비스
class StorageService {
    constructor() {
        this.dbName = 'SaeolComplaintDB';
        this.dbVersion = 1;
        this.db = null;
        this.initDB();
    }

    // IndexedDB 초기화
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = () => {
                console.error('IndexedDB 열기 실패:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('IndexedDB 연결 성공');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 사용자 정보 저장소
                if (!db.objectStoreNames.contains('userInfo')) {
                    db.createObjectStore('userInfo', { keyPath: 'id' });
                }

                // 템플릿 저장소
                if (!db.objectStoreNames.contains('templates')) {
                    const templateStore = db.createObjectStore('templates', { keyPath: 'id' });
                    templateStore.createIndex('name', 'name', { unique: false });
                    templateStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                // 이력 저장소
                if (!db.objectStoreNames.contains('history')) {
                    const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                    historyStore.createIndex('date', 'date', { unique: false });
                    historyStore.createIndex('status', 'status', { unique: false });
                }

                // 임시 저장 데이터
                if (!db.objectStoreNames.contains('drafts')) {
                    const draftStore = db.createObjectStore('drafts', { keyPath: 'id' });
                    draftStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                }
            };
        });
    }

    // 사용자 정보 저장
    async saveUserInfo(userInfo) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['userInfo'], 'readwrite');
            const store = transaction.objectStore('userInfo');

            // ID 추가 (항상 동일한 ID 사용)
            userInfo.id = 'default';
            userInfo.updatedAt = new Date().toISOString();

            const request = store.put(userInfo);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('사용자 정보 저장 실패:', error);
            // LocalStorage 폴백
            localStorage.setItem('saeol_user_info', JSON.stringify(userInfo));
        }
    }

    // 사용자 정보 불러오기
    async getUserInfo() {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['userInfo'], 'readonly');
            const store = transaction.objectStore('userInfo');
            const request = store.get('default');

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('사용자 정보 불러오기 실패:', error);
            // LocalStorage 폴백
            const savedInfo = localStorage.getItem('saeol_user_info');
            return savedInfo ? JSON.parse(savedInfo) : null;
        }
    }

    // 템플릿 저장
    async saveTemplate(template) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');

            const request = store.put(template);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('템플릿 저장 성공:', template.id);
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('템플릿 저장 실패:', error);
        }
    }

    // 모든 템플릿 불러오기
    async getTemplates() {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.getAll();

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('템플릿 불러오기 실패:', error);
            // LocalStorage 폴백
            const templates = localStorage.getItem('saeol_templates');
            return templates ? JSON.parse(templates) : [];
        }
    }

    // 특정 템플릿 불러오기
    async getTemplate(id) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['templates'], 'readonly');
            const store = transaction.objectStore('templates');
            const request = store.get(id);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('템플릿 불러오기 실패:', error);
            // LocalStorage 폴백
            const templates = JSON.parse(localStorage.getItem('saeol_templates') || '[]');
            return templates.find(t => t.id === id);
        }
    }

    // 템플릿 삭제
    async deleteTemplate(id) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['templates'], 'readwrite');
            const store = transaction.objectStore('templates');
            const request = store.delete(id);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('템플릿 삭제 실패:', error);
        }
    }

    // 이력 추가
    async addHistory(historyItem) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['history'], 'readwrite');
            const store = transaction.objectStore('history');

            historyItem.date = new Date().toISOString();

            const request = store.add(historyItem);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    // LocalStorage에도 저장 (빠른 접근용)
                    let history = JSON.parse(localStorage.getItem('saeol_history') || '[]');
                    history.unshift(historyItem);
                    history = history.slice(0, 100); // 최근 100개만 유지
                    localStorage.setItem('saeol_history', JSON.stringify(history));

                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('이력 추가 실패:', error);
        }
    }

    // 이력 불러오기
    async getHistory(limit = 50) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['history'], 'readonly');
            const store = transaction.objectStore('history');
            const index = store.index('date');

            const request = index.openCursor(null, 'prev');
            const results = [];

            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && results.length < limit) {
                        results.push(cursor.value);
                        cursor.continue();
                    } else {
                        resolve(results);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('이력 불러오기 실패:', error);
            // LocalStorage 폴백
            const history = localStorage.getItem('saeol_history');
            return history ? JSON.parse(history).slice(0, limit) : [];
        }
    }

    // 임시 저장
    async saveDraft(draft) {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['drafts'], 'readwrite');
            const store = transaction.objectStore('drafts');

            draft.id = 'current';
            draft.updatedAt = new Date().toISOString();

            const request = store.put(draft);

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    console.log('임시 저장 완료');
                    resolve(request.result);
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('임시 저장 실패:', error);
            // SessionStorage 폴백
            sessionStorage.setItem('saeol_draft', JSON.stringify(draft));
        }
    }

    // 임시 저장 불러오기
    async getDraft() {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['drafts'], 'readonly');
            const store = transaction.objectStore('drafts');
            const request = store.get('current');

            return new Promise((resolve, reject) => {
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('임시 저장 불러오기 실패:', error);
            // SessionStorage 폴백
            const draft = sessionStorage.getItem('saeol_draft');
            return draft ? JSON.parse(draft) : null;
        }
    }

    // 임시 저장 삭제
    async deleteDraft() {
        try {
            await this.ensureDB();
            const transaction = this.db.transaction(['drafts'], 'readwrite');
            const store = transaction.objectStore('drafts');
            const request = store.delete('current');

            return new Promise((resolve, reject) => {
                request.onsuccess = () => {
                    sessionStorage.removeItem('saeol_draft');
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('임시 저장 삭제 실패:', error);
            sessionStorage.removeItem('saeol_draft');
        }
    }

    // DB 연결 확인
    async ensureDB() {
        if (!this.db) {
            await this.initDB();
        }
    }

    // 전체 데이터 내보내기
    async exportAllData() {
        const data = {
            userInfo: await this.getUserInfo(),
            templates: await this.getTemplates(),
            history: await this.getHistory(1000),
            draft: await this.getDraft(),
            exportDate: new Date().toISOString()
        };

        return data;
    }

    // 데이터 가져오기
    async importData(data) {
        try {
            if (data.userInfo) {
                await this.saveUserInfo(data.userInfo);
            }

            if (data.templates) {
                for (const template of data.templates) {
                    await this.saveTemplate(template);
                }
            }

            if (data.history) {
                for (const item of data.history) {
                    await this.addHistory(item);
                }
            }

            if (data.draft) {
                await this.saveDraft(data.draft);
            }

            return true;
        } catch (error) {
            console.error('데이터 가져오기 실패:', error);
            return false;
        }
    }
}

// 전역 스토리지 서비스 인스턴스
const storageService = new StorageService();
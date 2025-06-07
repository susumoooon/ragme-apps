/**
 * RAGme ユーザー管理システム
 * セキュアなユーザー認証とデータ管理を提供
 */

class UserManager {
    constructor() {
        // ストレージキーの定義
        this.STORAGE_KEYS = {
            USERS: 'ragme:users',
            CURRENT_USER: 'ragme:current_user',
            SESSION: 'ragme:session'
        };

        // 現在のユーザー状態
        this.currentUser = null;
        
        // 初期化
        this.initialize();
    }

    /**
     * システムの初期化
     */
    initialize() {
        console.log('🚀 Initializing UserManager...');
        
        try {
            // ストレージの初期化確認
            this.initializeStorage();
            
            // セッションの復元
            this.restoreSession();
            
            console.log('✅ UserManager initialized successfully');
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.resetStorage();
        }
    }

    /**
     * ストレージの初期化
     */
    initializeStorage() {
        // ユーザーデータの確認と初期化
        if (!localStorage.getItem(this.STORAGE_KEYS.USERS)) {
            console.log('📝 Creating new users storage');
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify([]));
        }

        // 既存データの検証
        try {
            const users = this.getUsers();
            console.log(`📊 Found ${users.length} existing users`);
        } catch (error) {
            console.error('❌ Storage validation failed:', error);
            this.resetStorage();
        }
    }

    /**
     * ストレージのリセット
     */
    resetStorage() {
        console.log('🔄 Resetting storage...');
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify([]));
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        this.currentUser = null;
    }

    /**
     * セッションの復元
     */
    restoreSession() {
        try {
            const sessionData = localStorage.getItem(this.STORAGE_KEYS.SESSION);
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const user = this.getUserById(session.userId);
                if (user) {
                    this.currentUser = user;
                    console.log('🔄 Session restored for user:', user.username);
                    return true;
                }
            }
        } catch (error) {
            console.error('❌ Session restoration failed:', error);
        }
        
        this.clearSession();
        return false;
    }

    /**
     * セッションの作成
     */
    createSession(user) {
        const session = {
            userId: user.id,
            created: new Date().toISOString(),
            lastActive: new Date().toISOString()
        };
        
        localStorage.setItem(this.STORAGE_KEYS.SESSION, JSON.stringify(session));
        localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        sessionStorage.setItem('authenticated', 'true'); // セッションストレージにも保存
        this.currentUser = user;
        
        console.log('🔑 New session created for user:', user.username);
    }

    /**
     * セッションのクリア
     */
    clearSession() {
        localStorage.removeItem(this.STORAGE_KEYS.SESSION);
        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
        sessionStorage.removeItem('authenticated'); // セッションストレージからも削除
        this.currentUser = null;
    }

    /**
     * ユーザーの取得
     */
    getUsers() {
        try {
            const usersJson = localStorage.getItem(this.STORAGE_KEYS.USERS);
            return JSON.parse(usersJson || '[]');
        } catch (error) {
            console.error('❌ Error getting users:', error);
            return [];
        }
    }

    /**
     * IDによるユーザー取得
     */
    getUserById(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    }

    /**
     * ユーザーの保存
     */
    saveUsers(users) {
        try {
            localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(users));
            return true;
        } catch (error) {
            console.error('❌ Error saving users:', error);
            return false;
        }
    }

    /**
     * ログイン処理
     */
    login(username, password) {
        console.log('🔒 Login attempt for:', username);

        try {
            const users = this.getUsers();
            console.log('👥 Checking against', users.length, 'users');

            const user = users.find(u => {
                const usernameMatch = u.username.toLowerCase() === username.toLowerCase() ||
                                    u.email.toLowerCase() === username.toLowerCase();
                const passwordMatch = u.password === password;
                return usernameMatch && passwordMatch;
            });

            if (!user) {
                throw new Error('認証に失敗しました');
            }

            // セッションの作成
            this.createSession(user);
            
            // 最終ログイン時間の更新
            this.updateUserLastLogin(user.id);

            console.log('✅ Login successful for:', user.username);
            return user;

        } catch (error) {
            console.error('❌ Login failed:', error);
            this.clearSession();
            throw error;
        }
    }

    /**
     * ユーザー登録
     */
    registerUser(username, email, password) {
        console.log('📝 Registration attempt for:', username);

        try {
            const users = this.getUsers();

            // 既存ユーザーチェック
            if (users.some(u => 
                u.username.toLowerCase() === username.toLowerCase() || 
                u.email.toLowerCase() === email.toLowerCase()
            )) {
                throw new Error('ユーザー名またはメールアドレスが既に使用されています');
            }

            // 新規ユーザーの作成
            const newUser = {
                id: Date.now().toString(),
                username,
                email,
                password,
                createdAt: new Date().toISOString(),
                lastLogin: new Date().toISOString(),
                settings: {
                    theme: 'turquoise',
                    language: 'ja',
                    notifications: true,
                    autoSave: true
                }
            };

            // ユーザーの保存
            users.push(newUser);
            if (!this.saveUsers(users)) {
                throw new Error('ユーザー登録に失敗しました');
            }

            // セッションの作成
            this.createSession(newUser);

            console.log('✅ Registration successful for:', newUser.username);
            return newUser;

        } catch (error) {
            console.error('❌ Registration failed:', error);
            throw error;
        }
    }

    /**
     * ログアウト処理
     */
    logout() {
        const username = this.currentUser?.username;
        console.log('👋 Logout initiated for:', username);
        
        this.clearSession();
        console.log('✅ Logout successful');
    }

    /**
     * ログイン状態の確認
     */
    isLoggedIn() {
        // セッションストレージのチェックを追加
        const isAuthenticated = sessionStorage.getItem('authenticated') === 'true';
        if (isAuthenticated) {
            return true;
        }

        const hasCurrentUser = this.currentUser !== null;
        const hasSession = localStorage.getItem(this.STORAGE_KEYS.SESSION) !== null;
        
        console.log('🔍 Checking login status:', { hasCurrentUser, hasSession, isAuthenticated });
        
        // セッションが有効な場合はセッションストレージにも保存
        if (hasCurrentUser && hasSession) {
            sessionStorage.setItem('authenticated', 'true');
            return true;
        }

        return false;
    }

    /**
     * 現在のユーザーを取得
     */
    getCurrentUser() {
        if (this.currentUser) {
            return this.currentUser;
        }

        try {
            const savedUser = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                return this.currentUser;
            }
        } catch (error) {
            console.error('❌ Error getting current user:', error);
            this.clearSession(); // エラー時はセッションをクリア
        }

        return null;
    }

    /**
     * ユーザーの最終ログイン時間を更新
     */
    updateUserLastLogin(userId) {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                users[userIndex].lastLogin = new Date().toISOString();
                this.saveUsers(users);
            }
        } catch (error) {
            console.error('❌ Error updating last login:', error);
        }
    }

    /**
     * デバッグ情報の取得
     */
    getDebugInfo() {
        return {
            currentUser: this.currentUser,
            sessionData: localStorage.getItem(this.STORAGE_KEYS.SESSION),
            allUsers: this.getUsers(),
            storageKeys: this.STORAGE_KEYS
        };
    }
}

// グローバルインスタンスの作成
window.userManager = new UserManager();

// 認証チェック用ヘルパー関数
window.checkAuth = async function() {
    console.log('🔒 Checking authentication...');
    const isAuthenticated = window.userManager.isLoggedIn();
    
    if (!isAuthenticated) {
        console.log('❌ Not authenticated');
        if (!window.location.pathname.includes('index.html') && 
            !window.location.pathname.endsWith('/')) {
            window.location.href = 'index.html';
            return false;
        }
    } else {
        console.log('✅ User is authenticated');
    }
    return true;
};

// ユーザー情報表示用ヘルパー関数
window.displayUserInfo = function(element) {
    const user = window.userManager.getCurrentUser();
    if (user && element) {
        element.textContent = user.username;
    }
};

// ログアウト用ヘルパー関数
window.logoutUser = function() {
    window.userManager.logout();
    window.location.href = 'index.html';
};

console.log('🔐 UserManager module loaded');

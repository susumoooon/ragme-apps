// RAGmeのナビゲーション管理（AI分析ページ対応版）
const Navigation = {
    // 認証チェック
    checkAuth() {
        const isAuthenticated = 
            sessionStorage.getItem('authenticated') === 'true' ||
            localStorage.getItem('authenticated') === 'true';

        if (!isAuthenticated) {
            console.log('🔒 認証されていません');
            // ログインページ以外の場合のみリダイレクト
            if (!this.isLoginPage()) {
                window.location.href = 'index.html';
                return false;
            }
        }
        return true;
    },

    // ログインページかどうかの判定
    isLoginPage() {
        const path = window.location.pathname.toLowerCase();
        return path.endsWith('index.html') || path.endsWith('/') || path === '';
    },

    // 現在のページを取得
    getCurrentPage() {
        const path = window.location.pathname.toLowerCase();
        if (path.endsWith('memory.html')) return 'memory';
        if (path.endsWith('analysis.html')) return 'analysis';  // 新規追加
        if (path.endsWith('settings.html')) return 'settings';
        return 'home';
    },

    // 現在のページかどうかをチェック
    isCurrentPage(targetPage) {
        const currentPage = this.getCurrentPage();
        return currentPage === targetPage;
    },

    // ページ遷移
    navigateToPage(page) {
        console.log(`📱 ${page}ページへ移動します`);
        
        // 現在のページと同じ場合は何もしない
        if (this.isCurrentPage(page)) {
            console.log('📍 同じページなのでキャンセルします');
            return;
        }

        // 認証状態を確認
        if (!this.checkAuth()) {
            return;
        }

        // 遷移先URLを決定
        let targetUrl;
        switch (page) {
            case 'home':
                targetUrl = 'index.html';
                break;
            case 'memory':
                targetUrl = 'memory.html';
                break;
            case 'analysis':  // 新規追加
                targetUrl = 'analysis.html';
                break;
            case 'settings':
                targetUrl = 'settings.html';
                break;
            default:
                console.error('❌ 無効なページ指定:', page);
                targetUrl = 'index.html';
        }

        // ページ遷移エフェクト
        this.startTransition(() => {
            window.location.href = targetUrl;
        });
    },

    // トランジション開始
    startTransition(callback) {
        const transition = document.getElementById('pageTransition');
        if (transition) {
            transition.classList.add('active');
            setTimeout(callback, 300);
        } else {
            callback();
        }
    },

    // ナビゲーションの初期化
    init() {
        console.log('🔄 ナビゲーションの初期化を開始');

        // 認証チェック（ログインページ以外）
        if (!this.isLoginPage() && !this.checkAuth()) {
            return;
        }

        // 既存のナビゲーションイベントリスナーをクリア
        this.clearExistingListeners();

        // ナビゲーションリンクの設定
        this.setupNavigationLinks();

        // アクティブ状態の更新
        this.updateActiveState();

        console.log('✅ ナビゲーションの初期化完了');
    },

    // 既存のイベントリスナーをクリア
    clearExistingListeners() {
        const navLinks = document.querySelectorAll('.nav-link, .nav-brand');
        navLinks.forEach(link => {
            // クローンして既存のイベントリスナーを削除
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
        });
    },

    // ナビゲーションリンクの設定
    setupNavigationLinks() {
        const navLinks = document.querySelectorAll('.nav-link, .nav-brand');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // data-page属性またはhref属性からページを取得
                const page = link.getAttribute('data-page') || this.getPageFromHref(link.getAttribute('href'));
                
                if (!page) {
                    console.error('❌ ページ情報を取得できません:', link);
                    return;
                }

                console.log('🔗 ナビゲーションクリック:', page);
                
                // アクティブ状態を即座に更新
                this.setActiveLink(link);
                
                // ページ遷移
                this.navigateToPage(page);
            });
        });
    },

    // href属性からページを判定
    getPageFromHref(href) {
        if (!href) return null;
        
        if (href.includes('index.html') || href === './') return 'home';
        if (href.includes('memory.html')) return 'memory';
        if (href.includes('analysis.html')) return 'analysis';  // 新規追加
        if (href.includes('settings.html')) return 'settings';
        
        return null;
    },

    // アクティブリンクの設定
    setActiveLink(activeLink) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        
        if (activeLink && activeLink.classList.contains('nav-link')) {
            activeLink.classList.add('active');
        }
    },

    // アクティブ状態の更新
    updateActiveState() {
        const currentPage = this.getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page') || this.getPageFromHref(link.getAttribute('href'));
            
            if (linkPage === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    },

    // ユーザー情報の表示
    displayUserInfo() {
        const user = window.userManager && window.userManager.getCurrentUser();
        const username = user ? user.username : localStorage.getItem('username');
        
        if (username) {
            const usernameDisplays = document.querySelectorAll('.username-display, #usernameDisplay');
            usernameDisplays.forEach(element => {
                element.textContent = username;
            });
        }
    }
};

// ログアウト用グローバル関数
window.logoutUser = function() {
    console.log('🔒 ログアウト実行');
    if (window.userManager) {
        window.userManager.logout();
    }
    sessionStorage.clear();
    localStorage.removeItem('authenticated');
    localStorage.removeItem('username');
    window.location.href = 'index.html';
};

// DOMロード時に初期化（一度だけ実行されるように）
if (!window.navigationInitialized) {
    const initializeNavigation = () => {
        if (typeof window.userManager !== 'undefined') {
            Navigation.init();
            Navigation.displayUserInfo();
            console.log('✅ Navigation initialized with UserManager');
        } else {
            console.log('⏳ Waiting for UserManager...');
            setTimeout(initializeNavigation, 100);
        }
    };

    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔄 Starting navigation initialization...');
        initializeNavigation();
    });
    
    window.navigationInitialized = true;
}

// グローバルに公開
window.Navigation = Navigation;

console.log('🔐 Navigation module loaded (with AI Analysis support)');
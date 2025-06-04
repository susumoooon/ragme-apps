// データ削除スクリプト
const ClearDataManager = {
    clearAllData: function() {
        console.log('🗑️ データ削除を開始します...');

        try {
            // StorageManagerを使用してデータを削除
            if (typeof StorageManager !== 'undefined') {
                StorageManager.clearAll();
            }
            
            // 認証関連のデータを削除
            sessionStorage.removeItem('authenticated');
            sessionStorage.removeItem('username');
            
            console.log('✅ すべてのデータを削除しました');
            
            return true;
        } catch (error) {
            console.error('❌ データ削除中にエラーが発生しました:', error);
            return false;
        }
    }
};

// グローバルスコープで利用可能にする
window.ClearDataManager = ClearDataManager; 
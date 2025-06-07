// RAGmeのストレージマネージャー
const StorageManager = {
    STORAGE_KEY: 'ragme_memories',

    // メモリーデータの取得
    getMemories() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ データ取得エラー:', error);
            return [];
        }
    },

    // メモリーの保存
    saveMemory(memory) {
        try {
            const memories = this.getMemories();
            const newMemory = {
                id: `mem_${Date.now()}`,
                timestamp: new Date().toISOString(),
                ...memory
            };
            memories.unshift(newMemory);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(memories));
            return newMemory;
        } catch (error) {
            console.error('❌ データ保存エラー:', error);
            throw error;
        }
    },

    // 音声入力の保存
    saveVoiceInput(text) {
        return this.saveMemory({
            type: 'voice-transcription',
            content: text,
            title: `音声入力 - ${new Date().toLocaleString('ja-JP')}`
        });
    },

    // テキスト入力の保存
    saveTextInput(text) {
        return this.saveMemory({
            type: 'text-input',
            content: text,
            title: `テキスト入力 - ${new Date().toLocaleString('ja-JP')}`
        });
    },

    // すべてのデータを削除
    clearAll() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            return true;
        } catch (error) {
            console.error('❌ データ削除エラー:', error);
            return false;
        }
    }
};

// グローバルに利用可能にする
window.StorageManager = StorageManager; 

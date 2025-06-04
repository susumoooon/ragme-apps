/**
 * ===== 📝 TRANSCRIPTION MODULE =====
 * 音声テキスト化処理システム
 */

'use strict';

// ===== テキスト化状態管理 =====
let currentTranscriptionData = null;
let isEditMode = false;
let transcriptionHistory = [];

// ===== テキスト化アクション初期化 =====
function initializeTranscriptionActions() {
    console.log('📝 Initializing transcription actions...');
    
    try {
        // アクションボタンの取得
        const confirmBtn = document.getElementById('confirmTranscription');
        const editBtn = document.getElementById('editTranscription');
        const deleteBtn = document.getElementById('deleteTranscription');
        
        // イベントリスナーの設定
        if (confirmBtn) {
            confirmBtn.addEventListener('click', confirmTranscription);
        }
        if (editBtn) {
            editBtn.addEventListener('click', editTranscription);
        }
        if (deleteBtn) {
            deleteBtn.addEventListener('click', deleteTranscription);
        }
        
        // 編集エリアのイベント
        const editArea = document.getElementById('transcriptionEdit');
        if (editArea) {
            editArea.addEventListener('keydown', handleEditKeydown);
            editArea.addEventListener('input', handleEditInput);
        }
        
        console.log('✅ Transcription actions initialized');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to initialize transcription actions:', error);
        return false;
    }
}

// ===== テキスト化確定処理 =====
function confirmTranscription() {
    const transcriptText = getFinalTranscript().trim();
    if (!transcriptText) {
        showToast('⚠️ 保存するテキストがありません', 'warning');
        return;
    }

    const memoryData = {
        id: generateId(),
        type: 'voice-transcription',
        content: transcriptText,
        timestamp: new Date().toISOString(),
        title: '音声入力 - ' + new Date().toLocaleString('ja-JP')
    };

    try {
        // メモリーの保存
        const memories = window.userManager.getUserData('memories') || [];
        memories.unshift(memoryData);
        window.userManager.saveUserData('memories', memories);

        // UI状態のリセット
        resetTranscriptionState();
        showToast('💾 音声入力をメモリーに保存しました', 'success');
    } catch (error) {
        console.error('Save error:', error);
        showToast('❌ 保存中にエラーが発生しました', 'error');
    }
}

// ===== テキスト化エントリの作成 =====
function createTranscriptionEntry(content) {
    const entry = {
        id: generateId(),
        type: 'voice',
        content: content,
        timestamp: new Date().toISOString(),
        title: '音声入力 - ' + new Date().toLocaleString('ja-JP'),
        source: 'speech-recognition',
        wordCount: content.split(/\s+/).length,
        characterCount: content.length,
        language: 'ja-JP'
    };
    
    console.log('📝 Transcription entry created:', entry);
    return entry;
}

// ===== テキスト化エントリの保存 =====
function saveTranscriptionEntry(entry) {
    try {
        const storageKey = `ragme_voice_${entry.id}`;
        const success = saveToSessionStorage(storageKey, entry);
        
        if (success) {
            console.log('💾 Transcription saved to storage:', storageKey);
            return true;
        } else {
            console.error('❌ Failed to save transcription');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error saving transcription:', error);
        return false;
    }
}

// ===== テキスト化編集処理 =====
function editTranscription() {
    console.log('✏️ Editing transcription...');
    
    try {
        const transcriptText = getFinalTranscript().trim();
        const transcriptionDisplay = document.getElementById('transcriptionDisplay');
        const transcriptionActions = document.getElementById('transcriptionActions');
        let editArea = document.getElementById('transcriptionEdit');
        
        // 編集エリアがない場合は作成
        if (!editArea) {
            editArea = document.createElement('textarea');
            editArea.id = 'transcriptionEdit';
            editArea.className = 'transcription-edit';
            transcriptionDisplay.parentNode.insertBefore(editArea, transcriptionDisplay);
            
            // イベントリスナーを追加
            editArea.addEventListener('keydown', handleEditKeydown);
            editArea.addEventListener('input', handleEditInput);
        }
        
        // テキストを設定
        editArea.value = transcriptText;
        
        // 表示を切り替え
        transcriptionDisplay.classList.remove('show');
        transcriptionDisplay.classList.add('hide');
        editArea.classList.remove('hide');
        editArea.classList.add('show');
        
        // 編集モードフラグを設定
        isEditMode = true;
        
        // アクションボタンの状態を更新
        if (transcriptionActions) {
            transcriptionActions.classList.add('editing');
        }
        
        // フォーカスを設定
        editArea.focus();
        
        showToast('✏️ テキストを編集してください', 'info');
        return true;
        
    } catch (error) {
        console.error('❌ Error starting edit mode:', error);
        showToast('❌ 編集モードの開始に失敗しました', 'error');
        return false;
    }
}

// ===== テキスト化削除処理 =====
function deleteTranscription() {
    if (confirm('認識されたテキストを削除してもよろしいですか？')) {
        resetTranscriptionState();
        showToast('🗑️ 音声認識結果を削除しました', 'info');
    }
}

// ===== テキスト化UIリセット =====
function resetTranscriptionState() {
    const transcriptionDisplay = document.getElementById('transcriptionDisplay');
    const transcriptionActions = document.getElementById('transcriptionActions');
    const editArea = document.getElementById('transcriptionEdit');

    if (transcriptionDisplay) {
        transcriptionDisplay.style.display = 'none';
        transcriptionDisplay.textContent = '';
    }

    if (transcriptionActions) {
        transcriptionActions.classList.remove('show');
    }

    if (editArea) {
        editArea.remove();
    }

    clearFinalTranscript();
}

// ===== メッセージ表示 =====
function displayTranscriptionMessage(entry) {
    try {
        const container = document.getElementById('voiceChatMessages');
        if (!container) {
            console.warn('⚠️ Voice chat container not found');
            return;
        }
        
        // メッセージ要素を作成
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.dataset.entryId = entry.id;
        
        // メッセージ内容を設定
        messageDiv.innerHTML = `
            <div style="margin-bottom: 0.5rem;">
                <i class="fas fa-microphone"></i> 
                音声入力（メモリーに保存済み）
                <span style="font-size: 0.8rem; opacity: 0.7; margin-left: 0.5rem;">
                    ${entry.characterCount}文字
                </span>
            </div>
            <div style="font-size: 0.9rem; line-height: 1.4;">
                ${escapeHtml(entry.content)}
            </div>
            <div style="font-size: 0.7rem; opacity: 0.6; margin-top: 0.5rem;">
                ${formatDate(entry.timestamp)}
            </div>
        `;
        
        // コンテナに追加
        container.appendChild(messageDiv);
        
        // スクロールを最下部に移動
        container.scrollTop = container.scrollHeight;
        
        console.log('💬 Transcription message displayed');
        
    } catch (error) {
        console.error('❌ Error displaying transcription message:', error);
    }
}

// ===== 編集エリアのキーイベント処理 =====
function handleEditKeydown(event) {
    // Ctrl+Enter で保存
    if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        confirmTranscription();
        return;
    }
    
    // Escape で編集キャンセル
    if (event.key === 'Escape') {
        event.preventDefault();
        cancelEdit();
        return;
    }
}

// ===== 編集入力処理 =====
function handleEditInput(event) {
    const editArea = event.target;
    const content = editArea.value;
    
    // リアルタイムで文字数を更新
    updateEditWordCount(content);
    
    // 変更イベントを発火
    dispatchTranscriptionEvent('editChanged', {
        content: content,
        length: content.length
    });
}

// ===== 編集キャンセル =====
function cancelEdit() {
    console.log('✖️ Cancelling edit...');
    
    try {
        const editArea = document.getElementById('transcriptionEdit');
        const transcriptionDisplay = document.getElementById('transcriptionDisplay');
        const transcriptionActions = document.getElementById('transcriptionActions');
        
        if (!editArea || !transcriptionDisplay) {
            console.error('❌ Edit elements not found');
            return false;
        }
        
        // 表示を切り替え
        transcriptionDisplay.classList.remove('hide');
        transcriptionDisplay.classList.add('show');
        editArea.classList.remove('show');
        editArea.classList.add('hide');
        
        // 編集モードフラグを解除
        isEditMode = false;
        
        // アクションボタンの状態を更新
        if (transcriptionActions) {
            transcriptionActions.classList.remove('editing');
        }
        
        showToast('✖️ 編集をキャンセルしました', 'info');
        return true;
        
    } catch (error) {
        console.error('❌ Error cancelling edit:', error);
        return false;
    }
}

// ===== 文字数更新 =====
function updateEditWordCount(content) {
    const characterCount = content.length;
    const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // 文字数表示を更新（要素があれば）
    const countElement = document.getElementById('editWordCount');
    if (countElement) {
        countElement.textContent = `${characterCount}文字 / ${wordCount}語`;
    }
    
    // 長すぎる場合の警告
    if (characterCount > 10000) {
        showToast('⚠️ テキストが長すぎます（10,000文字以下推奨）', 'warning');
    }
}

// ===== 履歴管理 =====
function addToTranscriptionHistory(entry) {
    try {
        transcriptionHistory.unshift(entry);
        
        // 履歴の上限管理（最新100件）
        if (transcriptionHistory.length > 100) {
            transcriptionHistory = transcriptionHistory.slice(0, 100);
        }
        
        console.log('📚 Added to transcription history, total:', transcriptionHistory.length);
        
    } catch (error) {
        console.error('❌ Error adding to history:', error);
    }
}

function getTranscriptionHistory() {
    return [...transcriptionHistory];
}

function clearTranscriptionHistory() {
    transcriptionHistory = [];
    console.log('🗑️ Transcription history cleared');
}

// ===== 統計情報 =====
function getTranscriptionStats() {
    try {
        const totalEntries = transcriptionHistory.length;
        const totalCharacters = transcriptionHistory.reduce((sum, entry) => sum + (entry.characterCount || 0), 0);
        const totalWords = transcriptionHistory.reduce((sum, entry) => sum + (entry.wordCount || 0), 0);
        
        const avgCharactersPerEntry = totalEntries > 0 ? Math.round(totalCharacters / totalEntries) : 0;
        const avgWordsPerEntry = totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0;
        
        return {
            totalEntries,
            totalCharacters,
            totalWords,
            avgCharactersPerEntry,
            avgWordsPerEntry,
            lastEntry: transcriptionHistory[0] || null
        };
        
    } catch (error) {
        console.error('❌ Error getting transcription stats:', error);
        return null;
    }
}

// ===== テキスト化品質向上 =====
function enhanceTranscription(text) {
    try {
        if (!text || typeof text !== 'string') return text;
        
        let enhanced = text;
        
        // 基本的なクリーンアップ
        enhanced = enhanced.trim();
        
        // 連続する空白を1つに
        enhanced = enhanced.replace(/\s+/g, ' ');
        
        // 日本語特有の処理
        enhanced = enhanced.replace(/。\s+/g, '。');
        enhanced = enhanced.replace(/、\s+/g, '、');
        
        // 英数字周りのスペース調整
        enhanced = enhanced.replace(/([a-zA-Z0-9])\s+([。、！？])/g, '$1$2');
        
        console.log('✨ Transcription enhanced');
        return enhanced;
        
    } catch (error) {
        console.error('❌ Error enhancing transcription:', error);
        return text;
    }
}

// ===== エクスポート機能 =====
function exportTranscription(entry, format = 'txt') {
    try {
        if (!entry) {
            console.error('❌ No entry to export');
            return false;
        }
        
        let content = '';
        let filename = '';
        let mimeType = '';
        
        switch (format) {
            case 'txt':
                content = entry.content;
                filename = `transcription-${entry.id}.txt`;
                mimeType = 'text/plain';
                break;
                
            case 'json':
                content = JSON.stringify(entry, null, 2);
                filename = `transcription-${entry.id}.json`;
                mimeType = 'application/json';
                break;
                
            case 'md':
                content = `# 音声入力テキスト\n\n**日時**: ${formatDate(entry.timestamp)}\n**文字数**: ${entry.characterCount}文字\n\n---\n\n${entry.content}`;
                filename = `transcription-${entry.id}.md`;
                mimeType = 'text/markdown';
                break;
                
            default:
                console.error('❌ Unsupported export format:', format);
                return false;
        }
        
        // ダウンロード実行
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        
        // メモリリークを防ぐ
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        console.log('📤 Transcription exported:', filename);
        showToast(`📤 ${filename} をエクスポートしました`, 'success');
        
        return true;
        
    } catch (error) {
        console.error('❌ Error exporting transcription:', error);
        showToast('❌ エクスポートに失敗しました', 'error');
        return false;
    }
}

// ===== イベント発火 =====
function dispatchTranscriptionEvent(type, data = {}) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(`ragme:transcription${capitalizeFirst(type)}`, {
            detail: { 
                ...data, 
                isEditMode,
                timestamp: new Date().toISOString() 
            }
        }));
    }
}

// ===== モジュール初期化ログ =====
console.log('✅ Transcription module loaded');

// ===== グローバル公開 =====
if (typeof window !== 'undefined') {
    window.RAGmeTranscription = {
        initializeTranscriptionActions,
        confirmTranscription,
        editTranscription,
        deleteTranscription,
        resetTranscriptionState,
        cancelEdit,
        getTranscriptionHistory,
        clearTranscriptionHistory,
        getTranscriptionStats,
        enhanceTranscription,
        exportTranscription
    };
}

// ===== ユーティリティ関数 =====
function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
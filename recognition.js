/**
 * ===== 🎤 SPEECH RECOGNITION MODULE =====
 * 音声認識システム
 */

'use strict';

// ===== 音声認識の状態管理 =====
let recognition = null;
let currentTranscription = '';
let finalTranscript = '';
let isTranscribing = false;
let recognitionConfig = {
    language: 'ja-JP',
    continuous: true,
    interimResults: true,
    maxAlternatives: 1
};

// ===== 音声認識の初期化 =====
function initializeSpeechRecognition() {
    console.log('🎤 Initializing speech recognition...');
    
    // Check for Web Speech API support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.warn('⚠️ Web Speech API not supported');
        showToast('⚠️ このブラウザでは音声認識がサポートされていません', 'warning');
        return false;
    }
    
    try {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure recognition settings
        recognition.lang = 'ja-JP';
        recognition.continuous = true;
        recognition.interimResults = true;
        
        // Set up event handlers
        recognition.onstart = handleRecognitionStart;
        recognition.onresult = handleRecognitionResult;
        recognition.onerror = handleRecognitionError;
        recognition.onend = handleRecognitionEnd;
        
        console.log('✅ Speech recognition initialized');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to initialize speech recognition:', error);
        showToast('❌ 音声認識の初期化に失敗しました', 'error');
        return false;
    }
}

// ===== 音声認識の設定 =====
function configureSpeechRecognition() {
    if (!recognition) return;
    
    recognition.lang = recognitionConfig.language;
    recognition.continuous = recognitionConfig.continuous;
    recognition.interimResults = recognitionConfig.interimResults;
    recognition.maxAlternatives = recognitionConfig.maxAlternatives;
    
    console.log('🔧 Speech recognition configured:', recognitionConfig);
}

// ===== イベントハンドラーの設定 =====
function setupRecognitionEventHandlers() {
    if (!recognition) return;
    
    recognition.onstart = handleRecognitionStart;
    recognition.onresult = handleRecognitionResult;
    recognition.onerror = handleRecognitionError;
    recognition.onend = handleRecognitionEnd;
    recognition.onnomatch = handleRecognitionNoMatch;
    recognition.onsoundstart = handleSoundStart;
    recognition.onsoundend = handleSoundEnd;
    recognition.onspeechstart = handleSpeechStart;
    recognition.onspeechend = handleSpeechEnd;
}

// ===== 音声認識開始ハンドラー =====
function handleRecognitionStart() {
    console.log('🎤 Recognition started');
    updateTranscriptionStatus('認識中...');
    showTranscriptionDisplay();
}

// ===== 音声認識結果ハンドラー =====
function handleRecognitionResult(event) {
    let interimTranscript = '';
    
    for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
            finalTranscript += transcript + '\n';
        } else {
            interimTranscript += transcript;
        }
    }
    
    updateTranscriptionDisplay(finalTranscript, interimTranscript);
    
    if (finalTranscript.trim()) {
        showTranscriptionActions();
    }
}

// ===== 音声認識エラーハンドラー =====
function handleRecognitionError(event) {
    console.error('❌ Recognition error:', event.error);
    let errorMessage = '音声認識でエラーが発生しました';
    
    switch (event.error) {
        case 'no-speech':
            errorMessage = '音声が検出されませんでした';
            break;
        case 'audio-capture':
            errorMessage = 'マイクが見つかりません';
            break;
        case 'not-allowed':
            errorMessage = 'マイクの使用が許可されていません';
            break;
        case 'network':
            errorMessage = 'ネットワークエラーが発生しました';
            break;
        case 'aborted':
            errorMessage = '音声認識が中断されました';
            break;
    }
    
    showToast(`❌ ${errorMessage}`, 'error');
    stopRecording();
}

// ===== 音声認識終了ハンドラー =====
function handleRecognitionEnd() {
    console.log('🎤 Recognition ended');
    updateTranscriptionStatus('認識終了');
}

// ===== その他のイベントハンドラー =====
function handleRecognitionNoMatch() {
    console.log('�� No match found');
    updateTranscriptionStatus('音声を認識できませんでした');
}

function handleSoundStart() {
    console.log('🔊 Sound detected');
}

function handleSoundEnd() {
    console.log('🔇 Sound ended');
}

function handleSpeechStart() {
    console.log('🗣️ Speech detected');
    updateTranscriptionStatus('音声を検出しました...');
}

function handleSpeechEnd() {
    console.log('🤐 Speech ended');
}

// ===== 音声認識の開始 =====
function startRecognition() {
    try {
        recognition.start();
        console.log('🎤 Recognition started');
    } catch (error) {
        console.error('❌ Failed to start recognition:', error);
        showToast('❌ 音声認識の開始に失敗しました', 'error');
    }
}

// ===== 音声認識の停止 =====
function stopRecognition() {
    try {
        recognition.stop();
        console.log('🎤 Recognition stopped');
    } catch (error) {
        console.error('❌ Failed to stop recognition:', error);
    }
}

// ===== 音声認識の強制終了 =====
function abortSpeechRecognition() {
    if (recognition) {
        try {
            recognition.abort();
            isTranscribing = false;
            resetRecognitionState();
            hideTranscriptionDisplay();
            console.log('🛑 Speech recognition aborted');
        } catch (error) {
            console.error('❌ Error aborting speech recognition:', error);
        }
    }
}

// ===== 状態のリセット =====
function resetRecognitionState() {
    finalTranscript = '';
    recognition.stop();
    console.log('🔄 Recognition state reset');
}

// ===== UI更新関数 =====
function updateTranscriptionStatus(status) {
    const statusElement = document.getElementById('transcriptionStatus');
    if (statusElement) {
        statusElement.textContent = status;
    }
}

function updateTranscriptionDisplay(finalText, interimText) {
    const displayElement = document.getElementById('transcriptionText');
    if (displayElement) {
        displayElement.innerHTML = 
            escapeHtml(finalText) + 
            '<span class="interim">' + escapeHtml(interimText) + '</span>';
    }
}

function showTranscriptionDisplay() {
    const displayElement = document.getElementById('transcriptionDisplay');
    if (displayElement) {
        displayElement.classList.add('show');
    }
}

function hideTranscriptionDisplay() {
    const displayElement = document.getElementById('transcriptionDisplay');
    const actionsElement = document.getElementById('transcriptionActions');
    const editElement = document.getElementById('transcriptionEdit');
    
    if (displayElement) {
        displayElement.classList.remove('show');
    }
    if (actionsElement) {
        actionsElement.classList.remove('show');
    }
    if (editElement) {
        editElement.classList.remove('show');
    }
}

function clearTranscriptionDisplay() {
    const displayElement = document.getElementById('transcriptionText');
    if (displayElement) {
        displayElement.textContent = '';
    }
}

function showTranscriptionActions() {
    const actionsElement = document.getElementById('transcriptionActions');
    if (actionsElement) {
        actionsElement.classList.add('show');
    }
}

// ===== イベント発火 =====
function dispatchRecognitionEvent(type, data = {}) {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(`ragme:recognition${capitalizeFirst(type)}`, {
            detail: { ...data, timestamp: new Date().toISOString() }
        }));
    }
}

// ===== 設定の更新 =====
function updateRecognitionConfig(newConfig) {
    recognitionConfig = { ...recognitionConfig, ...newConfig };
    
    if (recognition) {
        configureSpeechRecognition();
    }
    
    console.log('🔧 Recognition config updated:', recognitionConfig);
}

// ===== 認識言語の変更 =====
function setRecognitionLanguage(language) {
    updateRecognitionConfig({ language });
}

// ===== 状態取得関数 =====
function getRecognitionState() {
    return {
        isTranscribing,
        finalTranscript,
        currentTranscription,
        config: { ...recognitionConfig },
        isSupported: !!recognition
    };
}

function getFinalTranscript() {
    return finalTranscript;
}

function getCurrentTranscription() {
    return currentTranscription;
}

function isRecognitionActive() {
    return isTranscribing;
}

// ===== ブラウザサポート確認 =====
function isSpeechRecognitionSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
}

// ===== 音声認識の品質向上 =====
function optimizeRecognition() {
    if (!recognition) return;
    
    // 最適化された設定を適用
    updateRecognitionConfig({
        language: 'ja-JP',
        continuous: true,
        interimResults: true,
        maxAlternatives: 3 // 複数の候補を取得
    });
    
    console.log('⚡ Recognition optimized');
}

// ===== デバッグ用関数 =====
function debugRecognition() {
    console.log('🐛 Recognition Debug Info:', {
        isSupported: isSpeechRecognitionSupported(),
        state: getRecognitionState(),
        recognition: recognition,
        config: recognitionConfig
    });
}

// ===== モジュール初期化ログ =====
console.log('✅ Speech Recognition module loaded');

// ===== グローバル公開 =====
if (typeof window !== 'undefined') {
    window.RAGmeRecognition = {
        initializeSpeechRecognition,
        startRecognition,
        stopRecognition,
        abortSpeechRecognition,
        resetRecognitionState,
        updateRecognitionConfig,
        setRecognitionLanguage,
        getRecognitionState,
        getFinalTranscript,
        getCurrentTranscription,
        isRecognitionActive,
        isSpeechRecognitionSupported,
        optimizeRecognition,
        debugRecognition,
        showTranscriptionDisplay,
        hideTranscriptionDisplay,
        showTranscriptionActions
    };
}

// ===== ユーティリティ関数 =====
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
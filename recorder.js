/**
 * ===== 🎙️ RECORDER MODULE =====
 * 音声録音管理システム
 */

'use strict';

// ===== 録音状態管理 =====
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];

// ===== 録音の開始 =====
function startRecording() {
    console.log('🎙️ Starting recording...');
    
    if (isRecording) {
        console.warn('⚠️ Already recording');
        return;
    }
    
    try {
        // UI更新
        updateRecordingUI(true);
        
        // 音声認識開始
        if (window.RAGmeRecognition) {
            window.RAGmeRecognition.startRecognition();
        }
        
        isRecording = true;
        console.log('✅ Recording started');
        
    } catch (error) {
        console.error('❌ Failed to start recording:', error);
        showToast('❌ 録音の開始に失敗しました', 'error');
        updateRecordingUI(false);
    }
}

// ===== 録音の停止 =====
function stopRecording() {
    console.log('🎙️ Stopping recording...');
    
    if (!isRecording) {
        console.warn('⚠️ Not recording');
        return;
    }
    
    try {
        // 音声認識停止
        if (window.RAGmeRecognition) {
            window.RAGmeRecognition.stopRecognition();
        }
        
        // UI更新
        updateRecordingUI(false);
        
        isRecording = false;
        console.log('✅ Recording stopped');
        
    } catch (error) {
        console.error('❌ Failed to stop recording:', error);
        showToast('❌ 録音の停止に失敗しました', 'error');
    }
}

// ===== UI更新 =====
function updateRecordingUI(recording) {
    const voiceButton = document.getElementById('voiceButton');
    const voiceIcon = document.getElementById('voiceIcon');
    const voiceStatus = document.getElementById('voiceStatus');
    
    if (voiceButton) {
        if (recording) {
            voiceButton.classList.add('recording');
            if (voiceIcon) voiceIcon.className = 'fas fa-stop';
            if (voiceStatus) voiceStatus.textContent = '録音中... クリックで停止';
        } else {
            voiceButton.classList.remove('recording');
            if (voiceIcon) voiceIcon.className = 'fas fa-microphone';
            if (voiceStatus) voiceStatus.textContent = 'マイクボタンをクリックして録音開始';
        }
    }
}

// ===== 状態取得 =====
function isRecordingActive() {
    return isRecording;
}

// ===== モジュール初期化ログ =====
console.log('✅ Recorder module loaded');

// ===== グローバル公開 =====
if (typeof window !== 'undefined') {
    window.RAGmeRecorder = {
        startRecording,
        stopRecording,
        isRecording: isRecordingActive,
        updateRecordingUI
    };
}
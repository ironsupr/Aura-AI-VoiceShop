import React, { useState } from 'react';
import { X, Settings, Volume2, Mic, BarChart4, Clock } from 'lucide-react';

interface VoiceAccessibilitySettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const VoiceAccessibilitySettings: React.FC<VoiceAccessibilitySettingsProps> = ({
  isOpen,
  onClose
}) => {
  const [settings, setSettings] = useState({
    responseSpeed: 1, // 0.8 to 1.5
    responseVolume: 80, // 0 to 100
    recognitionSensitivity: 60, // 0 to 100
    listeningTimeout: 10, // 5 to 30 seconds
    showVisualIndicators: true,
    playAudioCues: true,
  });
  
  const updateSetting = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Save to localStorage
    localStorage.setItem('voiceAccessibilitySettings', JSON.stringify({
      ...settings,
      [key]: value
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Voice Accessibility</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 max-h-[70vh] overflow-auto">
          {/* Speech Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Volume2 className="w-4 h-4 text-blue-500" />
                <span>Speech Rate</span>
              </label>
              <span className="text-xs font-medium text-gray-500">
                {settings.responseSpeed.toFixed(1)}x
              </span>
            </div>
            <input 
              type="range" 
              min="0.8" 
              max="1.5" 
              step="0.1"
              value={settings.responseSpeed}
              onChange={(e) => updateSetting('responseSpeed', parseFloat(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Slower</span>
              <span>Faster</span>
            </div>
          </div>
          
          {/* Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Volume2 className="w-4 h-4 text-blue-500" />
                <span>Response Volume</span>
              </label>
              <span className="text-xs font-medium text-gray-500">
                {settings.responseVolume}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.responseVolume}
              onChange={(e) => updateSetting('responseVolume', parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
            />
          </div>
          
          {/* Recognition Sensitivity */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Mic className="w-4 h-4 text-blue-500" />
                <span>Microphone Sensitivity</span>
              </label>
              <span className="text-xs font-medium text-gray-500">
                {settings.recognitionSensitivity}%
              </span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={settings.recognitionSensitivity}
              onChange={(e) => updateSetting('recognitionSensitivity', parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
            />
          </div>
          
          {/* Listening Timeout */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Clock className="w-4 h-4 text-blue-500" />
                <span>Listening Timeout</span>
              </label>
              <span className="text-xs font-medium text-gray-500">
                {settings.listeningTimeout} seconds
              </span>
            </div>
            <input 
              type="range" 
              min="5" 
              max="30" 
              step="1"
              value={settings.listeningTimeout}
              onChange={(e) => updateSetting('listeningTimeout', parseInt(e.target.value))}
              className="w-full h-2 bg-blue-100 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-600"
            />
          </div>
          
          {/* Toggle Switches */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <BarChart4 className="w-4 h-4 text-blue-500" />
                <span>Visual Feedback</span>
              </label>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showVisualIndicators ? 'bg-blue-600' : 'bg-gray-200'}`}
                onClick={() => updateSetting('showVisualIndicators', !settings.showVisualIndicators)}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showVisualIndicators ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Volume2 className="w-4 h-4 text-blue-500" />
                <span>Audio Cues</span>
              </label>
              <button 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.playAudioCues ? 'bg-blue-600' : 'bg-gray-200'}`}
                onClick={() => updateSetting('playAudioCues', !settings.playAudioCues)}
              >
                <span 
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.playAudioCues ? 'translate-x-6' : 'translate-x-1'}`} 
                />
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-between items-center">
          <button
            onClick={() => {
              const defaultSettings = {
                responseSpeed: 1,
                responseVolume: 80,
                recognitionSensitivity: 60,
                listeningTimeout: 10,
                showVisualIndicators: true,
                playAudioCues: true,
              };
              setSettings(defaultSettings);
              localStorage.setItem('voiceAccessibilitySettings', JSON.stringify(defaultSettings));
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Reset to Default
          </button>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoiceAccessibilitySettings;

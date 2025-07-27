import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { usePhonoEngine } from '@phonocorrect-ai/common';
import { Brain } from '@phosphor-icons/react';
import './popup.css';

function Popup() {
  const [text, setText] = useState('');
  const {
    suggestions,
    isAnalyzing,
    recordFeedback,
    applySuggestion,
    getConfidenceLabel,
  } = usePhonoEngine(text);

  const handleAcceptSuggestion = (suggestion: any) => {
    const newText = applySuggestion(suggestion, text);
    setText(newText);
    recordFeedback(suggestion.pattern, true);
  };

  const handleRejectSuggestion = (suggestion: any) => {
    recordFeedback(suggestion.pattern, false);
  };

  const insertIntoPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'insertText',
          text: text
        });
        window.close();
      }
    });
  };

  const getTextFromPage = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: 'getSelectedText'
        }, (response) => {
          if (response?.text) {
            setText(response.text);
          }
        });
      }
    });
  };

  return (
    <div className="popup-container">
      <div className="popup-header">
        <div className="popup-title">
          <Brain size={20} className="icon" />
          <span>PhonoCorrect AI</span>
        </div>
      </div>

      <div className="popup-content">
        <div className="text-area-container">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here for phonetic corrections..."
            className="text-area"
            rows={4}
          />
          
          <div className="text-stats">
            <span>
              {text.trim().split(/\s+/).filter(word => word.length > 0).length} words
            </span>
            {suggestions.length > 0 && (
              <span className="suggestions-count">
                {suggestions.length} suggestion{suggestions.length === 1 ? '' : 's'}
              </span>
            )}
            {isAnalyzing && <span className="analyzing">Analyzing...</span>}
          </div>
        </div>

        <div className="actions">
          <button onClick={getTextFromPage} className="btn btn-outline">
            Get Selected Text
          </button>
          <button 
            onClick={insertIntoPage} 
            className="btn btn-primary"
            disabled={!text.trim()}
          >
            Insert Text
          </button>
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions">
            <div className="suggestions-header">Suggestions</div>
            {suggestions.map((suggestion, index) => (
              <div key={`${suggestion.startIndex}-${index}`} className="suggestion-card">
                <div className="suggestion-content">
                  <div className="suggestion-text">
                    <span className="original">"{suggestion.original}"</span>
                    <span className="arrow"> → </span>
                    <span className="suggested">"{suggestion.suggestion}"</span>
                    <span className={`confidence confidence-${getConfidenceLabel(suggestion.confidence).toLowerCase()}`}>
                      {getConfidenceLabel(suggestion.confidence)}
                    </span>
                  </div>
                  {suggestion.explanation && (
                    <div className="explanation">{suggestion.explanation}</div>
                  )}
                </div>
                <div className="suggestion-actions">
                  <button 
                    onClick={() => handleRejectSuggestion(suggestion)}
                    className="btn btn-sm"
                  >
                    Reject
                  </button>
                  <button 
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="btn btn-sm btn-primary"
                  >
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
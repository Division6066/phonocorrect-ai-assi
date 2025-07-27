// Content script for Chrome extension
import { generatePhoneticSuggestions, applySuggestionToText } from '@phonocorrect-ai/common';

interface PhonoCorrectState {
  isActive: boolean;
  currentElement: HTMLElement | null;
  overlay: HTMLElement | null;
  suggestions: any[];
}

const state: PhonoCorrectState = {
  isActive: false,
  currentElement: null,
  overlay: null,
  suggestions: []
};

// Initialize content script
function init() {
  console.log('PhonoCorrect AI content script loaded');
  
  // Listen for text input events
  document.addEventListener('input', handleInput);
  document.addEventListener('focusin', handleFocus);
  document.addEventListener('focusout', handleBlur);
}

// Handle input events on text fields
function handleInput(event: Event) {
  const target = event.target as HTMLElement;
  
  if (isTextInput(target)) {
    const text = getTextFromElement(target);
    if (text && text.length > 10) {
      debounceAnalyzeText(text, target);
    }
  }
}

// Handle focus events
function handleFocus(event: Event) {
  const target = event.target as HTMLElement;
  
  if (isTextInput(target)) {
    state.currentElement = target;
    showPhonoCorrectIndicator(target);
  }
}

// Handle blur events
function handleBlur(event: Event) {
  const target = event.target as HTMLElement;
  
  if (target === state.currentElement) {
    hideOverlay();
    state.currentElement = null;
  }
}

// Check if element is a text input
function isTextInput(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  const inputType = (element as HTMLInputElement).type;
  
  return (
    tagName === 'textarea' ||
    (tagName === 'input' && ['text', 'email', 'search', 'url'].includes(inputType)) ||
    element.contentEditable === 'true'
  );
}

// Get text content from element
function getTextFromElement(element: HTMLElement): string {
  if (element.tagName.toLowerCase() === 'textarea' || 
      (element.tagName.toLowerCase() === 'input')) {
    return (element as HTMLInputElement).value;
  } else if (element.contentEditable === 'true') {
    return element.textContent || '';
  }
  return '';
}

// Set text content to element
function setTextToElement(element: HTMLElement, text: string): void {
  if (element.tagName.toLowerCase() === 'textarea' || 
      (element.tagName.toLowerCase() === 'input')) {
    (element as HTMLInputElement).value = text;
  } else if (element.contentEditable === 'true') {
    element.textContent = text;
  }
}

// Debounced text analysis
const debounceAnalyzeText = debounce((text: string, element: HTMLElement) => {
  analyzeText(text, element);
}, 1000);

// Analyze text for suggestions
async function analyzeText(text: string, element: HTMLElement) {
  try {
    const suggestions = generatePhoneticSuggestions(text, 3);
    
    if (suggestions.length > 0) {
      state.suggestions = suggestions;
      showSuggestions(suggestions, element);
    }
  } catch (error) {
    console.error('Error analyzing text:', error);
  }
}

// Show phonetic correction indicator
function showPhonoCorrectIndicator(element: HTMLElement) {
  if (state.overlay) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'phonocorrect-indicator';
  overlay.textContent = 'PC';
  overlay.title = 'PhonoCorrect AI is active';
  
  const rect = element.getBoundingClientRect();
  overlay.style.cssText = `
    position: fixed;
    top: ${rect.top - 25}px;
    right: ${window.innerWidth - rect.right}px;
    width: 20px;
    height: 20px;
    background: #007AFF;
    color: white;
    border-radius: 50%;
    font-size: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    font-weight: bold;
    cursor: pointer;
  `;
  
  overlay.addEventListener('click', () => {
    const text = getTextFromElement(element);
    if (text) {
      analyzeText(text, element);
    }
  });
  
  document.body.appendChild(overlay);
  state.overlay = overlay;
}

// Show suggestions overlay
function showSuggestions(suggestions: any[], element: HTMLElement) {
  hideOverlay();
  
  const overlay = document.createElement('div');
  overlay.className = 'phonocorrect-suggestions';
  
  const rect = element.getBoundingClientRect();
  overlay.style.cssText = `
    position: fixed;
    top: ${rect.bottom + 5}px;
    left: ${rect.left}px;
    max-width: 300px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    padding: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  `;
  
  suggestions.forEach((suggestion, index) => {
    const suggestionEl = document.createElement('div');
    suggestionEl.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px;
      margin: 2px 0;
      background: #f8f9fa;
      border-radius: 4px;
      font-size: 12px;
    `;
    
    suggestionEl.innerHTML = `
      <div>
        <span style="color: #6c757d;">"${suggestion.original}"</span>
        <span style="color: #6c757d;"> → </span>
        <span style="font-weight: 500;">"${suggestion.suggestion}"</span>
      </div>
      <button style="
        background: #007AFF;
        color: white;
        border: none;
        padding: 2px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 10px;
      ">Apply</button>
    `;
    
    const applyBtn = suggestionEl.querySelector('button');
    applyBtn?.addEventListener('click', () => {
      applySuggestion(suggestion, element);
      hideOverlay();
    });
    
    overlay.appendChild(suggestionEl);
  });
  
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = `
    position: absolute;
    top: 4px;
    right: 4px;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #6c757d;
  `;
  closeBtn.addEventListener('click', hideOverlay);
  overlay.appendChild(closeBtn);
  
  document.body.appendChild(overlay);
  state.overlay = overlay;
}

// Apply suggestion to text
function applySuggestion(suggestion: any, element: HTMLElement) {
  const currentText = getTextFromElement(element);
  const newText = applySuggestionToText(currentText, suggestion);
  setTextToElement(element, newText);
  
  // Trigger input event to notify the page
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

// Hide overlay
function hideOverlay() {
  if (state.overlay) {
    state.overlay.remove();
    state.overlay = null;
  }
}

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'insertText':
      if (state.currentElement) {
        setTextToElement(state.currentElement, message.text);
        state.currentElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
      break;
    
    case 'getSelectedText':
      const selectedText = window.getSelection()?.toString() || '';
      sendResponse({ text: selectedText });
      break;
    
    case 'analyzeSelection':
      // Handle context menu analysis
      break;
  }
});

// Utility functions
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

export {};
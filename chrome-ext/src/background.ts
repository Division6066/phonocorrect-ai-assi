// Background script for Chrome extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('PhonoCorrect AI extension installed');
  
  // Create context menu
  chrome.contextMenus.create({
    id: 'phonocorrect-analyze',
    title: 'Analyze with PhonoCorrect AI',
    contexts: ['selection']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'phonocorrect-analyze' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'analyzeSelection',
      text: info.selectionText
    });
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'openPopup':
      // Open extension popup programmatically if needed
      break;
    
    case 'savePreferences':
      // Save user preferences to storage
      chrome.storage.local.set({ preferences: message.preferences });
      sendResponse({ success: true });
      break;
    
    case 'getPreferences':
      // Get user preferences from storage
      chrome.storage.local.get(['preferences'], (result) => {
        sendResponse({ preferences: result.preferences });
      });
      return true; // Keep message channel open
    
    default:
      break;
  }
});

export {};
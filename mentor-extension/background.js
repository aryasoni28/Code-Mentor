// Background service worker for extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('Code Mentor extension installed');
});

// Handle API key storage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "saveApiKey") {
    chrome.storage.sync.set({ apiKey: request.apiKey }, () => {
      sendResponse({ success: true });
    });
    return true; // Required for async response
  }
});
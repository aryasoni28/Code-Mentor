document.addEventListener('DOMContentLoaded', async () => {
  // Load saved API key
  const { apiKey } = await chrome.storage.sync.get(['apiKey']);
  document.getElementById('api-key').value = apiKey || '';
  
  // Save settings
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Allow saving with Enter key
  document.getElementById('api-key').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveSettings();
  });
});

async function saveSettings() {
  const apiKey = document.getElementById('api-key').value.trim();
  const status = document.getElementById('status-message');
  
  if (!apiKey) {
    status.textContent = 'Please enter an API key';
    return;
  }
  
  try {
    await chrome.storage.sync.set({ apiKey });
    status.textContent = 'Settings saved!';
    setTimeout(() => status.textContent = '', 2000);
  } catch (error) {
    status.textContent = 'Error saving settings';
    console.error('Error saving API key:', error);
  }
}
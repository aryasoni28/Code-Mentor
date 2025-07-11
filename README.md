# Code Mentor Chrome Extension


A smart Chrome extension that provides contextual coding hints when you're stuck on problem-solving platforms like LeetCode, StackOverflow, and Kaggle.

## Features

- 🕒 **Automatic Activation**: Appears after 5 seconds of inactivity
- 🤖 **AI-Powered Hints**: Uses Gemini API for intelligent guidance
- 📚 **Progressive Help**: Multiple hint levels (general → specific)
- 🎯 **Context-Aware**: Extracts problem statements automatically
- 🔒 **Secure**: API keys stored in Chrome's encrypted storage

## Supported Platforms

- LeetCode
- StackOverflow
- Kaggle
- GitHub (coding problems)
- Project Euler
- Advent of Code
- *(More can be added easily)*

## Installation

### Option 1: Load Unpacked (Development)

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/code-mentor-extension.git

2 Open Chrome and go to chrome://extensions

3 Enable "Developer mode" (toggle in top-right)

4 Click "Load unpacked" and select the extension folder

Configuration
Click the extension icon in your toolbar

Enter your Google Gemini API key

Click "Save Settings"

How It Works
Detects Inactivity: Monitors mouse/keyboard activity

Extracts Context: Pulls problem text from supported sites

Generates Hints: Uses AI to provide appropriate guidance

Progressive Help:

Level 1: General direction

Level 2: Specific approach

Level 3: Implementation clues

Technical Details
File Structure

mentor-extension/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Main content script
├── popup/                # Settings UI
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
└── icons/                # Extension icons


APIs Used
Google Gemini API

Chrome Extension APIs:

chrome.storage.sync

chrome.runtime

chrome.scripting

Customization
Add New Supported Sites
Edit manifest.json:
"content_scripts": [{
  "matches": ["*://*.newsite.com/*"],
  "js": ["content.js"]
}]
Update extractProblemText() in content.js

Use Different AI Provider
Modify fetchHintFromAPI() in content.js to support:

OpenAI

Claude

Local LLMs

Troubleshooting
Issue	Solution
Hints not appearing	Check console errors (Inspect views > Console)
API key not working	Verify key at Google AI Studio
Extension crashes	Disable other extensions to check for conflicts
Development
Prerequisites
Chrome browser

Node.js (for testing)

Build Steps
Install dependencies (if any)

Package extension:

bash
zip -r code-mentor.zip mentor-extension/
Contributing
Pull requests are welcome! For major changes, please open an issue first.

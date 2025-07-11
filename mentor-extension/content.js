let lastActivity = Date.now();
let mentorVisible = false;
let inactivityTimer;
let hintLevel = 0;

// Listen for user activity
document.addEventListener('mousemove', resetTimer);
document.addEventListener('keypress', resetTimer);

function resetTimer() {
  lastActivity = Date.now();
  // Only reset timer if mentor isn't visible
  if (!mentorVisible) {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(checkInactivity, 5000);
  }
}

function checkInactivity() {
  if (Date.now() - lastActivity > 5000 && !mentorVisible) {
    showMentor();
  }
}

function showMentor() {
  mentorVisible = true;
  hintLevel = 0;
  
  // Stop listening for activity once shown
  document.removeEventListener('mousemove', resetTimer);
  document.removeEventListener('keypress', resetTimer);
  
  // Create mentor UI
  const mentorDiv = document.createElement('div');
  mentorDiv.id = 'code-mentor';
  mentorDiv.innerHTML = `
    <div class="mentor-container">
      <div class="mentor-header">
        <h3>🤖 Code Mentor</h3>
        <button class="close-mentor" title="Close">✕</button>
      </div>
      <div class="mentor-body">
        <p>I'll stay open until you close me. Need a hint?</p>
        <button id="get-hint" class="hint-button">Get Hint</button>
        <div id="hint-container" style="display:none;">
          <div id="hint-content" class="hint-content"></div>
          <button id="more-hint" class="hint-button">More Detailed Hint</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(mentorDiv);
  
  // Add event listeners
  document.getElementById('get-hint').addEventListener('click', generateHint);
  document.getElementById('more-hint').addEventListener('click', generateDetailedHint);
  document.querySelector('.close-mentor').addEventListener('click', hideMentor);
  
  // Add styles
  addMentorStyles();
}

function hideMentor() {
  const mentor = document.getElementById('code-mentor');
  if (mentor) {
    mentor.remove();
  }
  mentorVisible = false;
  hintLevel = 0;
  
  // Restart activity listeners
  document.addEventListener('mousemove', resetTimer);
  document.addEventListener('keypress', resetTimer);
  resetTimer(); // Restart the 5s timer
}

function addMentorStyles() {
  const style = document.createElement('style');
  style.textContent = `
    #code-mentor {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 10000;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      width: 320px;
      font-family: 'Segoe UI', Arial, sans-serif;
      overflow: hidden;
      animation: fadeIn 0.3s ease-in-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .mentor-container {
      display: flex;
      flex-direction: column;
    }
    .mentor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #4285f4;
      color: white;
    }
    .mentor-header h3 {
      margin: 0;
      font-size: 16px;
    }
    .close-mentor {
      background: none;
      border: none;
      color: white;
      font-size: 20px;
      cursor: pointer;
      padding: 0 8px;
      transition: transform 0.2s;
    }
    .close-mentor:hover {
      transform: scale(1.2);
    }
    .mentor-body {
      padding: 16px;
    }
    .hint-button {
      background: #4285f4;
      color: white;
      border: none;
      padding: 10px 16px;
      border-radius: 4px;
      cursor: pointer;
      margin-top: 10px;
      width: 100%;
      font-weight: 500;
      transition: background 0.2s;
    }
    .hint-button:hover {
      background: #3367d6;
    }
    .hint-content {
      padding: 12px 0;
      line-height: 1.5;
      border-top: 1px solid #eee;
      margin-top: 12px;
    }
  `;
  document.head.appendChild(style);
}

async function generateHint() {
  try {
    hintLevel = 1;
    const problemText = extractProblemText();
    const hintButton = document.getElementById('get-hint');
    
    hintButton.disabled = true;
    hintButton.textContent = 'Generating...';
    
    const hint = await fetchHintFromAPI(problemText, hintLevel);
    
    document.getElementById('hint-container').style.display = 'block';
    document.getElementById('hint-content').innerHTML = hint;
    hintButton.style.display = 'none';
  } catch (error) {
    document.getElementById('hint-content').innerHTML = 
      `❌ Error: ${error.message}`;
  } finally {
    const hintButton = document.getElementById('get-hint');
    if (hintButton) {
      hintButton.disabled = false;
      hintButton.textContent = 'Get Hint';
    }
  }
}

async function generateDetailedHint() {
  hintLevel++;
  const problemText = extractProblemText();
  const hint = await fetchHintFromAPI(problemText, hintLevel);
  
  document.getElementById('hint-content').innerHTML = hint;
}

function extractProblemText() {
  // Try to extract the most relevant content based on the website
  if (window.location.hostname.includes('leetcode.com')) {
    const title = document.querySelector('[data-cy="question-title"]')?.textContent || '';
    const content = document.querySelector('.question-content__JfgR')?.textContent || '';
    return `${title}\n\n${content}`.trim();
  }
  else if (window.location.hostname.includes('stackoverflow.com')) {
    const title = document.querySelector('.question-header h1')?.textContent || '';
    const content = document.querySelector('.question .post-text')?.textContent || '';
    return `${title}\n\n${content}`.trim();
  }
  else if (window.location.hostname.includes('kaggle.com')) {
    const title = document.querySelector('h1')?.textContent || '';
    const content = document.querySelector('.competition-details__description')?.textContent || '';
    return `${title}\n\n${content}`.trim();
  }
  
  // Fallback: Use page title and first 500 characters of body text
  return `${document.title}\n\n${document.body.textContent.substring(0, 500)}`;
}

async function fetchHintFromAPI(problemText, hintLevel) {
  // Get API key from storage
  const { apiKey } = await chrome.storage.sync.get(['apiKey']);
  
  if (!apiKey) {
    return "⚠️ Please set your API key in extension settings (click the extension icon)";
  }

  try {
    const prompt = buildPrompt(problemText, hintLevel);
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        safetySettings: [
          {
            "category": "HARM_CATEGORY_HARASSMENT",
            "threshold": "BLOCK_NONE"
          }
        ],
        generationConfig: {
          "temperature": 0.7,
          "topP": 0.9,
          "maxOutputTokens": 300
        }
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return `🚨 API Error: ${errorData.error?.message || 'Unknown error'}`;
    }
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 
           "🤔 Couldn't generate a hint. The API returned an empty response.";
  } catch (error) {
    console.error('Network Error:', error);
    return `🌐 Network Error: ${error.message}`;
  }
}
function buildPrompt(problemText, hintLevel) {
  return `You're an expert coding mentor helping with a problem. Follow these rules:
  
1. NEVER give complete solutions
2. Provide hints that encourage independent thinking
3. For level ${hintLevel} hints:
   ${hintLevel === 1 ? 'Give a general direction (e.g. "Consider time complexity")' : ''}
   ${hintLevel === 2 ? 'Suggest specific approaches (e.g. "Try using a hash map")' : ''}
   ${hintLevel >= 3 ? 'Give implementation clues (e.g. "Initialize a dictionary to store complements")' : ''}

Current problem:
${problemText.substring(0, 3000)} ${problemText.length > 3000 ? '...' : ''}

Provide only the ${hintLevel > 1 ? 'more detailed ' : ''}hint (no greetings or explanations):
`;
}

// Start the inactivity timer
resetTimer();
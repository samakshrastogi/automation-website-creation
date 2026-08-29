const API_BASE = '/api';

/**
 * Send a chat prompt to the backend (integrated with Google Gemini)
 */
export async function sendChatMessage({ message, chatId, model, history }) {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, chatId, model, history }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error sendChatMessage:', error);
    throw error;
  }
}

/**
 * Request dynamic prompt ideation (Gemini-powered creative prompt)
 */
export async function requestPromptIdea(category = 'any', tone = 'creative and technical') {
  try {
    const response = await fetch(`${API_BASE}/generate-prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, tone }),
    });

    if (!response.ok) {
      throw new Error(`Failed to generate prompt idea: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error requestPromptIdea:', error);
    throw error;
  }
}

/**
 * Fetch all saved chats
 */
export async function getChatThreads() {
  try {
    const response = await fetch(`${API_BASE}/chats`);
    if (!response.ok) return { success: false, chats: [] };
    return await response.json();
  } catch (error) {
    console.warn('Could not fetch chat threads:', error.message);
    return { success: false, chats: [] };
  }
}

/**
 * Fetch messages for a specific chat
 */
export async function getChatDetails(chatId) {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}`);
    if (!response.ok) throw new Error('Chat not found');
    return await response.json();
  } catch (error) {
    console.error('API Error getChatDetails:', error);
    throw error;
  }
}

/**
 * Delete a chat thread
 */
export async function removeChatThread(chatId) {
  try {
    const response = await fetch(`${API_BASE}/chats/${chatId}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('API Error removeChatThread:', error);
    throw error;
  }
}

/**
 * Health check & status
 */
export async function getSystemHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

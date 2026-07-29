// ===== ECOBOT CHAT WIDGET =====
const CHAT_API_BASE = 'http://127.0.0.1:5000';

const chatToggleBtn = document.getElementById('chatToggleBtn');
const chatWindow = document.getElementById('chatWindow');
const chatCloseBtn = document.getElementById('chatCloseBtn');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

// Open chat window
chatToggleBtn.addEventListener('click', () => {
    chatWindow.classList.remove('hidden');
    chatToggleBtn.classList.add('hidden');
});

// Close chat window
chatCloseBtn.addEventListener('click', () => {
    chatWindow.classList.add('hidden');
    chatToggleBtn.classList.remove('hidden');
});

// Send message on button click
chatSendBtn.addEventListener('click', sendMessage);

// Send message on Enter key
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('chat-msg', ...sender.split(' '));
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    chatInput.value = '';

    addMessage('Typing...', 'bot typing');

    try {
        const response = await fetch(`${CHAT_API_BASE}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });

        const data = await response.json();

        document.querySelector('.chat-msg.typing')?.remove();

        if (!response.ok) {
            addMessage(data.error || 'Something went wrong.', 'bot');
            return;
        }

        addMessage(data.reply, 'bot');

    } catch (error) {
        document.querySelector('.chat-msg.typing')?.remove();
        addMessage('Could not connect to EcoBot. Is the backend running?', 'bot');
        console.error('Chat error:', error);
    }
}
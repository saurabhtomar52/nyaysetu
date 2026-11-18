document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.querySelector('#chat-box');
  const chatForm = document.querySelector('#chat-form');
  if (!chatBox || !chatForm) return;
  requireRole();
  const auth = getAuth();

  async function loadConversation() {
    const otherId = new URLSearchParams(window.location.search).get('userId');
    if (!otherId) {
      chatBox.innerHTML = '<p>Open chat from a consultation or lawyer profile.</p>';
      return;
    }
    try {
      const messages = await api(`/messages/${otherId}`, { headers: authHeaders() });
      chatBox.innerHTML = messages.map(message => `
        <div class="message ${message.sender_id === auth.user.id ? 'sent' : 'received'}">
          <strong>${escapeHtml(message.sender_name)}</strong>
          <p>${escapeHtml(message.content)}</p>
        </div>`).join('');
      chatBox.scrollTop = chatBox.scrollHeight;
    } catch (error) {
      chatBox.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
    }
  }

  chatForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const otherId = new URLSearchParams(window.location.search).get('userId');
    const content = new FormData(chatForm).get('message');
    if (!otherId || !content) return;
    try {
      await api('/messages', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ receiverId: otherId, content }) });
      chatForm.reset();
      loadConversation();
    } catch (error) {
      document.querySelector('#chat-error').textContent = error.message;
    }
  });

  function escapeHtml(value) {
    const div = document.createElement('div');
    div.textContent = value ?? '';
    return div.innerHTML;
  }

  loadConversation();
  setInterval(loadConversation, 5000);
});

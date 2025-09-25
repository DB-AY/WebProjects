const textarea = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const spinner = document.getElementById("spinner");
const chatHistoryDiv = document.getElementById("chatHistory");

let chatHistory = [];
let chats = [{ id: 1, name: 'Chat 1', history: [] }];
let currentChatId = 1;

function renderChatList() {
   const chatList = document.getElementById('chatList');
   chatList.innerHTML = '';
   chats.forEach(chat => {
      const li = document.createElement('li');
      li.className = 'chat-list-item' + (chat.id === currentChatId ? ' selected' : '');
      if (chat.editing) {
         li.innerHTML = `<input class="chat-rename-input" value="${chat.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" autofocus />`;
         // Add event listeners for Enter (save) and Esc (cancel)
         setTimeout(() => {
            const input = li.querySelector('.chat-rename-input');
            if (input) {
               input.focus();
               // Move cursor to end
               const val = input.value;
               input.value = '';
               input.value = val;
               input.addEventListener('keydown', function (e) {
                  if (e.key === 'Enter') {
                     window.finishRename(chat.id);
                  } else if (e.key === 'Escape') {
                     window.cancelRename(chat.id);
                  }
               });
               input.addEventListener('blur', function () {
                  window.finishRename(chat.id);
               });
            }
         }, 0);
      } else {
         li.innerHTML = `<span class="chat-name">${chat.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`;
      }
      // More button
      if (!chat.editing) {
         const moreBtn = document.createElement('button');
         moreBtn.className = 'more-btn';
         moreBtn.title = 'More';
         moreBtn.innerHTML = '⋮';
         moreBtn.onclick = e => {
            e.stopPropagation();
            chats.forEach(c => delete c.menuOpen);
            chat.menuOpen = !chat.menuOpen;
            renderChatList();
         };
         li.appendChild(moreBtn);
      }
      // Actions menu
      if (chat.menuOpen && !chat.editing) {
         const actions = document.createElement('div');
         actions.className = 'chat-actions';
         actions.style.display = 'flex';
         actions.style.right = '8px';
         actions.style.left = 'auto';
         // Rename option
         const renameBtn = document.createElement('button');
         renameBtn.className = 'chat-action-btn';
         renameBtn.textContent = 'Rename';
         renameBtn.onclick = e => {
            e.stopPropagation();
            chats.forEach(c => { delete c.menuOpen; delete c.editing; });
            chat.editing = true;
            renderChatList();
            setTimeout(() => {
               const input = chatList.querySelector('.chat-rename-input');
               if (input) input.focus();
            }, 0);
         };
         // Delete option
         const deleteBtn = document.createElement('button');
         deleteBtn.className = 'chat-action-btn';
         deleteBtn.textContent = 'Delete';
         deleteBtn.onclick = e => {
            e.stopPropagation();
            if (confirm('Delete this chat?')) {
               const idx = chats.findIndex(c => c.id === chat.id);
               chats.splice(idx, 1);
               if (currentChatId === chat.id) {
                  if (chats.length) {
                     currentChatId = chats[0].id;
                     chatHistory = chats[0].history;
                     document.getElementById('mainChatTitle').textContent = chats[0].name;
                  } else {
                     // No chats left, create a new one
                     newChat();
                     return;
                  }
               }
               renderChatList();
               renderChat();
            }
         };
         actions.appendChild(renameBtn);
         actions.appendChild(deleteBtn);
         li.appendChild(actions);
      }
      if (!chat.editing) {
         li.onclick = () => selectChat(chat.id);
      }
      chatList.appendChild(li);
   });
   // Close menus on click outside
   setTimeout(() => {
      document.addEventListener('click', closeMenus, { once: true });
   }, 0);
}

function closeMenus(e) {
   chats.forEach(c => delete c.menuOpen);
   renderChatList();
}

function selectChat(id) {
   currentChatId = id;
   chatHistory = chats.find(c => c.id === id).history;
   document.getElementById('mainChatTitle').textContent = chats.find(c => c.id === id).name;
   renderChat();
   renderChatList();
   textarea.focus();
}

function newChat() {
   const newId = chats.length ? Math.max(...chats.map(c => c.id)) + 1 : 1;
   const chat = { id: newId, name: 'Chat ' + newId, history: [] };
   chats.unshift(chat);
   currentChatId = newId;
   chatHistory = chat.history;
   document.getElementById('mainChatTitle').textContent = chat.name;
   renderChat();
   renderChatList();
   textarea.focus();
}

function renderChat() {
   chatHistoryDiv.innerHTML = "";
   chatHistory.forEach(msg => {
      const row = document.createElement("div");
      row.className = "message-row";
      if (msg.role === "user") {
         row.style.justifyContent = "flex-end";
         row.innerHTML = `
            <div class="message user">${escapeHtml(msg.content)}</div>
            <div class="avatar user">U</div>
         `;
      } else {
         row.style.justifyContent = "flex-start";
         row.innerHTML = `
            <div class="avatar assistant">🤖</div>
            <div class="message assistant">${escapeHtml(msg.content)}</div>
         `;
      }
      chatHistoryDiv.appendChild(row);
   });
   // Scroll to bottom
   chatHistoryDiv.scrollTop = chatHistoryDiv.scrollHeight;
}

function escapeHtml(text) {
   return text.replace(/[&<>"]'/g, function (m) {
      return ({
         '&': '&amp;',
         '<': '&lt;',
         '>': '&gt;',
         '"': '&quot;',
         "'": '&#39;'
      })[m];
   });
}

function setLoading(isLoading) {
   const sendBtnWrapper = document.getElementById("sendBtnWrapper");
   if (isLoading) {
      document.getElementById("sendBtn").style.display = "none";
      spinner.style.display = "flex";
   } else {
      document.getElementById("sendBtn").style.display = "flex";
      spinner.style.display = "none";
   }
   sendBtn.disabled = isLoading || !textarea.value.trim();
   textarea.disabled = isLoading;
   if (!isLoading) {
      textarea.focus();
   }
}

textarea.addEventListener("input", function () {
   sendBtn.disabled = !textarea.value.trim();
   // Auto resize textarea
   textarea.style.height = "28px";
   textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
});

textarea.addEventListener("keydown", function (e) {
   if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) ask();
   }
});

async function ask() {
   const input = textarea.value.trim();
   if (!input) return;
   chatHistory.push({ role: "user", content: input });
   renderChat();
   textarea.value = "";
   textarea.style.height = "auto";
   setLoading(true);

   // Add assistant placeholder
   chatHistory.push({ role: "assistant", content: "" });
   renderChat();

   try {
      const res = await fetch("http://localhost:1234/v1/chat/completions", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer not-needed"
         },
         body: JSON.stringify({
            model: "google/gemma-3-4b",
            stream: true,
            messages: chatHistory.filter(m => m.role === "user" || m.role === "assistant").map(m => ({
               role: m.role,
               content: m.content
            }))
         })
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let done = false;
      let assistantMsg = "";

      while (!done) {
         const { value, done: streamDone } = await reader.read();
         done = streamDone;
         if (value) {
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop();
            for (let line of lines) {
               line = line.trim();
               if (line.startsWith("data: ")) {
                  const jsonStr = line.slice(6).trim();
                  if (jsonStr === "[DONE]") {
                     done = true;
                     break;
                  }
                  const data = JSON.parse(jsonStr);
                  const delta = data.choices?.[0]?.delta?.content || "";
                  assistantMsg += delta;
                  chatHistory[chatHistory.length - 1].content = assistantMsg;
                  renderChat();
               }
            }
         }
      }
   } catch (err) {
      chatHistory[chatHistory.length - 1].content = "Error: " + err.message;
      renderChat();
   } finally {
      setLoading(false);
   }
}

// Expose finishRename globally for inline input
window.finishRename = function (chatId) {
   const chat = chats.find(c => c.id === chatId);
   const chatList = document.getElementById('chatList');
   const input = chatList.querySelector('.chat-rename-input');
   if (input) {
      const newName = input.value.trim();
      if (newName) chat.name = newName;
   }
   delete chat.editing;
   renderChatList();
   // Always update chat title if this is the current chat
   if (chatId === currentChatId) {
      document.getElementById('mainChatTitle').textContent = chat.name;
   }
}

window.cancelRename = function (chatId) {
   const chat = chats.find(c => c.id === chatId);
   delete chat.editing;
   renderChatList();
}

// Initial state
renderChatList();
renderChat();
setLoading(false);
textarea.focus();

const chat = chats.find(c => c.id === chatId);
document.getElementById('mainChatTitle').textContent = chat.name;
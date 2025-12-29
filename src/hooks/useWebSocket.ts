let socket;
let callbacks = {};
let messageQueue = [];
let reconnectInterval = 3000;
let reconnectAttempts = 0;
let currentFromNo = null;
let currentToNo = null;
let isReconnecting = false;

// Store one-time connect promise to prevent multiple connections
let connectingPromise = null;

export function connectWebSocket(from_no, to_no) {
  // If already connecting, return the same promise
  if (connectingPromise) return connectingPromise;

  currentFromNo = from_no;
  currentToNo = to_no;

  connectingPromise = new Promise((resolve, reject) => {
    // Clean up existing socket if any
    if (socket) {
      socket.close();
      socket = null;
    }

    socket = new WebSocket(
      `wss://7mbg70wjz8.execute-api.us-east-1.amazonaws.com/prod/?from_no=${encodeURIComponent(
        from_no
      )}&to_no=${encodeURIComponent(to_no)}`
    );

    socket.onopen = () => {
      console.log("✅ WebSocket connected:", { from_no, to_no });
      reconnectAttempts = 0;

      // Flush queued messages
      while (messageQueue.length > 0) {
        socket.send(messageQueue.shift());
      }

      // Fetch initial data after connect
      fetchMessages(from_no, to_no);
      fetchConversations();

      resolve();
      connectingPromise = null;
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
      reject(err);
      connectingPromise = null;
    };

    socket.onclose = () => {
      console.warn("⚠️ WebSocket closed. Attempting to reconnect...");
      attemptReconnect();
    };

    socket.onmessage = (message) => {
      try {
        const data = JSON.parse(message.data);
        console.log("📩 WebSocket event received:", message.data);
        if (data.event && callbacks[data.event]) {
          // Call each registered listener only once per message
          callbacks[data.event].forEach((cb) => cb(data));
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", message.data);
      }
    };
  });

  return connectingPromise;
}

function attemptReconnect() {
  if (isReconnecting) return;
  isReconnecting = true;

  setTimeout(() => {
    console.log(`🔄 Reconnecting... (attempt ${reconnectAttempts})`);
    connectWebSocket(currentFromNo, currentToNo)
      .then(() => {
        isReconnecting = false;
      })
      .catch(() => {
        reconnectAttempts++;
        isReconnecting = false;
        attemptReconnect();
      });
  }, reconnectInterval);
}

// ✅ Send messages safely
function safeSend(payload) {
  const msg = JSON.stringify(payload);
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(msg);
  } else {
    console.log("⏳ Socket not ready, queuing message:", payload);
    messageQueue.push(msg);
  }
}

// ✅ Send chat message
export function sendMessage(from_no, to_no, body, twilio = false) {
  safeSend({
    action: "sendMessage",
    from_no,
    to_no,
    body,
    twilio,
  });
}

// ✅ Send SMS (Twilio)
export function sendSMS(from_no, to_no, body) {
  if (!from_no || !to_no || !body) return;
  safeSend({
    action: "send_sms",
    from_no,
    to_no,
    body,
  });
}

// ✅ Fetch messages
export function fetchMessages(from_no, to_no) {
  safeSend({ action: "fetchMessages", from_no, to_no });
}

// ✅ Fetch all conversations
export function fetchConversations() {
  safeSend({ action: "route1" });
}

// ✅ Reset unread count
export function resetConversationUnread(from_no, to_no) {
  if (!from_no || !to_no) return;
  safeSend({ action: "reset_conversation_unread", from_no, to_no });
}

// ✅ Event listeners
export function onEvent(event, callback) {
  if (!callbacks[event]) callbacks[event] = [];
  if (!callbacks[event].includes(callback)) {
    callbacks[event].push(callback);
  }
}

// ✅ Remove event listener
// export function offEvent(event, callback) {
//   if (!callbacks[event]) return;
//   callbacks[event] = callbacks[event].filter((cb) => cb !== callback);
// }

// ✅ Disconnect socket
export function disconnect() {
  if (socket) {
    socket.close();
    socket = null;
  }
  callbacks = {};
  messageQueue = [];
  connectingPromise = null;
}

export function offEvent(event, callback) {
  if (!callbacks[event]) return;
  callbacks[event] = callbacks[event].filter((cb) => cb !== callback);
}

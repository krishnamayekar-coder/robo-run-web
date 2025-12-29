import { useEffect, useState } from "react";
import {
  connectWebSocket,
  sendMessage,
  fetchMessages,
  onEvent,
  resetConversationUnread,
  offEvent,
} from "../../hooks/useWebSocket";

function Notifications() {
  const [fromNo, setFromNo] = useState("+15677723029"); //+15074100500
  const [toNo, setToNo] = useState("+15203998695"); //+15203998695
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!fromNo || !toNo) return;

    let isMounted = true;

    async function init() {
      try {
        await connectWebSocket(fromNo, toNo);

        if (!isMounted) return;

        setConnected(true);

        // Clear previous listeners first
        offEvent("new_message", handleNewMessage);
        offEvent("fetchedMessages", handleFetchedMessages);

        // Register event listeners
        onEvent("new_message", handleNewMessage);
        onEvent("fetchedMessages", handleFetchedMessages);

        fetchMessages(fromNo, toNo);
      } catch (err) {
        console.error("WebSocket connection failed:", err);
      }
    }

    // Handlers
    function handleNewMessage(data) {
      console.log("new_message", data);
      setToast(data.message);
      setMessages((prev) => [...prev, data.message]);
    }

    function handleFetchedMessages(data) {
      console.log("handleFetchedMessages", data);
      setToast(data.message);

      setMessages(data.messages || []);
    }

    init();

    return () => {
      isMounted = false;
      offEvent("new_message", handleNewMessage);
      offEvent("fetchedMessages", handleFetchedMessages);
    };
  }, [fromNo, toNo]);

  const handleResetUnread = () => {
    if (!fromNo || !toNo) return;
    resetConversationUnread(fromNo, toNo);
  };

  const toastStyle: React.CSSProperties = {
    position: "fixed",
    top: 20,
    right: 20,
    background: "#323232",
    color: "#fff",
    padding: "12px 16px",
    borderRadius: 6,
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    zIndex: 9999,
    minWidth: 250,
    animation: "fadeIn 0.3s ease",
  };

  return (
    <>
      {toast && (
        <div style={toastStyle}>
          <strong>
            {"New Message"} {toast.event}
          </strong>
          <div>{toast.summary}</div>
        </div>
      )}
    </>
  );
}

export default Notifications;

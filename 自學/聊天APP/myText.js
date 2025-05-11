    const input = document.getElementById("user-input");
    const sendBtn = document.getElementById("send-button");
    const chatMessages = document.querySelector(".chat-messages");

sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text !== "") {
        // 建立新的訊息 div
        const userMessage = document.createElement("div");
    userMessage.classList.add("messages", "user");
    userMessage.innerText = text;

    chatMessages.appendChild(userMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight; // 滾到最底
    input.value = ""; // 清空輸入框

        // 假裝 AI 回覆（這裡是靜態的）
        setTimeout(() => {
            const aiMessage = document.createElement("div");
    aiMessage.classList.add("messages", "ai");
    aiMessage.innerText = "我知道了，你可以放鬆一下";

    chatMessages.appendChild(aiMessage);
    chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
});
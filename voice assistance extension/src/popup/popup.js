document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start");
    const status = document.getElementById("status");

    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
        status.innerText = "Speech recognition not supported in this browser.";
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.lang = "en-US";
    recognition.interimResults = false; // Ensure only final results are used

    recognition.onstart = () => {
        console.log("Listening...");
        status.innerText = "Listening...";
    };

    recognition.onspeechend = () => {
        console.log("Speech ended.");
        recognition.stop();
        status.innerText = "Click 'Start' to begin again";
    };

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        console.log(`Recognized: ${command}`);
        status.innerText = `You said: "${command}"`;
        handleCommand(command);
    };

    recognition.onerror = (event) => {
        console.error("Recognition error:", event.error);
        status.innerText = `Error: ${event.error}`;
    };

    startBtn?.addEventListener("click", () => {
        console.log("Button clicked, starting recognition...");
        recognition.start();
    });

    function handleCommand(command) {
        if (command.includes("open google")) {
            chrome.tabs.create({ url: "https://www.google.com" });
        } else if (command.includes("search for")) {
            let query = command.replace("search for", "").trim();
            chrome.tabs.create({ url: `https://www.google.com/search?q=${query}` });
        } else if (command.includes("read page")) {
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: readPageContent
                });
            });
        } else {
            status.innerText = "Command not recognized.";
        }
    }
});

function readPageContent() {
    let text = document.body.innerText;
    let utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.speak(utterance);
}

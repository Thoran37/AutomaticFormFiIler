document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("start");
    const status = document.getElementById("status");

    const recognition = new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = "en-US";

    recognition.onstart = () => status.innerText = "Listening...";
    recognition.onend = () => status.innerText = "Click 'Start' to begin again";

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase();
        status.innerText = `You said: "${command}"`;
        handleCommand(command);
    };

    startBtn.addEventListener("click", () => recognition.start());

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

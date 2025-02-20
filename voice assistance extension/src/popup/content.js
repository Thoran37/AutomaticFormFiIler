document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.createElement("button");
    startBtn.innerText = "Start Voice Command";
    startBtn.style.position = "fixed";
    startBtn.style.bottom = "20px";
    startBtn.style.right = "20px";
    startBtn.style.padding = "10px";
    startBtn.style.background = "blue";
    startBtn.style.color = "white";
    startBtn.style.border = "none";
    startBtn.style.cursor = "pointer";
    document.body.appendChild(startBtn);

    const status = document.createElement("p");
    status.innerText = "Click 'Start' to begin voice recognition";
    status.style.position = "fixed";
    status.style.bottom = "50px";
    status.style.right = "20px";
    status.style.background = "white";
    status.style.padding = "5px";
    status.style.border = "1px solid black";
    document.body.appendChild(status);

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
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
            window.open("https://www.google.com", "_blank");
        } else if (command.includes("search for")) {
            let query = command.replace("search for", "").trim();
            window.open(`https://www.google.com/search?q=${query}`, "_blank");
        } else if (command.includes("read page")) {
            readPageContent();
        } else {
            status.innerText = "Command not recognized.";
        }
    }

    function readPageContent() {
        let text = document.body.innerText;
        let utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }
});

document.getElementById("imageInput").addEventListener("change", async function (event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async function () {
      const image = reader.result;

      // Load Tesseract worker from local files
      const worker = await Tesseract.createWorker({
          langPath: chrome.runtime.getURL('libs/'),
          corePath: chrome.runtime.getURL('libs/tesseract-core.wasm'),
          workerPath: chrome.runtime.getURL('libs/worker.min.js'),
          logger: (m) => console.log(m)  // Logs OCR progress
      });

      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      // Perform OCR
      const { data: { text } } = await worker.recognize(image);
      await worker.terminate();

      // Display extracted text
      document.getElementById("outputText").value = text;

      // Save to Chrome extension storage
      chrome.storage.local.set({ extractedText: text }, function () {
          console.log("Text saved in extension storage.");
          chrome.runtime.sendMessage({ action: "showNotification", text });
      });
  };

  reader.readAsDataURL(file);
});

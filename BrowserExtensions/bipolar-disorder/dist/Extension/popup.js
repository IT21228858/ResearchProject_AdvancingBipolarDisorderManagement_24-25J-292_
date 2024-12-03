document.addEventListener("DOMContentLoaded", () => {
    const downloadButton = document.getElementById("downloadLog");
    const clearButton = document.getElementById("clearLog");
    const audiobutton = document.getElementById('toggleRecording');
    // Download Log
    if (downloadButton) {
        downloadButton.addEventListener("click", () => {
            chrome.storage.local.get("logData", (data) => {
                const logContent = data.logData || "No log data found";
                
                const blob = new Blob([logContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                
                chrome.downloads.download({
                    url: url,
                    filename: "search_activity_log.txt",
                    conflictAction: "uniquify"
                }, () => {
                    if (chrome.runtime.lastError) {
                        console.error("Download failed:", chrome.runtime.lastError.message);
                    } else {
                        console.log("Log downloaded successfully.");
                    }
                    URL.revokeObjectURL(url);
                });
            });
        });
    } else {
        console.error("Download button not found.");
    }

    // Clear Log
    if (clearButton) {
        clearButton.addEventListener("click", () => {
            chrome.storage.local.remove("logData", () => {
                console.log("Log data cleared.");
                alert("Log data has been reset.");
            });
        });
    } else {
        console.error("Clear button not found.");
    }
    if (audiobutton) {
        audiobutton.addEventListener("click", () => {
            chrome.runtime.sendMessage({ type: 'toggle-recording' });
        });
    } else {
        console.error("Clear button not found.");
    }
   
    
});

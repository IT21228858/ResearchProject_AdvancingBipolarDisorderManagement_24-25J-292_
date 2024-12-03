const registerEventListeners = () => {     
   
      
    const audioTabs = new Set();

    async function checkAudioActivity() {
      const tabs = await chrome.tabs.query({});
      tabs.forEach(async tab => {
        if (tab.audible && !audioTabs.has(tab.id)) {
          // Tab just started playing audio
          audioTabs.add(tab.id);                 
          const existingContexts = await chrome.runtime.getContexts({});
          let recording = false;
          const offscreenDocument = existingContexts.find(
                (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
            );
            // If an offscreen document is not already open, create one.
            if (!offscreenDocument) {
                // Create an offscreen document.
                await chrome.offscreen.createDocument({
                    url: 'offscreen.html',
                    reasons: ['USER_MEDIA'],
                    justification: 'Recording from chrome.tabCapture API'
                });
            } else {
                recording = offscreenDocument.documentUrl.endsWith('#recording');
            }
            if (recording) {
                chrome.runtime.sendMessage({
                type: 'stop-recording',
                target: 'offscreen'
            });
                return;
            }
            // Get a MediaStream for the active tab.
            try {
                const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });
                  
                // Send the stream ID to the offscreen document to start recording.
                chrome.runtime.sendMessage({
                    type: 'start-recording',
                    target: 'offscreen',
                    data: streamId
                });
                  
            } catch (error) {
                console.log("Error capturing tab:", error);
                chrome.runtime.sendMessage({
                    type: 'user-gesture',
                    target: 'offscreen',
                });
            }
       
        } else if (!tab.audible && audioTabs.has(tab.id)) {
          // Tab stopped playing audio
          if (await isTabPlayingAudio(tab.id) === false) {
            audioTabs.delete(tab.id);
            chrome.runtime.sendMessage({
              type: 'stop-recording',
              target: 'offscreen'
            });
          }
        }
      });
    }
    // Helper function to confirm if a tab is playing audio
    async function isTabPlayingAudio(tabId) {
        const tab = await chrome.tabs.get(tabId);
        return tab.audible;
  }
  
    // Check for audio activity every second
    setInterval(checkAudioActivity, 1000);
      
    // Additionally, keep the existing onUpdated listener if you still need it for other tasks
    chrome.tabs.onUpdated.addListener(async(tabId, changeInfo, tab) => {
        if (changeInfo.url) {
            // If the tab has a new URL
            if (tab.url.startsWith("http")) {
                console.log("Testing Perpeses Only")
                
            } 
            if (tab.url.startsWith("https://www.google.lk/search?")){
                console.log("ok")
                chrome.webNavigation.onCompleted.addListener(
                    function () {
                        chrome.tabs.sendMessage(tabId, { action: "getSearchResults" }, (response) => {
                            if (response && response.term) {
                                const searchTerm = response.term || "No search term provided";
                                appendToAPISearch(searchTerm)
                            }
                            else{
                                console.warn("No response from content script.");
                            }
                        });
                    },
                    { url: [{ schemes: ["http", "https"] }] }
                );
            }
            if (!tab.url.startsWith("https://www.google.")){
                chrome.webNavigation.onCompleted.addListener(
                    function () {
                        chrome.tabs.sendMessage(tabId, { action: "getPageContent" }, (response) => {
                            if (response && response.content) {
                                appendToAPIContent(response.content)
                                // appendToLogFile(`\n------------------------------------------\n${response.content}`);
                            }
                            else{
                                console.warn("No response from content script.");
                            }
                        });
                    },
                    { url: [{ schemes: ["http", "https"] }] }
                );
            }        
        }
    });
    
        
      
};

function appendToAPISearch(content){
    fetch('http://127.0.0.1:5000/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Term:"SearchQuary",
            searchTerm: content,
        })
    })
    .then(response => response.json())
    .then(data => console.log("Response from Python API:", data))
    .catch(error => console.error('Error:', error));
}
function appendToAPIContent(content){
    fetch('http://127.0.0.1:5000/api/data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            Term: 'VisitPageContents',
            contentdata: content,
        })
    })
    .then(response => response.json())
    .then(data => console.log("Response from Python API:", data))
    .catch(error => console.error('Error:', error));
}          
 


(() => {
    registerEventListeners();
})();

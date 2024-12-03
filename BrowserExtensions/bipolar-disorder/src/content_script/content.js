const registerEventListeners = () => {
    console.log("Content script loaded and running...");
    
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "getPageContent") {
            let pageContent = '';
            const mainElement = document.querySelector('article');
        
            // Define a regex pattern to match common copyright texts
            const copyrightPattern = /©.*?(\n|$)|Copyright.*?(\n|$)|\*Note:.*?(\n|$)/g;
        
            if (mainElement) {
                // Remove all span and footer elements before getting innerText
                const spans = mainElement.querySelectorAll('span');
                const footers = mainElement.querySelectorAll('footer');
                const links = mainElement.querySelectorAll('a');
                
                spans.forEach(span => span.remove());
                footers.forEach(footer => footer.remove());
                links.forEach(link => link.remove()); // Remove <a> tags
        
                pageContent = mainElement.innerText;
            } else {
                const paragraphs = Array.from(document.body.querySelectorAll('p'));
        
                // Collect text from paragraphs excluding any span, footer, and <a> elements
                pageContent = paragraphs.map(p => {
                    // Remove span, footer, and <a> elements within each paragraph
                    const spans = p.querySelectorAll('span');
                    const footers = p.querySelectorAll('footer');
                    const links = p.querySelectorAll('a');
                    
                    spans.forEach(span => span.remove());
                    footers.forEach(footer => footer.remove());
                    links.forEach(link => link.remove()); // Remove <a> tags
        
                    return p.innerText;
                }).join('\n');
            }
        
            // Remove unwanted copyright lines using the regex pattern
            pageContent = pageContent.replace(copyrightPattern, '').trim();
        
            // Optionally, remove any extra whitespace or new lines
            pageContent = pageContent.replace(/\n\s*\n/g, '\n').trim();
        
            sendResponse({ content: pageContent });
        }
        
        
        
        if (request.action === "getSearchResults") {
            console.log("Capturing search results...");
            const searchTerm = document.querySelector('input[name="q"]') ? document.querySelector('input[name="q"]').value : "No search term found";
            sendResponse({ term: searchTerm});
            return true;
        }     
    });
    // Trigger the capture function when the page is fully loaded
    window.addEventListener('load', () => {
        console.log("Page loaded.");
    });
};

// Execute the registerEventListeners function
(() => {
    registerEventListeners();
})();

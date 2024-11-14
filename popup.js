document.getElementById("enableButton").addEventListener("click", () => {
    chrome.storage.local.set({ isEnabled: true }, () => {
        console.log("Form Tool isEnabled set to true from popup");
        alert("Form Tool has been enabled.");
    });
});

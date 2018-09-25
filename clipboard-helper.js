// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
// https://github.com/mdn/webextensions-examples/blob/ec731d4ceee1df0ccdebd87ab9f95875f55eeee7/context-menu-copy-link-with-types/clipboard-helper.js
function copyToClipboard(text) {
    function oncopy(event) {
        document.removeEventListener("copy", oncopy, true);
        // Hide the event from the page to prevent tampering.
        event.stopImmediatePropagation();

        // Overwrite the clipboard content.
        event.preventDefault();
        event.clipboardData.setData("text/plain", text);
    }
    document.addEventListener("copy", oncopy, true);

    // Requires the clipboardWrite permission, or a user gesture:
    document.execCommand("copy");
}

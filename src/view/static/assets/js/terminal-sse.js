(function() {
    const terminalScreenList = document.querySelectorAll('[data-terminal-sse]');
    terminalScreenList.forEach(function(terminalScreen) {
        const terminalContainer = terminalScreen.closest('.terminal-container');
        const sseLogs = terminalScreen.dataset.terminalSse;

        const eventSource = new EventSource(`${sseLogs}`, {
            withCredentials: true
        });
        eventSource.addEventListener('open', function (e) {
            appendLog('success', "The connection to the server was established.");
        });

        eventSource.addEventListener('stdout', function (event) {
            appendLog('stdout', JSON.parse(event.data));
        });
        eventSource.addEventListener('stderr', function (event) {
            appendLog('stderr', JSON.parse(event.data));
        });
        eventSource.addEventListener('done', function (event) {
            appendLog('success', JSON.parse(event.data));
            eventSource.close();
        });

        eventSource.addEventListener('error', function (e) {
            appendLog('error', "The connection to the server was lost.");
        });
        function appendLog(type, message) {
            // Only scroll to bottom if we are already at the bottom
            const needScroll = terminalContainer.scrollHeight - terminalContainer.scrollTop === terminalContainer.clientHeight;

            const lineGroup = document.createElement('div');
            lineGroup.classList.add('terminal-log', `terminal-log-${type}`);
            lineGroup.innerHTML = terminalToHtml(message);
            terminalScreen.appendChild(lineGroup);

            if (needScroll) {
                const scrollToBottomEl = document.createElement('div');
                terminalScreen.appendChild(scrollToBottomEl);
                scrollToBottomEl.scrollIntoView();
                scrollToBottomEl.remove();
            }
        }
    })
})();

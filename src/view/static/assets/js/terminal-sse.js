(function() {
    const terminalScreenList = document.querySelectorAll('[data-terminal-sse]');
    terminalScreenList.forEach(function(terminalScreen) {
        const terminalContainer = terminalScreen.closest('.terminal-container');
        const sseLogs = terminalScreen.dataset.terminalSse;

        const eventSource = new EventSource(`${sseLogs}`, {
            withCredentials: true
        });
        eventSource.addEventListener('hello', function (event) {
            appendLog('success', JSON.parse(event.data));
        });

        eventSource.addEventListener('stdout', function (event) {
            appendLog('stdout', JSON.parse(event.data));
        });
        eventSource.addEventListener('stderr', function (event) {
            appendLog('stderr', JSON.parse(event.data));
        });
        eventSource.addEventListener('done', function (event) {
            appendLog('success', JSON.parse(event.data));
        });
        eventSource.addEventListener('close', function (event) {
            eventSource.close();
        });

        eventSource.addEventListener('error', function (event) {
            appendLog('html', `
                <div class="terminal-log terminal-log-stderr my-1 rounded py-3 px-5" style="max-width:100vw;position:sticky;left:0;white-space:initial;">
                    <div class="fs-5 fw-bold">Disconnected</div>
                    <hr>
                    <div class="mb-0">
                        Oh no! It seems that the connection has been lost. We apologize for the inconvenience. Please note that the connection may sometimes be interrupted when the console window is inactive or running in the background.
                        <br>
                        <br>To ensure a stable connection, please follow the steps below:
                        <ul class="mb-0">
                            <li>Keep the console window active: Make sure the console window remains in the foreground and avoid switching to other tabs or minimizing the browser window.</li>
                            <li>Check your internet connection: Verify that you are connected to a stable and reliable network. If necessary, reset your router or switch to a different network.</li>
                        </ul>
                    </div>
                </div>
            `);
            eventSource.close();
        });

        function appendLog(type, message) {
            // Only scroll to bottom if we are already at the bottom
            const needScroll = (terminalContainer.scrollHeight - terminalContainer.scrollTop) < (terminalContainer.clientHeight - 40);

            if(type==='html') {
                const htmlContainer = document.createElement('div');
                htmlContainer.innerHTML = message;
                htmlContainer.querySelectorAll(':scope > *').forEach(function (el) {
                    terminalScreen.appendChild(el);
                });
            } else {
                const lineGroup = document.createElement('div');
                lineGroup.classList.add('terminal-log', `terminal-log-${type}`, 'my-1', 'rounded');
                lineGroup.innerHTML = terminalToHtml(message);
                terminalScreen.appendChild(lineGroup);
            }

            if (needScroll) {
                const scrollToBottomEl = document.createElement('div');
                terminalScreen.appendChild(scrollToBottomEl);
                scrollToBottomEl.scrollIntoView();
                scrollToBottomEl.remove();
            }
        }
    })
})();

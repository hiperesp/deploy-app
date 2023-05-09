export default function sse(request, response, options, callable) {

    options.autoClose = options.autoClose ?? true;
    options.ignorePseudoTerminalStderr = options.ignorePseudoTerminalStderr ?? true;
    options.stderrOnCatch = options.stderrOnCatch ?? true;
    options.sendDoneMessage = options.sendDoneMessage ?? true;
    options.doneMessage = options.doneMessage || 'Done!';

    let eventId = 0;

    const output = (event, output) => {
        if(event=='stderr') {
            if(options.ignorePseudoTerminalStderr) {
                console.log(">"+output+"<");
                if(output=='Pseudo-terminal will not be allocated because stdin is not a terminal.\r\n') {
                    return;
                }
            }
        }
        response.write(`id: ${eventId++}\n`)
        response.write(`event: ${event}\n`)
        response.write(`data: ${JSON.stringify(output)}\n`)
        response.write(`\n`)
    }

    let promise;

    const stdout = (msg) => output('stdout', msg);
    const stderr = (msg) => output('stderr', msg);
    const done = (msg) => output('done', msg || options.doneMessage);
    const close = () => {
        output('close', 'Connection closed');
        response.end();
    }

    promise = callable({stdout, stderr, done, close});
    if(options.stderrOnCatch) promise.catch(exception => stderr(exception.message));
    promise.finally(function() {
        if(options.sendDoneMessage) done();
        if(options.autoClose) close();
    });

    return promise;
}
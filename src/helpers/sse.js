export default function sse(request, response, options, callable) {

    options.autoClose = options.autoClose ?? true;
    options.ignorePseudoTerminalStderr = options.ignorePseudoTerminalStderr ?? true;
    options.stderrOnCatch = options.stderrOnCatch ?? true;
    options.sendDoneMessage = options.sendDoneMessage ?? true;
    options.doneMessage = options.doneMessage || 'Done!';
    options.hideHelloMessage = options.hideHelloMessage ?? false;

    let eventId = 0;

    const output = (event, output) => {
        if(event=='stderr') {
            if(options.ignorePseudoTerminalStderr) {
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

    const hello = () => output('hello', 'Connection established');
    const stdout = (msg) => output('stdout', msg);
    const stderr = (msg) => output('stderr', msg);
    const done = (msg) => output('done', msg || options.doneMessage);
    const close = () => {
        output('close', 'Connection closed');
        response.end();
    }

    if(!options.hideHelloMessage) hello();

    const promise = new Promise(function(resolve, reject) {
        resolve(callable({stdout, stderr, done, close}));
    })
    .catch(exception => {
        if(options.stderrOnCatch) {
            stderr(exception.message)
        }
    })
    .finally(function() {
        if(options.sendDoneMessage) done();
        if(options.autoClose) close();
    });

    return promise;
}
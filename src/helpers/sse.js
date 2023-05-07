export default function sse(response, options, callable) {

    options.stderrOnCatch = options.stderrOnCatch ?? true;
    options.doneOnFinish = options.doneOnFinish ?? true;
    options.doneMessage = options.doneMessage || 'Done!';

    let eventId = 0;

    const output = (event, output) => {
        response.write(`id: ${eventId++}\n`)
        response.write(`event: ${event}\n`)
        response.write(`data: ${JSON.stringify(output)}\n`)
        response.write(`\n`)
    }

    const stdout = (msg) => output('stdout', msg);
    const stderr = (msg) => output('stderr', msg);
    const done = (msg) => {
        output('done', msg || options.doneMessage);
        response.end();
    }


    const promise = callable({stdout, stderr, done});
    if(options.stderrOnCatch) promise.catch(stderr);
    if(options.doneOnFinish) promise.finally(done);

    return promise;
}
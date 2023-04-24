export default class App {
    readonly name: string;

    readonly proxyPorts;
    readonly domains;
    readonly psScale;
    readonly ssl;

    readonly lastRefreshTime = 0;

    constructor(name: string) {
        this.name = name;
    }

    
}
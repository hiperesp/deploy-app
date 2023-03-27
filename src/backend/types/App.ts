type App = {
    name: string;

    domains: string[];

    proxyPorts: string[];
    
    scaleWeb: number;
    scaleWorker: number;

    // sudo dokku ps:scale og-preview
    // -----> Scaling for og-preview
    // proctype: qty
    // --------: ---
    // web:  2
    // worker: 0

}

export default App
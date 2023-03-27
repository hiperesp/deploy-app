type AppContainer = {
    readonly id: string;                // json.ID

    readonly name: string;              // json.Name.split('.')[0]
    readonly service: string;           // json.Name.split('.')[1]
    readonly instance: number;          // parseInt(json.Name.split('.')[2])

    readonly cpuUsage: number;              // parseFloat(json.CPUPerc.replace('%', '')
    readonly memoryUsage: {
        readonly current: number;           // parseFloat(json.MemUsage.split('/')[0].replace(/[^0-9\.]/g, '')
        readonly max: number;               // parseFloat(json.MemUsage.split('/')[1].replace(/[^0-9\.]/g, '')
    };
    readonly diskUsage: {
        readonly input: number;           // parseFloat(json.BlockIO.split('/')[0].replace(/[^0-9\.]/g, '')
        readonly output: number;            // parseFloat(json.BlockIO.split('/')[1].replace(/[^0-9\.]/g, '')
    };
    readonly networkUsage: {
        readonly download: number;          // parseFloat(json.NetIO.split('/')[0].replace(/[^0-9\.]/g, '')
        readonly upload: number;            // parseFloat(json.NetIO.split('/')[1].replace(/[^0-9\.]/g, '')
    };

    // sudo docker stats --no-stream --format="{{ json . }}"
    // {
    //     "BlockIO": "76.3MB / 2.12MB",
    //     "CPUPerc": "0.00%",
    //     "Container": "710d6bd77379",
    //     "ID": "710d6bd77379",
    //     "MemPerc": "0.25%",
    //     "MemUsage": "45.08MiB / 17.53GiB",
    //     "Name": "whatsapp-js-flow.web.1",
    //     "NetIO": "4.26MB / 23.3kB",
    //     "PIDs": "23"
    // }
}
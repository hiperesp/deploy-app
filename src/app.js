import express from 'express'
import nunjucks from 'nunjucks'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

import System from './model/System.js';

dotenv.config({path: process.cwd() + '/.env'})

const app = express()

// Configurar o Express para receber dados do formulário via POST
app.use(express.urlencoded({extended: true}))

// Configurar pasta de assets estáticos
app.use(express.static('view/static'));

// Configurar o Nunjucks como mecanismo de visualização padrão do Express
app.set('view engine', 'njk')

// Configurar a pasta onde estão armazenados os templates do Nunjucks
nunjucks.configure('view', {
    autoescape: true,
    express: app
})

// Configurar o cookie parser
app.use(cookieParser())

// Configurar o middleware de autenticação
app.use((request, response, next) => {
    if(!process.env.AUTH_USER || !process.env.AUTH_PASSWORD) {
        response.status(500).send('Missing authentication credentials in .env file: AUTH_USER and AUTH_PASSWORD')
        return
    }

    if(request.path === '/login') {
        next()
        return
    }

    const authData = {
        username: request.cookies?.username,
        password: request.cookies?.password,
    }

    if(authData.username === process.env.AUTH_USER && authData.password === process.env.AUTH_PASSWORD) {
        next()
        return
    }

    response.status(401).render('pages/login.njk', {
        originalUrl: request.originalUrl,
    })
})

const system = System.instance()

app.post('/login', (request, response) => {
    const authData = {
        username: request.body?.username,
        password: request.body?.password,
    }

    response.cookie('username', authData.username)
    response.cookie('password', authData.password)

    const redirect = request.body?.redirect || '/'
    response.redirect(redirect);
})
app.get('/logout', (request, response) => {
    response.clearCookie('username')
    response.clearCookie('password')
    response.redirect('/');
})

app.get('/', function(request, response) {
    response.render('pages/namespaces.njk', {
        system: system.toJson(),
        namespaces: system.namespaces.map(namespace => namespace.toJson()),
    })
})

app.get('/:namespace', function(request, response) {
    
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const apps = namespace.apps

    response.render('pages/apps.njk', {
        system: system.toJson(),
        namespace: namespace.toJson(),
        apps: apps.map(app => app.toJson())
    })
})

app.get('/:namespace/:app', async function(request, response) {

    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.render('pages/app.njk', {
        system: system.toJson(),
        namespace: namespace.toJson(),
        app: app.toJson(),
        tab: request.query.tab || 'overview',
        subtab: request.query.subtab || 'general',
    })
})

app.post('/:namespace/:app/api/logs-view', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.render('pages/app.njk', {
        system: system.toJson(),
        namespace: namespace.toJson(),
        app: app.toJson(),
        tab: 'api_action_logs',
        data: request.body,
        dataQueryParams: (new URLSearchParams(request.body)).toString(),
    })
});

app.get('/:namespace/:app/api/server-sent-events/actions/scale', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    const webScale = parseInt(request.query?.web)
    const workerScale = parseInt(request.query?.worker)

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await app.scale({
        web: webScale,
        worker: workerScale,
    }, function(output) {
        const dataToSend = {
            "type": "log",
            "data": output,
        }
        response.write(`data: ${JSON.stringify(dataToSend)}\n\n`)
    });

    const dataToSend = {
        "type": "done",
        "data": "Done!",
    }
    response.write(`data: ${JSON.stringify(dataToSend)}\n\n`)
    response.end()
});


app.get('/:namespace/:app/api/server-sent-events/logs/:type', async function(request, response) {
    const updateInterval = Math.min(Math.max(parseInt(request.query?.updateInterval) || 1000, 500), 10000)

    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    let lastSentLogLine = "";
    async function sendLog() {
        const dataToSend = {
            "type": "ping",
        }
        try {
            const log = await app.getLogs(request.params.type)
            const logLines = log.split("\n");
            const newLogLines = logLines.slice(logLines.indexOf(lastSentLogLine) + 1);

            if(newLogLines.length) {
                lastSentLogLine = logLines[logLines.length - 1];
                
                dataToSend.type = "log"
                dataToSend.data = newLogLines.join("\n")
            }
        } catch(e) {
            dataToSend.type = "error"
            dataToSend.data = e.message
        }
        response.write(`data: ${JSON.stringify(dataToSend)}\n\n`)
    }

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    const interval = setInterval(sendLog, updateInterval);sendLog();

    request.on('close', () => {
        clearInterval(interval)
    });
});

// Iniciar o servidor
app.listen(3000, function() {
    console.log('Servidor iniciado na porta 3000')
})

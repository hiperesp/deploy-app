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
        namespace: namespace,
        app: app,
        tab: request.query.tab || 'overview'
    })
})

// Iniciar o servidor
app.listen(3000, function() {
    console.log('Servidor iniciado na porta 3000')
})

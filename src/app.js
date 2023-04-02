import express from 'express'
import nunjucks from 'nunjucks'
import dotenv from 'dotenv'

import System from './model/System.js';

dotenv.config({path: process.cwd() + '/.env'})

const app = express()

// Configurar pasta de assets estáticos
app.use(express.static('view/static'));

// Configurar o Nunjucks como mecanismo de visualização padrão do Express
app.set('view engine', 'njk')

// Configurar a pasta onde estão armazenados os templates do Nunjucks
nunjucks.configure('view', {
    autoescape: true,
    express: app
})

const system = System.instance()

app.get('/', function(request, response) {
    response.render('pages/namespaces.njk', {
        system: system.toJson(),
        namespaces: system.namespaces.map(namespace => namespace.toJson()),
    })
})

app.get('/:namespace', function(request, response) {
    
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    const apps = namespace.apps

    response.render('pages/apps.njk', {
        system: system.toJson(),
        namespace: namespace.toJson(),
        apps: apps.map(app => app.toJson())
    })
})

app.get('/:namespace/:app', async function(request, response) {
    response.render('pages/app.njk', {
        system: system.toJson(),
        namespace: request.params.namespace,
        app: request.params.app,
        tab: request.query.tab || 'overview'
    })
})

// Iniciar o servidor
app.listen(3000, function() {
    console.log('Servidor iniciado na porta 3000')
})

import express from 'express'
import nunjucks from 'nunjucks'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import { createHash } from 'node:crypto';

import System from './model/System.js';
import buildSearchParams from './helpers/buildSearchParams.js';
import sse from './helpers/sse.js';

dotenv.config({path: process.cwd() + '/.env'})

const app = express()

// Configurar o Express para receber dados do formulário via POST
app.use(express.urlencoded({extended: true}))

// Configurar pasta de assets estáticos
app.use(express.static('view/static'));

// Configurar o Nunjucks como mecanismo de visualização padrão do Express
app.set('view engine', 'njk')

// Configurar a pasta onde estão armazenados os templates do Nunjucks
const nunjucksEnv = nunjucks.configure('view', {
    autoescape: true,
    express: app
})

nunjucksEnv.addFilter('friendlyTime', function(time) {
    if(!time) return 'never';
    const now = Date.now();

    const isFuture = time > now;
    const isPast = time < now;
    const relative = (time, scale) => {
        let prefix = '';
        let suffix = ' ago';
        if(isFuture) {
            prefix = 'in ';
            suffix = '';
        }
        return `${prefix}${time} ${scale}${time === 1 ? '' : 's'}${suffix}`;
    }

    if(!isFuture && !isPast) return 'just now';

    const seconds = Math.floor((isFuture ? time - now : now - time) / 1000);
    if(seconds < 10) return relative("few", "second");
    if(seconds < 60) return relative(seconds, "second");

    const minutes = Math.floor(seconds / 60);
    if(minutes < 60) {
        return relative(minutes, "minute");
    }
    const hours = Math.floor(minutes / 60);
    if(hours < 24) {
        return relative(hours, "hour");
    }
    const days = Math.floor(hours / 24);
    if(days < 7) {
        return relative(days, "day");
    }
    const weeks = Math.floor(days / 7);
    if(weeks < 4) {
        return relative(weeks, "week");
    }
    const months = Math.floor(days / 30);
    if(months < 12) {
        return relative(months, "month");
    }
    const years = Math.floor(days / 365);
    return relative(years, "year");
});

nunjucksEnv.addFilter('datetime', function(time, timeZone = 'UTC', language = 'en-US') {
    return (new Date(time)).toLocaleString(language, { timeZone });
});
nunjucksEnv.addFilter('datetimeInput', function(time) {
    return (new Date(time)).toISOString().split('.')[0];
});
nunjucksEnv.addFilter('dateInput', function(time) {
    return (new Date(time)).toISOString().split('T')[0];
});
nunjucksEnv.addFilter('timestamp', function(datetime) {
    return (new Date(datetime)).getTime();
});
nunjucksEnv.addFilter('json', function(string) {
    try {
        return JSON.parse(string);
    } catch(e) {
        return null;
    }
});
nunjucksEnv.addFilter('censorEnv', function(value, key, definitiveReplaceWith = null) {

    const keysMustContainToCensor = [
        "password", "private", "secret"
    ];
    const replaceWith = '%censored%';
    definitiveReplaceWith = definitiveReplaceWith || '<span class="censored" title="Censored for security reasons"></span>';

    const keyLower = key.toLowerCase();

    // censor based on key name
    for(const keyTest of keysMustContainToCensor) {
        if(keyLower.includes(keyTest)) {
            value = replaceWith
        }
    }

    // censor based on value parts
    try {
        value = value.replace(/-{5}BEGIN(?:(?!-)(?:.|[\r\n]))+-----(?:(?!-)(?:.|[\r\n]))+-----END(?:(?!-)(?:.|[\r\n]))+-----/g, replaceWith);
    } catch(e) {}

    value = nunjucksEnv.filters.escape(value);

    while(value.includes(replaceWith)) {
        value = value.replace(replaceWith, definitiveReplaceWith);
    }
    
    //return as safe html
    return nunjucksEnv.filters.safe(value);
});

nunjucksEnv.addFilter('buildSearchParams', buildSearchParams);

nunjucksEnv.addFilter('setAttribute', function(object, key, value) {
    object[key] = value;
    return object;
});
nunjucksEnv.addFilter('objectSize', function(object) {
    return Object.keys(object).length;
});

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
        request.user = {
            username: authData.username,
            gravatar: createHash('md5').update(authData.username).digest('hex'),
        }
        next()
        return
    }

    response.status(401).render('pages/login.njk', {
        originalUrl: request.originalUrl,
    })
})

const system = System.instance()

app.all('/login', (request, response) => {
    const authData = {
        username: request.body?.username,
        password: request.body?.password,
    }

    response.cookie('username', authData.username)
    response.cookie('password', authData.password)

    const redirect = request.body?.redirect || '/'
    response.redirect(redirect);
})
app.all('/logout', (request, response) => {
    response.clearCookie('username')
    response.clearCookie('password')
    response.redirect('/');
})

app.all('/', function(request, response) {
    response.render('pages/system.njk', {
        user: request.user,

        system: system.toJson(),
    })
})

app.all('/:namespace', function(request, response) {
    
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    response.render('pages/namespace.njk', {
        user: request.user,

        system: system.toJson(),
        namespace: namespace.toJson(),

        tab: request.query.tab || 'apps',
        method: request.query.method || 'default',

        body: request.body
    })
})

app.get('/:namespace/api/server-sent-events/actions/new-app', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return namespace.createApp(request.query.name, stdout, stderr);
    })
});

app.get('/:namespace/api/server-sent-events/actions/delete-app', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return namespace.destroyApp(request.query.name, stdout, stderr);
    })
});

app.all('/:namespace/:app', async function(request, response) {

    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.render('pages/app.njk', {
        user: request.user,

        system: system.toJson(),
        namespace: namespace.toJson(),
        app: app.toJson(),

        tab: request.query.tab || 'overview',
        subtab: request.query.subtab || 'general',
        method: request.query.method || 'default',
        id: request.query.id || null,

        body: request.body
    })
})

app.get('/:namespace/:app/api/server-sent-events/actions/scale', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return app.scale(request.query?.process, stdout, stderr);
    })
});

app.get('/:namespace/:app/api/server-sent-events/actions/generate-ssl', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return app.generateSSL(stdout, stderr);
    })
});

app.get('/:namespace/:app/api/server-sent-events/actions/remove-ssl', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return app.removeSSL(stdout, stderr);
    })
});


app.get('/:namespace/:app/api/server-sent-events/logs/:type', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    const method = ({
        "app_logs": "realTimeAppLogs",
        "access_logs": "realTimeAccessLogs",
        "error_logs": "realTimeErrorLogs",
    })[request.params.type];

    if(!method) return response.status(404).send('Log type not found')

    await sse(request, response, {}, function({stdout, stderr, done, close}) {
        return new Promise(async (resolve, reject) => {
            const logging = await app[method](stdout, stderr);
            request.on('close', () => resolve(logging.kill()));
        });
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/save-general-settings', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {
        sendDoneMessage: false
    }, async function({stdout}) {
        const options = {
            autoClose: false,
            hideHelloMessage: true,
        };

        stdout('Saving build settings...');
        await sse(request, response, options, async function({stdout, stderr}) {
            return await app.setBuilder(request.query.builder, stdout, stderr);
        });

        stdout('Saving git settings...');
        await sse(request, response, options, async function({stdout, stderr}) {
            return await app.configSet({
                noRestart: true,
                config: {
                    "DEPLOY_APP_GIT": JSON.stringify({
                        "REPO": request.query.gitRepo,
                        "REF": request.query.gitRef,
                    }),
                }
            }, stdout, stderr);
        });
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/new-environment-variable', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return await app.configSet({
            noRestart: request.query.restart != 'true',
            config: {
                [request.query.key]: request.query.value,
            }
        }, stdout, stderr);
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/change-environment-variable', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return await app.configSet({
            noRestart: request.query.restart != 'true',
            config: {
                [request.query.key]: request.query.value,
            }
        }, stdout, stderr);
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/delete-environment-variable', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return await app.configUnset({
            noRestart: request.query.restart != 'true',
            config: [
                request.query.key
            ]
        }, stdout, stderr);
    });
});


app.get('/:namespace/:app/api/server-sent-events/actions/deploy-app', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return await app.deploy(request.query.gitRef, stdout, stderr);
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/restart-app', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return await app.restart(stdout, stderr);
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/save-ports', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {
        sendDoneMessage: false
    }, async function({stdout}) {
        const options = {
            autoClose: false,
            hideHelloMessage: true,
        };

        stdout('Saving ports...');
        await sse(request, response, options, async function({stdout, stderr}) {
            return await app.setPorts(request.query.proxyPorts.split(/\r?\n/), stdout, stderr);
        });

        stdout('Exposing all ports...');
        await sse(request, response, options, async function({stdout, stderr}) {
            return await app.setExposeAllPorts(request.query.exposeAllPorts=="true", stdout, stderr);
        });

        if(request.query.restart == 'true') {
            stdout('Restarting app...');
            await sse(request, response, options, async function({stdout, stderr}) {
                return await app.restart(stdout, stderr);
            });
        }
    });
});

app.get('/:namespace/:app/api/server-sent-events/actions/save-domains', async function(request, response) {
    const namespace = system.namespaces.find(namespace => namespace.name === request.params.namespace)
    if(!namespace) return response.status(404).send('Namespace not found')

    const app = namespace.apps.find(app => app.name === request.params.app)
    if(!app) return response.status(404).send('App not found')

    response.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    })

    await sse(request, response, {}, async function({stdout, stderr}) {
        return await app.setDomains(request.query.domains.split(/\r?\n/), stdout, stderr);
    });

});

// Iniciar o servidor
app.listen(3000, function() {
    console.log('Servidor iniciado na porta 3000')
})

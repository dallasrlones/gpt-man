((express, server, bodyParser, { serverState }, actions, { fetchHostIP, saveContextToFile }) => {

    server.use(bodyParser.json());
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(express.static('public'));
    server.use((_req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', '*');
        next();
    });

    server.get('/', (req, res) => {
        res.sendFile('./views/index.html', { root: __dirname });
    });

    server.get('/outline', (_req, res) => {
        res.json(serverState.outline);
    });

    server.get('/context', (_req, res) => {
        res.json({ success: true, context: serverState.context });
    });

    server.get('/memory', (_req, res) => {
        res.json(actions.refreshContext());
    });

    server.put('/context', (req, res) => {
        const context = req.body.context;
        serverState.context += context;
        saveContextToFile(context);
        res.json({ success: true });
    });

    server.post('/context', (req, res) => {
        const context = req.body.context;
        serverState.context = context;
        saveContextToFile(context);
        res.json({ success: true });
    });

    server.get('/next', (_req, res) => {
        if (serverState.queue.length > 0) {
            res.json(serverState.queue.shift());
        } else {
            res.json({ question: null, action: null });
        }
    });

    server.get('/state', (req, res) => {
        res.json({ serverState, gptState: gpt });
    });

    const gpt = {};
    server.post('/state', (req, res) => {
        gpt.state = req.body.state;
        res.json({ success: true });
    });

    server.post('/loadsave', (req, res) => {
        const queue = req.body.queue;
        if (queue != undefined) {
            serverState.queue = queue;
        }
        
        const outline = req.body.outline;
        if (outline != undefined) {
            serverState.outline = outline;
        }
        
        res.json({ success: true });
    });

    server.post('/payload', (req, res) => {
        const action = req.body.action;

        if (actions[action] == undefined) {
            return res.json({ success: false, error: `Action ${action} not found` });
        }

        try {
            actions[action](req.body, () => {
                res.json({ success: true });
            });
        } catch (err) {
            res.json({ success: false, error: err.message });
        }
    });

    server.get('/ip', (req, res) => {
        
        const ip = fetchHostIP();
        res.json({ ip });
    });

    server.listen(1337, err => {
        console.log(err || 'server online')
    });

})(
    require('express'),
    require('express')(),
    require('body-parser'),
    require('./state.js'),
    require('./actions'),
    require('./services/utils')
);
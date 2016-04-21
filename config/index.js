var development = {
    port: 20000,
    log: {
        config: {
            appenders: [
                { type: 'console' },
                { type: 'file', filename: 'mock-service-access.log', 'maxLogSize': 10*1024*1024, 'backups': 1, category: 'access' },
                { type: 'file', filename: 'mock-service-system.log', 'maxLogSize': 1024*1024, 'backups': 1, category: 'system' }
            ],
            replaceConsole: true
        },
        path: '/var/log/nodejs',
        level: 'DEBUG'
    }
},
production = {
    port: 3000,
    log: {
        config: {
            appenders: [
                { type: 'file', filename: 'mock-service-access.log', 'maxLogSize': 500*1024*1024, 'backups': 10, category: 'access' },
                { type: 'file', filename: 'mock-service-system.log', 'maxLogSize': 100*1024*1024, 'backups': 5, category: 'system' }
            ]
        },
        path: '/var/log/nodejs',
        level: 'INFO'
    }
};

if(process.env["NODE_ENV"] === 'production'){
    exports.env = production;
} else {
    exports.env = development;
}

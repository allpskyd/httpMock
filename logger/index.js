var config = require('../config'),
    log4js = require('log4js');

log4js.configure(config.env.log.config, {cwd: config.env.log.path});

var access = log4js.getLogger('access'),
    system = log4js.getLogger('system');

access.setLevel(config.env.log.level);
system.setLevel(config.env.log.level);

exports.log4js = log4js;
exports.access = access;
exports.system = system;
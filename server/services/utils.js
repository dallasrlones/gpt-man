((utils, os, fs, { serverState }) => {

    utils.fetchHostIP = () => {
        const ifaces = os.networkInterfaces();
        let ip = '';
        Object.keys(ifaces).forEach(ifname => {
            ifaces[ifname].forEach(iface => {
                if ('IPv4' !== iface.family || iface.internal !== false) {
                    return;
                }
                ip = iface.address;
            });
        });
        return ip;
    };

    utils.saveContextToFile = (context) => {
        fs.writeFileSync('./context.txt', context);
    };

    utils.updateOutline = () => {
        fs.writeFileSync('./outline.json', JSON.stringify(serverState.outline));
    };

})(module.exports, require('os'), require('fs'), require('../state'));
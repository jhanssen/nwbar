/*global require,module,setInterval*/

const os = require("os");

function guessInterface()
{
    let foundv4 = undefined, foundv6 = undefined;
    const ifaces = os.networkInterfaces();
    for (let iface in ifaces) {
        const data = ifaces[iface];
        for (let n = 0; n < data.length; ++n) {
            if (foundv4 && foundv6)
                break;
            const sub = data[n];
            if (!foundv4 && sub.family == "IPv4") {
                if (!sub.internal && sub.address.length > 0)
                    foundv4 = iface;
            } else if (!foundv6 && sub.family == "IPv6") {
                if (!sub.internal && sub.address.length > 0)
                    foundv6 = iface;
            }
        }
    }
    if (foundv4)
        return { type: "ipv4", iface: foundv4 };
    return { type: "ipv6", iface: foundv6 };
}

module.exports = function(opts, config) {
    const update = config.update || 60000;
    let iface = config.iface || guessInterface();
    if (typeof iface == "string") {
        iface = { type: "ipv4", iface: iface };
    }
    let position = opts.dom.RIGHT;
    if (typeof config.position == "string")
        position = opts.dom.position(config.position);

    const top = opts.document.createElement("div");
    top.setAttribute("id", "network");
    opts.dom.addCSS("#network { margin-left: 5; margin-right: 5; margin-top: 1; margin-bottom: 1; color: #3d3 }");
    const ifaceelem = opts.document.createElement("div");
    top.appendChild(ifaceelem);

    opts.dom.addElement(position, top);

    const updateIface = () => {
        const ifaces = os.networkInterfaces();
        if (iface.iface in ifaces) {
            const data = ifaces[iface.iface];
            for (let n = 0; n < data.length; ++n) {
                const sub = data[n];
                if (sub.family == "IPv4" && iface.type == "ipv4") {
                    ifaceelem.innerHTML = "E: " + sub.address;
                } else if (sub.family == "IPv6" && iface.type == "ipv6") {
                    ifaceelem.innerHTML = "E: " + sub.address;
                }
            }
        } else {
            ifaceelem.innerHTML = "";
        }
    };

    setInterval(updateIface, update);

    updateIface();
};

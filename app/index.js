/*global require, process, nw, Buffer*/

// fix console for modules
require("./consolehack")(console);

const xprop = require("@jhanssen/xprop");
const minimist = require("minimist");
const Configstore = require("configstore");

const conf = new Configstore("nwbar", {}, { globalConfigPath: true });

const domNames = [
    "left", "center", "right"
];

const dom = {
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2,

    addElement: function(position, elem) {
        document.getElementById(domNames[position]).appendChild(elem);
    },

    addCSS: function(...css) {
        if (!css.length || !css[0].length)
            return;
        if (css.length == 1 && css[0][0] == '/' && css[0].indexOf("\n") == -1) {
            // assume file
            const link = document.createElement("link");
            link.setAttribute("rel", "stylesheet");
            link.setAttribute("type", "text/css");
            link.setAttribute("href", css[0]);
            document.getElementsByTagName("head")[0].appendChild(link);
        } else {
            // assume css text
            const style = document.createElement("style");
            style.type = "text/css";
            style.innerHTML = css.join(" ");
            document.getElementsByTagName("head")[0].appendChild(style);
        }
    },

    position: function(w) {
        switch (w) {
        case "center":
            return dom.CENTER;
        case "right":
            return dom.RIGHT;
        }
        return dom.LEFT;
    },

    ready: function(e) {
        e.classList.remove("error");
        e.classList.add("ready");
    },

    error: function(e) {
        e.classList.remove("ready");
        e.classList.add("error");
    }
};

function loadModule(module, opts)
{
    try {
        if (typeof module == "object") {
            const mod = require(module.path);
            mod(opts, module.config || {});
        } else {
            const mod = require(module);
            mod(opts, {});
        }
    } catch (e) {
        console.error(`Can't load module ${module}`);
        console.error(e);
    }
}


function go() {
    const args = minimist(nw.App.argv);
    const w = parseInt(args.width) || 3440;
    const h = parseInt(args.height) || 19;
    if (args.devtools) {
        nw.Window.get().showDevTools();
    }

    const modules = conf.get("modules");
    if (Array.isArray(modules)) {
        for (let i = 0; i < modules.length; ++i) {
            loadModule(modules[i], { dom: dom, document: document });
        }
    } else if (typeof modules == "object" || typeof modules == "string") {
        loadModule(modules, { dom: dom, document: document });
    } else {
        throw "No modules";
    }

    //document.write(w + " " + h + " " + JSON.stringify(args));

    const strutp = Buffer.alloc(12 * 4);
    // for top alignment
    //strutp.writeUInt32LE(h, 2 * 4); // height
    //strutp.writeUInt32LE(w, 9 * 4); // width

    // for bottom alignment
    strutp.writeUInt32LE(h, 3 * 4); // height
    strutp.writeUInt32LE(w, 11 * 4); // width

    xprop.forWindow({ class: "i3-frame.nwbar", data: "unmap" });
    xprop.forWindow({ class: "i3-frame.nwbar", data: "clear" });
    xprop.forWindow({ class: "i3-frame.nwbar", data: { what: "property", property: "_NET_WM_WINDOW_TYPE",
                                                       type: xprop.atoms.ATOM, format: 32, data: "_NET_WM_WINDOW_TYPE_DOCK" } });
    xprop.forWindow({ class: "i3-frame.nwbar", data: { what: "property", property: "_NET_WM_STRUT_PARTIAL",
                                                       type: xprop.atoms.CARDINAL, format: 32, data: strutp } });
    xprop.forWindow({ class: "i3-frame.nwbar", data: { what: "configure", width: w, height: h } });
    xprop.forWindow({ class: "i3-frame.nwbar", data: "map" });
    xprop.start();
}

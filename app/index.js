/*global require, process, nw, Buffer*/

const xprop = require("@jhanssen/xprop");
const minimist = require("minimist");

function go() {
    const args = minimist(nw.App.argv);
    const w = parseInt(args.width) || 3440;
    const h = parseInt(args.height) || 19;

    //document.write(w + " " + h + " " + JSON.stringify(args));

    const strutp = Buffer.alloc(12 * 4);
    // for top alignment
    strutp.writeUInt32LE(h, 2 * 4); // height
    strutp.writeUInt32LE(w, 9 * 4); // width

    // for bottom alignment
    // strut.writeUInt32LE(50, 3 * 4); // height
    // strut.writeUInt32LE(3440, 11 * 4); // width

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

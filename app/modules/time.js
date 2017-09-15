/*global module,require,setInterval*/

const dateformat = require("dateformat");

module.exports = function(opts, config) {
    //console.log(config);

    const update = config.update || 60000;
    const format = config.format || "yyyy-mm-dd hh:MM";
    let position = opts.dom.RIGHT;
    if (typeof config.position == "string")
        position = opts.dom.position(config.position);

    //console.log("wanting to init time", opts);
    const top = opts.document.createElement("div");
    top.setAttribute("id", "time");
    opts.dom.addCSS("#time { margin-left: 5; margin-right: 5; margin-top: 1; margin-bottom: 1; }");
    const time = opts.document.createElement("div");
    top.appendChild(time);

    opts.dom.addElement(position, top);

    setInterval(() => {
        time.innerHTML = dateformat(new Date(), format);
    }, update);

    time.innerHTML = dateformat(new Date(), format);
};

/*global module*/

module.exports = function(opts, config) {
    console.log(config);

    //console.log("wanting to init time", opts);
    const top = opts.document.createElement("div");
    const txt = opts.document.createTextNode("abc");
    top.appendChild(txt);

    const top2 = opts.document.createElement("div");
    top2.setAttribute("id", "foobar");

    opts.dom.addCSS("#foobar { margin-left: 20 }");

    const txt2 = opts.document.createTextNode("def");
    top2.appendChild(txt2);

    opts.dom.addElement(opts.dom.LEFT, top);
    opts.dom.addElement(opts.dom.LEFT, top2);
};

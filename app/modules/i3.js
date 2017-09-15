/*global module,require*/

const I3 = require("@jhanssen/i3");

const workspaces = {
    focused: undefined,
    elements: {}
};

let wselem;

function reselect(opts)
{
    const elems = opts.document.querySelectorAll("#workspace .element");
    elems.forEach(elem => {
        console.log(elem.id, `workspace${workspaces.focused}`);
        if (elem.id == `workspace${workspaces.focused}`) {
            elem.classList.add("selected");
        } else {
            elem.classList.remove("selected");
        }
    });
}

function recreate(opts)
{
    while (wselem.firstChild) {
        wselem.removeChild(wselem.firstChild);
    }
    for (let k in workspaces.elements) {
        const div = opts.document.createElement("div");
        div.setAttribute("class", "element");
        div.setAttribute("id", `workspace${k}`);
        div.innerHTML = workspaces.elements[k].name;
        console.log(workspaces.elements[k].name);
        wselem.appendChild(div);
    }
}

function init(opts, config)
{
    let position = opts.dom.RIGHT;
    if (typeof config.position == "string")
        position = opts.dom.position(config.position);

    //console.log("wanting to init time", opts);
    wselem = opts.document.createElement("div");
    wselem.setAttribute("id", "workspace");

    opts.dom.addCSS(
        "#workspace { display: flex; }",
        "#workspace .element { padding-right: 5; padding-left: 5; margin-left: 2; background-color: #666; }",
        "#workspace .element.selected { background-color: #33D; font-weight: bold; }"
    );

    opts.dom.addElement(position, wselem);
}

module.exports = function(opts, config) {
    const i3 = new I3();

    init(opts, config);

    i3.open().then(() => {
        console.log("open");
        i3.on("workspace", ws => {
            console.log("ws event", ws);
            const wss = ws.current;
            switch (ws.change) {
            case "init":
                // add
                workspaces.elements[wss.num] = { name: wss.name, output: wss.output, rect: wss.rect };
                recreate(opts);
                break;
            case "empty":
                delete workspaces.elements[wss.num];
                recreate(opts);
                break;
            case "focus":
                workspaces.focused = wss.num;
                break;
            }
            reselect(opts);
        });
        i3.send("GET_WORKSPACES").then(ws => {
            //console.log("all ws", ws);
            for (let i = 0; i < ws.length; ++i) {
                const wss = ws[i];
                workspaces.elements[wss.num] = { name: wss.name, output: wss.output, rect: wss.rect };
                if (wss.focused)
                    workspaces.focused = wss.num;
            }
            recreate(opts);
            reselect(opts);
        });
    }).catch(err => {
        console.error(err);
    });
};

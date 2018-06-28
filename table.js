const makeTable = function (tableElement, properties, matrix) {
    while (tableElement.firstChild) {
        tableElement.removeChild(tableElement.firstChild);
    }


    const thead = tableElement.appendChild(document.createElement("thead"));
    for (let i = 0; i < properties.length; ++i) {
        const tr = thead.appendChild(document.createElement("th"));
        tr.innerHTML = properties[i].name;
    }

    const tbody = tableElement.appendChild(document.createElement("tbody"));
    for (let i = 0; i < matrix.length; ++i) {
        const tr = tbody.appendChild(document.createElement("tr"));
        for (let j = 0; j < matrix[i].length; ++j) {
            const td = tr.appendChild(document.createElement("td"));
            td.innerHTML = matrix[i][j].toString();
        }
    }
};

function makeVector(tableElement, properties, vector, w, b, statuses) {
    while (tableElement.firstChild) {
        tableElement.removeChild(tableElement.firstChild);
    }

    const thead = tableElement.appendChild(document.createElement("thead"));
    let tr = thead.appendChild(document.createElement("th"));
    tr.innerHTML = "Property Name";

    tr = thead.appendChild(document.createElement("th"));
    tr.innerHTML = "Current Value";

    tr = thead.appendChild(document.createElement("th"));
    tr.innerHTML = "Next Value";

    const tbody = tableElement.appendChild(document.createElement("tbody"));
    for (let i = 0; i < vector.length; ++i) {
        const tr = tbody.appendChild(document.createElement("tr"));
        tr.appendChild(document.createElement("td")).innerHTML = properties[i].name;
        tr.appendChild(document.createElement("td")).innerHTML = vector[i].toString();
        const ele = tr.appendChild(document.createElement("td"));
        const nextVec = nextVector(vector, w, b, statuses);
        ele.innerHTML = nextVec[i].toString();

        const ii = i;
        Tipped.create(ele, function(_element) {
            // Table Head
            const tb = $("<table></table>");
            tb.append($("<thead><tr><th>Name</th><th>Contribution(Prev x Index)</th></tr></thead>"));
            const tbody = $("<tbody></tbody>");
            tb.append(tbody);
            // Table for status b
            for (const st of statuses) {
                if (st["deltaB"][ii] !== 0) {
                    tbody.append($(`<tr><td>${st.name}</td><td>${st["deltaB"][ii]}</td></tr>`))
                }
            }

            // Table for w
            let sArr = [];
            for (let j = 0; j < vector.length; ++j) {
                for (let iSt = 0; iSt < statuses.length; ++iSt) {
                    const v = statuses[iSt]["deltaW"][ii][j];
                    if (v !== 0) {
                        sArr.push(iSt);
                    }
                }

                let s = "";
                let d = w[ii][j]*vector[j];
                if (sArr.length === 0) {
                    s = w[ii][j].toString();
                } else {
                    s = sArr.map(x => `${statuses[x]["deltaW"][ii][j]}(${statuses[x].name})`).join(" + ");
                    s = `(${w[ii][j]} + ${s})`;
                    d += math.sum(sArr.map(x => statuses[x]["deltaW"][ii][j] * vector[j]));
                }
                if (d !== 0) {
                    const wtf = `<tr><td>${properties[j].name}</td><td>${vector[j]} x ${s} = ${d}</td></tr>`;
                    tbody.append($(wtf));
                    console.log(wtf);
                }
            }
            // Table for b
            if (b[ii] !== 0) {
                tbody.append($(`<tr><td>Per-turn</td><td>${b[ii]}</td></tr>`));
            }
            return tb;
        }, {cache: false});
    }
}

function makeStatus(tableElement) {
    $(tableElement).empty();
    $(tableElement).append($("<thead><tr><th>Name</th><th>Rounds Remaining</th></tr></thead>"));
    const tbody = $(tableElement).append($("<tbody></tbody>"));
    for (const status of currentStatus) {
        const tr = $("<tr></tr>");
        tbody.append(tr);
        tr.append($(`<td>${status.name}</td>`));
        tr.append($(`<td>${status.duration}</td>`))
    }
}

const matrixTable = document.getElementById("matrixTable");
const statusTable = document.getElementById("statusTable");


let properties = [];
let currentVector = [];
let currentW = [];
let currentB = [];
let actions = [];
let currentStatus = [];

function nextVector(v, w, b, sts) {
    let ww = deepCopy(w);
    let bb = deepCopy(b);
    for (let st of sts) {
        ww = math.add(ww, st["deltaW"]);
        bb = math.add(bb, st["deltaB"]);
    }
    return math.add(math.multiply(ww, v), bb);
}

function nextRound() {
    currentVector = nextVector(currentVector, currentW, currentB, currentStatus);
    const newStatus = [];
    for (let st of currentStatus) {
        st.duration--;
        if (st.duration > 0) {
            newStatus.push(st);
        }
    }
    currentStatus = newStatus;
}

function flushUI() {
    makeVector(matrixTable, properties, currentVector, currentW, currentB, currentStatus);
    makeStatus(statusTable, currentStatus);
}

function checkStatusCondition(status, currentX) {
    const result = math.add(math.multiply(status.condition["w"], currentX), status.condition["b"]);
    let sum = 0;
    for (const item of result) {
        sum += item;
    }
    return sum >= 0;
}

function applyStatus(status) {
    if (checkStatusCondition(status, currentVector)) {
        currentVector = math.add(currentVector, status["deltaX"]);
        currentStatus.push(deepCopy(status));
        return true;
    } else {
        return false;
    }
}

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

$(document).ready(()=> {
    $("#btnNext").click(() => {
        nextRound();
        flushUI();
    });

    fetch("gameSetup.json").
    then((e) => e.json()).
    then((data) => {
        properties = data["properties"];
        currentVector = data["x"];
        currentW = data["w"];
        currentB = data["b"];
        actions = data["actions"];

        flushUI();

        for (const action of actions) {
            const btn = $("<button></button>");
            btn.html(action.name);
            btn.click(function(e) {
                applyStatus(action);
                flushUI();
            });
            $("#actions").append(btn);
        }
    }).
    catch((e) => {
        console.log(e);
    });
});





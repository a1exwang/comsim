game = {
    individuals: [],
};


const AverageROI = 0.1;
const BasicNeed = 1;

const
    Dead = "Dead",
    Poor = "Poor",
    MiddleClass = "MiddleClass",
    Rich = "Rich";

Individual = function() {
    this.name = "";
    this.privateProperties = {};
    this.abilities = {};
    this.needs = {};

    this.getIncomeByAbilities = () => {
        return this.abilities[0];
    };

    this.getIncomeByTrade = () => {
        return this.privateProperties[0] * 0.1 * AverageROI;
    };

    this.getMaxIncome = () => {
        return Math.max(this.getIncomeByAbilities(), this.getIncomeByTrade());
    };

    this.getMinNeed = () => {
        return BasicNeed;
    };

    this.nextRound = () => {
        if (this.determineClass() !== Dead) {
            this.privateProperties[0] += this.getMaxIncome();
            this.privateProperties[0] -= this.needs[0];
        }
    };

    this.determineClass = () => {
        if (this.privateProperties[0] < 0) {
            return Dead;
        }

        if (this.getMaxIncome() <= this.getMinNeed()) {
            return Poor;
        } else {
            if (this.getIncomeByTrade() > this.getIncomeByAbilities()) {
                return Rich;
            } else {
                return MiddleClass;
            }
        }


    };

    return this;
};

game.init = function() {
    let i1 = new Individual();
    i1.name = "i1";
    i1.privateProperties = [1002];
    i1.abilities = [1];
    i1.needs = [10];


    let i2 = new Individual();
    i2.name = "i2";
    i2.privateProperties = [10];
    i2.abilities = [1];
    i2.needs = [1.2];

    this.individuals = [
        i1,
        i2,
    ];
};


game.nextRound = function() {
    for (const ind of this.individuals) {
        ind.nextRound();
    }
    console.log(this);
    this.drawTable();
};

game.drawTable = function () {
    const table = document.getElementById("table");
    const tableRef = document.createElement('tbody');

    for (const ind of game.individuals) {
        const newRow = tableRef.insertRow(tableRef.rows.length);
        newRow.insertCell(newRow.cells.length).appendChild(document.createTextNode(ind.name));
        newRow.insertCell(newRow.cells.length).appendChild(document.createTextNode(ind.privateProperties[0]));
        newRow.insertCell(newRow.cells.length).appendChild(document.createTextNode(ind.abilities[0]));
        newRow.insertCell(newRow.cells.length).appendChild(document.createTextNode(ind.needs[0]));
        newRow.insertCell(newRow.cells.length).appendChild(document.createTextNode(ind.determineClass()));
    }
    table.replaceChild(tableRef, table.tBodies[0]);
};

game.init();
game.drawTable();

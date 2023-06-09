// Element that will be used
const numberColumns = document.getElementById("numberColumns");
const numberRows = document.getElementById("numberRows");
const btnCreateMinesList = document.getElementById("btnCreateMinesList");
const msGameContainer = document.getElementById("msGameContainer");
const pFlagsPossibles = document.getElementById("flagsPossibles");
const pBombsExploded = document.getElementById("bombsExploded");
const divPopOff = document.getElementById("game-state-pop-off");
const btnContinue = document.getElementById("btnContinue");
const btnEndGame = document.getElementById("btnEndGame");

// New Elements
const trBaseElement = document.createElement("tr");
const pBaseElement = document.createElement("p");
pBaseElement.innerHTML = "?";

// Main game class logic
class msGameLogic {
    constructor(params) { this.restartGame(); }
    getMaxRows() { return this.lstMines.length; }
    getMaxColumns() { return this.lstMines[0].length; }
    canRevealSquare(x, y) { return this.lstMines[x][y] !== false; }

    validateIfGameHasEnded() {
        if (this.noBombZonesToDiscover === 0 && this.flagsPossibleInField === 0 &&
            this.bombsFlaged + this.bombsExploded === this.totalNumberOfBombs) {
            this.isGameOver = true;

            if (this.isFlawlessVictory === true && this.funFlawless !== undefined)
                setTimeout(this.funFlawless, 1000);
        }
    }

    restartGame() {
        this.isGameOver = false;
        this.isFirstReveal = true;
        this.isFlawlessVictory = true;
        this.noBombZonesToDiscover = 0;
        this.totalNumberOfBombs = 0;
        this.flagsPossibleInField = 0;
        this.bombsExploded = 0;
        this.bombsFlaged = 0;
        this.funFlawless = undefined;
    }

    addFlag(x, y) {
        if (!this.lstMines[x][y])
            this.bombsFlaged++;

        this.flagsPossibleInField--;
        this.validateIfGameHasEnded();
    }

    removeFlag(x, y) {
        if (!this.lstMines[x][y])
            this.bombsFlaged--;

        this.flagsPossibleInField++;
    }

    initMineList(x, y) {
        this.lstMines = [];
        for (let i = 0; i < x; i++) {
            this.lstMines.push([]);

            for (let j = 0; j < y; j++) {
                let isBomb = Math.round(Math.random() * 100) < 84;
                this.lstMines[i].push(isBomb);

                if (isBomb)
                    this.noBombZonesToDiscover++;
                else
                    this.totalNumberOfBombs++;
            }
        }
        this.flagsPossibleInField = this.totalNumberOfBombs;
    }

    setFirstRevealOfBombs(x, y) {
        if (this.isFirstReveal !== true)
            return

        let bombsToPlace = 0;

        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                if (x + i < 0 || x + i >= this.getMaxRows() ||
                    y + j < 0 || y + j >= this.getMaxColumns())
                    continue;

                if (this.lstMines[x + i][y + j] === false) {
                    bombsToPlace++;
                    this.lstMines[x + i][y + j] = true;
                }
            }

        let buffer = 2;
        let iLimit = buffer;
        let jLimit = buffer * -1;

        while (bombsToPlace > 0) {
            let timesInLoop = 2;
            let change = 1;

            while (bombsToPlace > 0 && timesInLoop > 0) {

                for (let i = iLimit * -1; i <= iLimit && bombsToPlace > 0; i = i + change) {
                    if (x + i < 0 || x + i >= this.getMaxRows() ||
                        y + jLimit < 0 || y + jLimit >= this.getMaxColumns())
                        continue;

                    if (this.lstMines[x + i][y + jLimit] === true) {
                        bombsToPlace--;
                        this.lstMines[x + i][y + jLimit] = false;
                    }
                }

                iLimit *= -1;

                for (let j = jLimit * -1; j <= jLimit && bombsToPlace > 0; j = j + change * -1) {
                    if (x + iLimit < 0 || x + iLimit >= this.getMaxRows() ||
                        y + j < 0 || y + j >= this.getMaxColumns())
                        continue;

                    if (this.lstMines[x + iLimit][y + j] === true) {
                        bombsToPlace--;
                        this.lstMines[x + iLimit][y + j] = false;
                    }
                }

                jLimit *= -1;
                change *= -1;
                timesInLoop--;
            }

            buffer++;
            iLimit = buffer;
            jLimit = buffer * -1;
        }

        this.isFirstReveal = false;
    }

    setNumberSquare(x, y) {
        if (this.lstMines[x][y] !== true)
            return;

        let numberOfBombs = 0;

        for (let i = -1; i <= 1; i++)
            for (let j = -1; j <= 1; j++) {
                if (i == 0 && j == 0 ||
                    x + i < 0 || x + i >= this.getMaxRows() ||
                    y + j < 0 || y + j >= this.getMaxColumns())
                    continue;

                if (this.lstMines[x + i][y + j] === false)
                    numberOfBombs++;
            }
        this.lstMines[x][y] = numberOfBombs;
    }

    validateSquare(x, y) {

        if (this.lstMines[x][y] === false) {
            this.bombsExploded++;
            this.isFlawlessVictory = false;
            this.flagsPossibleInField--;

        } else 
            this.noBombZonesToDiscover--;
        
        this.validateIfGameHasEnded();
        return this.lstMines[x][y];
    }
}

let gameLogic = new msGameLogic();

function addClassFlawlessToSquare({x, y}) {
    const element = document.getElementById("bomb-" + ((x).toString() + "-" + (y).toString()));
    element.classList.add("flawless");
}

function flawlessVictoryAnimation() {
    let lstMinesTmp = [];

    for (let i = 0; i < gameLogic.getMaxRows(); i++)
        for (let j = 0; j < gameLogic.getMaxColumns(); j++)
            if (gameLogic.lstMines[i][j] === false || gameLogic.lstMines[i][j] === true)
                continue;
            else
                lstMinesTmp.push({ x: i, y: j });

    let addClassToSquareInterval = setInterval(takeRandomSquare, 100);

    function takeRandomSquare(){
        if(lstMinesTmp.length === 0){
            clearInterval(addClassToSquareInterval);
            return;
        }

        const index = Math.round(Math.random() * lstMinesTmp.length);
        addClassFlawlessToSquare(lstMinesTmp[index]);
        lstMinesTmp.splice(index, 1);
    };
}

function canSquareRemoveFlag(element) {
    if (element === null || !element.classList.contains("bombSquare") || element.classList.contains("show"))
        return undefined;

    const x = element.x, y = element.y;

    if (element.innerHTML === "🚩") {
        if (gameLogic.canRevealSquare(x, y)) {
            gameLogic.removeFlag(x, y);
            pFlagsPossibles.innerHTML = gameLogic.flagsPossibleInField;
            element.innerHTML = "?";

            return true;
        } else if (!gameLogic.canRevealSquare(x, y))
            return false;
    } else
        return undefined;
}

function recRevealBombSquare(x, y) {
    if (gameLogic.canRevealSquare(x, y)) {
        const element = document.getElementById("bomb-" + ((x).toString() + "-" + (y).toString()));
        canSquareRemoveFlag(element);
        revealBombSquare(element);
    }
    else
        return;
}

function revealBombSquare(element) {
    if (element === null || !element.classList.contains("bombSquare") || element.classList.contains("show") ||
        canSquareRemoveFlag(element) === false)
        return;

    const x = element.x, y = element.y;
    gameLogic.setNumberSquare(x, y);

    if (gameLogic.isGameOver === true && !gameLogic.canRevealSquare(x, y)) {
        element.innerHTML = "💣";
        return;
    }

    const squareValue = gameLogic.validateSquare(x, y);

    let color = "";
    element.innerHTML = squareValue;

    switch (squareValue) {
        case false:
            element.innerHTML = "💥";
            pFlagsPossibles.innerHTML = gameLogic.flagsPossibleInField;
            pBombsExploded.innerHTML = gameLogic.bombsExploded;

            if (gameLogic.bombsExploded === 1)
                divPopOff.classList.add("show");
            break;
        case 0:
            color = "#ccc";
            element.innerHTML = " ";
            break;
        case 1:
            color = "#2222bb"
            break;
        case 2:
            color = "#22bb22"
            break;
        case 3:
            color = "#999900"
            break;
        case 4:
            color = "#aa22ff"
            break;
        case 5:
            color = "#ff2222"
            break;
        case 6:
            color = "#00cccc"
            break;
        case 7:
            color = "#cc4400"
            break;
        case 8:
            color = "#222"
            break;
        default:
            color = "#aaa";
            break;
    }

    element.style.color = color;
    element.classList.add("show");

    if (squareValue === 0) {
        const maxX = gameLogic.getMaxRows(), maxY = gameLogic.getMaxColumns();

        for (let i = -1; i < 2; i++)
            for (let j = -1; j < 2; j++) {
                if (i == 0 && j == 0 ||
                    x + i < 0 || x + i >= maxX ||
                    y + j < 0 || y + j >= maxY)
                    continue;

                recRevealBombSquare(x + i, y + j);
            }
    }
}

function appendBombs() {
    msGameContainer.innerHTML = "";
    for (let i = 0; i < gameLogic.getMaxRows(); i++) {

        const trElement_tmp = trBaseElement.cloneNode(true);

        for (let j = 0; j < gameLogic.getMaxColumns(); j++) {
            const pElement_tmp = pBaseElement.cloneNode(true);

            pElement_tmp.id = "bomb-" + (i.toString() + "-" + j.toString());
            pElement_tmp.classList.add("bombSquare");
            pElement_tmp.x = i;
            pElement_tmp.y = j;

            pElement_tmp.addEventListener("contextmenu", e => e.preventDefault());
            pElement_tmp.addEventListener("mouseup", (e) => {

                if (gameLogic.isGameOver)
                    return;

                const id = e.target.id;
                const x = e.target.x;
                const y = e.target.y;

                switch (e.which) {
                    case 1:
                        if (gameLogic.isFirstReveal)
                            gameLogic.setFirstRevealOfBombs(x, y);

                        revealBombSquare(e.target);
                        break;
                    case 3:
                        if (!e.target.classList.contains("show"))
                            e.target.innerHTML = e.target.innerHTML == "?" ? "🚩" : "?";

                        if (e.target.innerHTML == "?")
                            gameLogic.removeFlag(x, y);
                        else if (e.target.innerHTML == "🚩")
                            gameLogic.addFlag(x, y);

                        pFlagsPossibles.innerHTML = gameLogic.flagsPossibleInField;

                        break
                    default:
                        return;
                }
            });

            trElement_tmp.append(pElement_tmp);
            msGameContainer.append(trElement_tmp);
        }
    }
}

btnCreateMinesList.addEventListener("click", (e) => {
    gameLogic.restartGame();
    gameLogic.initMineList(numberRows.value, numberColumns.value);
    appendBombs();
    gameLogic.funFlawless = flawlessVictoryAnimation;
    pFlagsPossibles.innerHTML = gameLogic.flagsPossibleInField;
    pBombsExploded.innerHTML = gameLogic.bombsExploded;
});

numberColumns.addEventListener("change", (e) => {
    if (numberColumns.value < 8)
        numberColumns.value = "8";
});

numberRows.addEventListener("change", (e) => {
    if (numberRows.value < 8)
        numberRows.value = "8";
});

function showAllGame() {
    if (!gameLogic.isGameOver)
        return;

    for (let i = 0; i < gameLogic.getMaxRows(); i++)
        for (let j = 0; j < gameLogic.getMaxColumns(); j++)
            revealBombSquare(document.getElementById("bomb-" + ((i).toString() + "-" + (j).toString())));
}

function removePopOff() { divPopOff.classList.remove("show"); }

btnContinue.addEventListener("click", removePopOff);
btnEndGame.addEventListener("click", e => {
    gameLogic.isGameOver = true;
    removePopOff();
    showAllGame();
});

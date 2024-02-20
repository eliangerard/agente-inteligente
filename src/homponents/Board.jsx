import { useEffect, useRef, useState } from "react"

const initializeLocation = () => {
    let x, y;
    do {
        x = Math.round(Math.random() * 4);
        y = Math.round(Math.random() * 4);
    } while (x === 0 && y === 0);
    return { x, y }
}

let logs = [];


let timer;

export const Board = () => {
    const divLogs = useRef(null);

    const [turn, setTurn] = useState(0);
    const [gameSpeed, setGameSpeed] = useState(1000);

    const [agl, setAgl] = useState({
        x: 0,
        y: 0,
        score: 0,
    });

    const [treasure, setTreasure] = useState({ x: 0, y: 0 });
    const [well, setWell] = useState({ x: 0, y: 0 });
    const [secondWell, setSecondWell] = useState({ x: 0, y: 0 });
    const [gumpy, setGumpy] = useState({ x: 0, y: 0 });
    const [pause, setPause] = useState(false);


    useEffect(() => {
        let treasure, well, secondWell, gumpy;
        do {
            treasure = initializeLocation()
            well = initializeLocation()
            secondWell = initializeLocation()
            gumpy = initializeLocation()
        } while (treasure.x === well.x && treasure.y === well.y ||
        treasure.x === secondWell.x && treasure.y === secondWell.y ||
        well.x === secondWell.x && well.y === secondWell.y ||
        gumpy.x === treasure.x && gumpy.y === treasure.y ||
        gumpy.x === well.x && gumpy.y === well.y ||
            gumpy.x === secondWell.x && gumpy.y === secondWell.y
        );

        setTreasure(treasure)
        setWell(well)
        setSecondWell(secondWell)
        setGumpy(gumpy)
    }, [])

    useEffect(() => {
        if (pause)
            clearTimeout(timer);
        else
            timer = setTimeout(() => {
                moveAgl()
                if (turn % 2 == 0)
                    moveGumpy();
            }, gameSpeed);
    }, [turn, pause]);

    const addLog = (log) => {
        const date = new Date();
        logs.push(date.toLocaleString() + " - " + log);
        divLogs.current.scrollTop = divLogs.current.scrollHeight;
    }

    const moveAgl = () => {
        let x, y, score = agl.score - 1;
        let moveX = Math.random() > 0.5;

        do {
            x = moveX ? Math.round(Math.random() * 2 - 1) : 0;
            y = moveX ? 0 : Math.round(Math.random() * 2 - 1);
        } while ((x == 0 && y == 0) || (x + agl.x) < 0 || (y + agl.y) < 0 || (x + agl.x) > 4 || (y + agl.y) > 4);

        console.log("Moviendo a: " + (agl.x + x) + ":" + (agl.y + y));
        addLog(`Moviendo a [${agl.x + x}:${agl.y + y}]`);


        if (agl.x + x === treasure.x && agl.y + y === treasure.y) {
            //setTreasure(initializeLocation())
            score += 1000;
            addLog("Encontraste el tesoro");
        }
        if (agl.x + x === well.x && agl.y + y === well.y ||
            agl.x + x === secondWell.x && agl.y + y === secondWell.y) {
            //setWell(initializeLocation())
            score -= 1000;
            addLog("Caiste en un pozo");
        }
        if (agl.x + x === gumpy.x && agl.y + y === gumpy.y) {
            score -= 1000;
            addLog("Te comió Gumpy");
        }

        setAgl(agl => ({
            x: agl.x + x,
            y: agl.y + y,
            score
        }));

        setTurn(turn => turn + 1);
    }

    const moveGumpy = () => {
        let x, y;
        let moveX = Math.random() > 0.5;

        do {
            x = moveX ? Math.round(Math.random() * 2 - 1) : 0;
            y = moveX ? 0 : Math.round(Math.random() * 2 - 1);
        } while ((x == 0 && y == 0) || (x + gumpy.x) < 0 || (y + gumpy.y) < 0 || (x + gumpy.x) > 4 || (y + gumpy.y) > 4);

        console.log("Moviendo a: " + (gumpy.x + x) + ":" + (gumpy.y + y));
        addLog(`Gumpy se movió a [${gumpy.x + x}:${gumpy.y + y}]`);

        setGumpy(gumpy => ({
            x: gumpy.x + x,
            y: gumpy.y + y
        }));
    }

    return (
        <div className="w-screen h-screen">
            <div className="flex justify-between w-screen">
                <div className="w-2/3">
                    {
                        [...Array(5)].map((_, y) => {
                            const rows = [...Array(5)].map((_, x) => {
                                return (
                                    <div key={`${x}:${y}`} className="border-2 border-black w-10 h-10"
                                        style={{
                                            backgroundColor: ((x == agl.x || x == agl.x + 1 || x == agl.x - 1) && (y == agl.y || y == agl.y - 1 || y == agl.y + 1)) ? "green" : (
                                                ((x == gumpy.x || x == gumpy.x + 1 || x == gumpy.x - 1) && (y == gumpy.y || y == gumpy.y - 1 || y == gumpy.y + 1)) ? "red" : "white")
                                        }}
                                    >
                                        {agl.x === x && agl.y === y ? "A" : ""}
                                        {treasure.x === x && treasure.y === y ? "T" : ""}
                                        {well.x === x && well.y === y ? "W" : ""}
                                        {secondWell.x === x && secondWell.y === y ? "W" : ""}
                                        {gumpy.x === x && gumpy.y === y ? "G" : ""}
                                        <button className="w-full h-full" onClick={() => setAgl({ x, y })}></button>
                                    </div>
                                )
                            })
                            return (
                                <div key={`${y}`} className="flex w-fit">
                                    {rows}
                                </div>
                            );
                        })
                    }
                </div>
                <div className="w-1/3">
                    <p>Turno: {turn}</p>
                    <p>Puntaje: {agl.score}</p>
                    <label>Velocidad: {gameSpeed}</label>
                    <input
                        className="border-2 border-black"
                        type="range"
                        min={100}
                        max={2000}
                        value={gameSpeed}
                        onChange={(e) => setGameSpeed(e.target.value)}
                    />
                    <button onClick={() => setPause(!pause)}>{pause ? "Reanudar" : "Pausar"}</button>
                </div>
            </div>
            <div className="h-2/3">
                <h2>Mensajes</h2>
                <div ref={divLogs} className="w-full overflow-y-scroll h-2/3">
                    {
                        logs.map((message, i) => <p className="italic" key={i}>{message}</p>)
                    }
                </div>
            </div>
        </div>
    )
}

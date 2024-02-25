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

let treasure = { x: 0, y: 0 };
let well = { x: 0, y: 0 };
let secondWell = { x: 0, y: 0 };
let gumpy = { x: 0, y: 0 };
let agl = {
	x: 0,
	y: 0,
	score: 0,
};

export const App = () => {
	const tolerance = 100;
	const divLogs = useRef(null);

	const [turn, setTurn] = useState(0);
	const [gameSpeed, setGameSpeed] = useState(1000);
	const [pause, setPause] = useState(false);

	useEffect(() => {
		restart();
	}, [])

	useEffect(() => {
		if (pause)
			clearTimeout(timer);
		else
			timer = setTimeout(() => {
				if (turn % 2 == 0)
					moveGumpy();
				moveAgl();
			}, gameSpeed);
	}, [turn, pause]);

	const addLog = (log, style) => {
		const date = new Date();
		logs.unshift({ content: date.toLocaleString() + " - " + log, style });
	}

	const moveAgl = () => {
		let x, y, score = agl.score - 1;
		let cycles = 0;

		let isGumpyNear = (gumpy.x === agl.x || gumpy.x === agl.x + 1 || gumpy.x === agl.x - 1) && (gumpy.y === agl.y || gumpy.y === agl.y - 1 || gumpy.y === agl.y + 1);
		let isWellNear = (well.x === agl.x || well.x === agl.x + 1 || well.x === agl.x - 1) && (well.y === agl.y || well.y === agl.y - 1 || well.y === agl.y + 1);
		let isSecondWellNear = (secondWell.x === agl.x || secondWell.x === agl.x + 1 || secondWell.x === agl.x - 1) && (secondWell.y === agl.y || secondWell.y === agl.y - 1 || secondWell.y === agl.y + 1);
		let isTreasureNear = (treasure.x === agl.x || treasure.x === agl.x + 1 || treasure.x === agl.x - 1) && (treasure.y === agl.y || treasure.y === agl.y - 1 || treasure.y === agl.y + 1);

		if (isGumpyNear)
			addLog("El agente ha detectado a Gumpy en: " + gumpy.x + ":" + gumpy.y, { color: "#369c36" });

		if (isWellNear)
			addLog("El agente ha detectado un pozo en: " + well.x + ":" + well.y, { color: "#369c36" });

		if (isSecondWellNear)
			addLog("El agente ha detectado un pozo en: " + secondWell.x + ":" + secondWell.y, { color: "#369c36" });

		if (isTreasureNear)
			addLog("El agente ha detectado el tesoro en: " + treasure.x + ":" + treasure.y, { color: "#369c36" });

		do {
			if (cycles > tolerance) {
				addLog("El agente no puede moverse", { color: "#FF0000", fontWeight: "bold" });
				return endGame();
			}

			let moveX;
			let safeMoveToTreasure = isTreasureNear && !(well.x === treasure.x && well.y === treasure.y) && !(secondWell.x === treasure.x && secondWell.y === treasure.y);

			if (safeMoveToTreasure && !isGumpyNear) {
				let deltaX = Math.abs(agl.x - treasure.x);
				let deltaY = Math.abs(agl.y - treasure.y);

				if (deltaX > deltaY) {
					x = agl.x < treasure.x ? 1 : -1;
					y = 0;
				} else if (deltaY > deltaX) {
					x = 0;
					y = agl.y < treasure.y ? 1 : -1;
				} else {
					if (Math.random() > 0.5) {
						x = agl.x < treasure.x ? 1 : -1;
						y = 0;
					} else {
						x = 0;
						y = agl.y < treasure.y ? 1 : -1;
					}
				}
			} else {
				moveX = Math.random() > 0.5;
				x = moveX ? Math.round(Math.random() * 2 - 1) : 0;
				y = moveX ? 0 : Math.round(Math.random() * 2 - 1);
			}

			cycles++;
		} while (
			(x == 0 && y == 0) || (x + agl.x) < 0 || (y + agl.y) < 0 || (x + agl.x) > 4 || (y + agl.y) > 4 ||
			(x + agl.x === well.x && y + agl.y === well.y) || (x + agl.x === secondWell.x && y + agl.y === secondWell.y) ||
			(isGumpyNear && (agl.x < gumpy.x && x > 0 || agl.x > gumpy.x && x < 0 || agl.y < gumpy.y && y > 0 || agl.y > gumpy.y && y < 0) && turn % 2 == 0)
		);

		if (agl.x + x === treasure.x && agl.y + y === treasure.y) {
			score += 1000;
			addLog("¡El agente encontró el tesoro!", { color: "#00AA00", fontWeight: "bold" });
			endGame();
		}
		if (agl.x + x === well.x && agl.y + y === well.y ||
			agl.x + x === secondWell.x && agl.y + y === secondWell.y) {
			score -= 1000;
			addLog("Caiste en un pozo", { fontWeight: "bold" });
			endGame();
		}
		if (agl.x + x === gumpy.x && agl.y + y === gumpy.y) {
			score -= 1000;
			addLog("Te comió Gumpy", { color: "#FF0000", fontWeight: "bold" });
			endGame();
		}

		agl = {
			x: agl.x + x,
			y: agl.y + y,
			score
		};

		setTurn(turn => turn + 1);
	}

	const moveGumpy = () => {
		let x, y;

		let isAglNear = (agl.x === gumpy.x || agl.x === gumpy.x + 1 || agl.x === gumpy.x - 1) && (agl.y === gumpy.y || agl.y === gumpy.y - 1 || agl.y === gumpy.y + 1);
		let isWellNear = (well.x === gumpy.x || well.x === gumpy.x + 1 || well.x === gumpy.x - 1) && (well.y === gumpy.y || well.y === gumpy.y - 1 || well.y === gumpy.y + 1);
		let isSecondWellNear = (secondWell.x === gumpy.x || secondWell.x === gumpy.x + 1 || secondWell.x === gumpy.x - 1) && (secondWell.y === gumpy.y || secondWell.y === gumpy.y - 1 || secondWell.y === gumpy.y + 1);
		let isTreasureNear = (treasure.x === gumpy.x || treasure.x === gumpy.x + 1 || treasure.x === gumpy.x - 1) && (treasure.y === gumpy.y || treasure.y === gumpy.y - 1 || treasure.y === gumpy.y + 1);

		if (isAglNear)
			addLog("Gumpy ha detectado al agente en: " + agl.x + ":" + agl.y, { color: "#5d369c" });

		if (isWellNear)
			addLog("Gumpy ha detectado un pozo en: " + well.x + ":" + well.y, { color: "#5d369c" });

		if (isSecondWellNear)
			addLog("Gumpy ha detectado un pozo en: " + secondWell.x + ":" + secondWell.y, { color: "#5d369c" });

		if (isTreasureNear)
			addLog("Gumpy ha detectado el tesoro en: " + treasure.x + ":" + treasure.y, { color: "#5d369c" });

		let cycles = 0;
		do {
			if (cycles > tolerance) {
				addLog("Gumpy no puede moverse", { color: "#FF0000", fontWeight: "bold" });
				return endGame();
			}

			let moveX = Math.random() > 0.5;
			x = moveX ? Math.round(Math.random() * 2 - 1) : 0;
			y = moveX ? 0 : Math.round(Math.random() * 2 - 1);
			console.log(cycles, "- Gumpy", x, y, `[${gumpy.x + x},${gumpy.y + y}], Turn: ${turn}`);
			cycles++;

			console.log(
				// Expresión para evitar que Gumpy se mantenga quieto y se salga del tablero
				(x == 0 && y == 0) || (x + gumpy.x) < 0 || (y + gumpy.y) < 0 || (x + gumpy.x) > 4 || (y + gumpy.y) > 4,
				// Expresión para evitar que Gumpy entre a los pozos
				(x + gumpy.x === well.x && y + gumpy.y === well.y) || (x + gumpy.x === secondWell.x && y + gumpy.y === secondWell.y),
				// Expresión para que Gumpy se acerque al agente
				(isAglNear && (gumpy.x < agl.x && x < 0 || gumpy.x > agl.x && x > 0 || gumpy.y < agl.y && y < 0 || gumpy.y > agl.y && y > 0) && (
					isWellNear && (well.x == x + gumpy.x && well.y == y + gumpy.y) || isSecondWellNear && (secondWell.x == x + gumpy.x && secondWell.y == y + gumpy.y)
				)),
				//Expresión para que Gumpy evite el tesoro
				(x + gumpy.x === treasure.x && y + gumpy.y === treasure.y)
			);

		} while (
			// Expresión para evitar que Gumpy se mantenga quieto y se salga del tablero
			(x == 0 && y == 0) || (x + gumpy.x) < 0 || (y + gumpy.y) < 0 || (x + gumpy.x) > 4 || (y + gumpy.y) > 4 ||
			// Expresión para evitar que Gumpy entre a los pozos
			(x + gumpy.x === well.x && y + gumpy.y === well.y) || (x + gumpy.x === secondWell.x && y + gumpy.y === secondWell.y) ||
			(isAglNear && (gumpy.x < agl.x && x < 0 || gumpy.x > agl.x && x > 0 || gumpy.y < agl.y && y < 0 || gumpy.y > agl.y && y > 0) && !isWellNear && !isSecondWellNear && !isTreasureNear) ||
			//Expresión para que Gumpy evite el tesoro
			(x + gumpy.x === treasure.x && y + gumpy.y === treasure.y)
		);

		if (!pause)
			gumpy = {
				x: gumpy.x + x,
				y: gumpy.y + y
			};
	}

	const endGame = () => {
		addLog("Fin del juego", { color: "#FF0000", fontWeight: "bold" });
		clearTimeout(timer);
		setPause(true);
	}

	const restart = () => {
		logs = [];
		timer = null;
		agl = { x: 0, y: 0, score: 0 };
		setPause(false);

		do {
			well = initializeLocation()
			secondWell = initializeLocation()
			gumpy = initializeLocation()
			treasure = initializeLocation()
		} while (
			treasure.x === well.x && treasure.y === well.y ||
			treasure.x === secondWell.x && treasure.y === secondWell.y ||
			well.x === secondWell.x && well.y === secondWell.y ||
			gumpy.x === treasure.x && gumpy.y === treasure.y ||
			gumpy.x === well.x && gumpy.y === well.y ||
			gumpy.x === secondWell.x && gumpy.y === secondWell.y
		);
		console.log("well", well, "secondWell", secondWell, "gumpy", gumpy, "treasure", treasure);
		setTurn(1);
	}

	const siguiente = () => {
		agl.x = 0;
		agl.y = 0;

		setPause(false);

		do {
			well = initializeLocation()
			secondWell = initializeLocation()
			gumpy = initializeLocation()
			treasure = initializeLocation()
		} while (
			treasure.x === well.x && treasure.y === well.y ||
			treasure.x === secondWell.x && treasure.y === secondWell.y ||
			well.x === secondWell.x && well.y === secondWell.y ||
			gumpy.x === treasure.x && gumpy.y === treasure.y ||
			gumpy.x === well.x && gumpy.y === well.y ||
			gumpy.x === secondWell.x && gumpy.y === secondWell.y
		);
	}

	return (
		<div className="w-screen h-screen flex flex-col">
			<div className="flex overflow-hidden">
				<div className="flex flex-col justify-center items-center w-1/2 p-20">
					{
						[...Array(5)].map((_, y) => {
							const rows = [...Array(5)].map((_, x) => {
								return (
									<div key={`${x}:${y}`} className="border-2 border-black w-28 h-28 text-4xl flex justify-between align-middle hover:cursor-pointer"
										style={{
											backgroundColor: ((x == agl.x || x == agl.x + 1 || x == agl.x - 1) && (y == agl.y || y == agl.y - 1 || y == agl.y + 1)) ? "#369c36" : (
												((x == gumpy.x || x == gumpy.x + 1 || x == gumpy.x - 1) && (y == gumpy.y || y == gumpy.y - 1 || y == gumpy.y + 1)) ? "#5d369c" : "white")
										}}
										onClick={() => agl = { ...agl, x, y }}
									>
										<div className="flex justify-center items-center w-full">
											<p className="text-center">
												{agl.x === x && agl.y === y ? "🤖" : ""}
												{treasure.x === x && treasure.y === y ? "🎁" : ""}
												{well.x === x && well.y === y ? "🌀" : ""}
												{secondWell.x === x && secondWell.y === y ? "🌀" : ""}
												{gumpy.x === x && gumpy.y === y ? "👹": ""}
											</p>
										</div>
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
				<div className="w-1/2 flex flex-col p-20">
					<div className="flex flex-col p-4 bg-gray-200">
						<div className="mb-4">
							<p className="font-bold text-lg text-blue-600">Turno: {turn}</p>
							<p className="font-bold text-lg text-green-600">Puntaje: {agl.score}</p>
						</div>
						<div className="mb-4">
							<label className="font-bold text-orange-500 block mb-2">Velocidad:</label>
							<input
								className="w-full border-2 border-black"
								type="range"
								min={100}
								max={2000}
								value={gameSpeed}
								onChange={(e) => setGameSpeed(e.target.value)}
							/>
							<p className="text-center font-bold">{gameSpeed}</p>
						</div>
					</div>
					<div className="flex justify-around p-4">
						<button onClick={() => setPause(!pause)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300">{pause ? "Reanudar" : "Pausar"}</button>
						<button onClick={restart} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300">Reiniciar</button>
						<button onClick={siguiente} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition duration-300">Siguiente</button>
					</div>
					<h2 className="p-4">Mensajes</h2>
					<div className="flex-1 overflow-y-auto">
						<div ref={divLogs} className="w-full flex flex-col-reverse bg-zinc-200">
							{
								logs.map((message, i) => <p className="italic" style={message.style} key={i}>{message.content}</p>)
							}
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App;
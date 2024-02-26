/*
Integrantes
Arturo Misael Álvarez Gutiérrez 	20550369
Adrián Corral Quezada				20550363
Elian Ramiro Gerard Ramos			20550362
Jesús Adán Salazar Campos			20550365
*/
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

	const [zoom, setZoom] = useState(0.8);

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
				setTurn(turn => turn + 1);
			}, gameSpeed);
	}, [turn, pause]);
	//Funcion para añadir un log
	const addLog = (log, style) => {
		const date = new Date();
		logs.unshift({ content: date.toLocaleString() + " - " + log, style });
	}
	//Función para mover el Agente Inteligente
	const moveAgl = () => {
		let x, y, score = agl.score - 1;
		let cycles = 0;
		//Variales de control del agente
		let isGumpyNear = (gumpy.x === agl.x || gumpy.x === agl.x + 1 || gumpy.x === agl.x - 1) && (gumpy.y === agl.y || gumpy.y === agl.y - 1 || gumpy.y === agl.y + 1);
		let isWellNear = (well.x === agl.x || well.x === agl.x + 1 || well.x === agl.x - 1) && (well.y === agl.y || well.y === agl.y - 1 || well.y === agl.y + 1);
		let isSecondWellNear = (secondWell.x === agl.x || secondWell.x === agl.x + 1 || secondWell.x === agl.x - 1) && (secondWell.y === agl.y || secondWell.y === agl.y - 1 || secondWell.y === agl.y + 1);
		let isTreasureNear = (treasure.x === agl.x || treasure.x === agl.x + 1 || treasure.x === agl.x - 1) && (treasure.y === agl.y || treasure.y === agl.y - 1 || treasure.y === agl.y + 1);
		//Añadir logs del agente
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
			//Expresion para saber si el agente puede ir por el tesoro
			let safeMoveToTreasure = isTreasureNear && !(
				(agl.x === treasure.x - 1 && agl.y === treasure.y - 1) && (well.x === treasure.x - 1 && well.y === treasure.y) && (secondWell.x === treasure.x && secondWell.y === treasure.y - 1) || // Esquina superior izquierda
				(agl.x === treasure.x + 1 && agl.y === treasure.y - 1) && (well.x === treasure.x && well.y === treasure.y - 1) && (secondWell.x === treasure.x + 1 && secondWell.y === treasure.y) || // Esquina superior derecha
				(agl.x === treasure.x - 1 && agl.y === treasure.y + 1) && (well.x === treasure.x - 1 && well.y === treasure.y) && (secondWell.x === treasure.x && secondWell.y === treasure.y + 1) || // Esquina inferior izquierda
				(agl.x === treasure.x + 1 && agl.y === treasure.y + 1) && (well.x === treasure.x && well.y === treasure.y + 1) && (secondWell.x === treasure.x + 1 && secondWell.y === treasure.y) || // Esquina inferior derecha
				(agl.x === treasure.x - 1 && agl.y === treasure.y - 1) && (secondWell.x === treasure.x - 1 && secondWell.y === treasure.y) && (well.x === treasure.x && well.y === treasure.y - 1) || // Esquina superior izquierda
				(agl.x === treasure.x + 1 && agl.y === treasure.y - 1) && (secondWell.x === treasure.x && secondWell.y === treasure.y - 1) && (well.x === treasure.x + 1 && well.y === treasure.y) || // Esquina superior derecha
				(agl.x === treasure.x - 1 && agl.y === treasure.y + 1) && (secondWell.x === treasure.x - 1 && secondWell.y === treasure.y) && (well.x === treasure.x && well.y === treasure.y + 1) || // Esquina inferior izquierda
				(agl.x === treasure.x + 1 && agl.y === treasure.y + 1) && (secondWell.x === treasure.x && secondWell.y === treasure.y + 1) && (well.x === treasure.x + 1 && well.y === treasure.y) // Esquina inferior derecha				
			);

			console.log("Safe",
				(agl.x === treasure.x - 1 && agl.y === treasure.y - 1) && (well.x === treasure.x - 1 && well.y === treasure.y) && (secondWell.x === treasure.x && secondWell.y === treasure.y - 1),
				(agl.x === treasure.x + 1 && agl.y === treasure.y - 1) && (well.x === treasure.x && well.y === treasure.y - 1) && (secondWell.x === treasure.x + 1 && secondWell.y === treasure.y),
				(agl.x === treasure.x - 1 && agl.y === treasure.y + 1) && (well.x === treasure.x - 1 && well.y === treasure.y) && (secondWell.x === treasure.x && secondWell.y === treasure.y + 1),
				(agl.x === treasure.x + 1 && agl.y === treasure.y + 1) && (well.x === treasure.x && well.y === treasure.y + 1) && (secondWell.x === treasure.x + 1 && secondWell.y === treasure.y)
			);

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
			//Expresion para que el agente no se quede inmovil ni se salga el tablero
			(x == 0 && y == 0) || (x + agl.x) < 0 || (y + agl.y) < 0 || (x + agl.x) > 4 || (y + agl.y) > 4 ||
			//Expresion para que el agente evite los posoz
			(x + agl.x === well.x && y + agl.y === well.y) || (x + agl.x === secondWell.x && y + agl.y === secondWell.y) ||
			//Expresiones para que el agente evite a Gumpy
			(isGumpyNear && (agl.x < gumpy.x && x > 0 || agl.x > gumpy.x && x < 0 || agl.y < gumpy.y && y > 0 || agl.y > gumpy.y && y < 0) && turn % 2 == 0) ||
			(x + agl.x === gumpy.x && y + agl.y === gumpy.y)
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
		addLog("El agente se movió a: [" + agl.x + ":" + agl.y + "]", { color: "#369c36" });
	}
	//Funcion para mover a Gumpy
	const moveGumpy = () => {
		let x, y;
		//Variables de control de Gumpy
		let isAglNear = (agl.x === gumpy.x || agl.x === gumpy.x + 1 || agl.x === gumpy.x - 1) && (agl.y === gumpy.y || agl.y === gumpy.y - 1 || agl.y === gumpy.y + 1);
		let isWellNear = (well.x === gumpy.x || well.x === gumpy.x + 1 || well.x === gumpy.x - 1) && (well.y === gumpy.y || well.y === gumpy.y - 1 || well.y === gumpy.y + 1);
		let isSecondWellNear = (secondWell.x === gumpy.x || secondWell.x === gumpy.x + 1 || secondWell.x === gumpy.x - 1) && (secondWell.y === gumpy.y || secondWell.y === gumpy.y - 1 || secondWell.y === gumpy.y + 1);
		let isTreasureNear = (treasure.x === gumpy.x || treasure.x === gumpy.x + 1 || treasure.x === gumpy.x - 1) && (treasure.y === gumpy.y || treasure.y === gumpy.y - 1 || treasure.y === gumpy.y + 1);
		//Añadir logs de detección de Gumpy
		if (isAglNear)
			addLog("Gumpy ha detectado al agente en: " + agl.x + ":" + agl.y, { color: "#5d369c" });

		if (isWellNear)
			addLog("Gumpy ha detectado un pozo en: " + well.x + ":" + well.y, { color: "#5d369c" });

		if (isSecondWellNear)
			addLog("Gumpy ha detectado un pozo en: " + secondWell.x + ":" + secondWell.y, { color: "#5d369c" });

		if (isTreasureNear)
			addLog("Gumpy ha detectado el tesoro en: " + treasure.x + ":" + treasure.y, { color: "#5d369c" });

		let cycles = 0;

		let isSafeToMoveToAgl = isAglNear && !(
			(gumpy.x === agl.x - 1 && gumpy.y === agl.y - 1) && (well.x === agl.x - 1 && well.y === agl.y) && (secondWell.x === agl.x && secondWell.y === agl.y - 1) || // Esquina superior izquierda
			(gumpy.x === agl.x + 1 && gumpy.y === agl.y - 1) && (well.x === agl.x && well.y === agl.y - 1) && (secondWell.x === agl.x + 1 && secondWell.y === agl.y) || // Esquina superior derecha
			(gumpy.x === agl.x - 1 && gumpy.y === agl.y + 1) && (well.x === agl.x - 1 && well.y === agl.y) && (secondWell.x === agl.x && secondWell.y === agl.y + 1) || // Esquina inferior izquierda
			(gumpy.x === agl.x + 1 && gumpy.y === agl.y + 1) && (well.x === agl.x && well.y === agl.y + 1) && (secondWell.x === agl.x + 1 && secondWell.y === agl.y) || // Esquina inferior derecha
			(gumpy.x === agl.x - 1 && gumpy.y === agl.y - 1) && (secondWell.x === agl.x - 1 && secondWell.y === agl.y) && (well.x === agl.x && well.y === agl.y - 1) || // Esquina superior izquierda
			(gumpy.x === agl.x + 1 && gumpy.y === agl.y - 1) && (secondWell.x === agl.x && secondWell.y === agl.y - 1) && (well.x === agl.x + 1 && well.y === agl.y) || // Esquina superior derecha
			(gumpy.x === agl.x - 1 && gumpy.y === agl.y + 1) && (secondWell.x === agl.x - 1 && secondWell.y === agl.y) && (well.x === agl.x && well.y === agl.y + 1) || // Esquina inferior izquierda
			(gumpy.x === agl.x + 1 && gumpy.y === agl.y + 1) && (secondWell.x === agl.x && secondWell.y === agl.y + 1) && (well.x === agl.x + 1 && well.y === agl.y) // Esquina inferior derecha
		);

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
		} while (
			// Expresión para evitar que Gumpy se mantenga quieto y se salga del tablero
			(x == 0 && y == 0) || (x + gumpy.x) < 0 || (y + gumpy.y) < 0 || (x + gumpy.x) > 4 || (y + gumpy.y) > 4 ||
			// Expresión para evitar que Gumpy entre a los pozos
			(x + gumpy.x === well.x && y + gumpy.y === well.y) || (x + gumpy.x === secondWell.x && y + gumpy.y === secondWell.y) ||
			(isAglNear && (gumpy.x < agl.x && x < 0 || gumpy.x > agl.x && x > 0 || gumpy.y < agl.y && y < 0 || gumpy.y > agl.y && y > 0) && !isWellNear && !isSecondWellNear && !isTreasureNear) ||
			//Expresión para que Gumpy evite el tesoro
			(x + gumpy.x === treasure.x && y + gumpy.y === treasure.y) //|| 
			//Expresión para que Gumpy evite los pozos si va a ir hacia el agente
			//(isAglNear && isSafeToMoveToAgl)
		);

		if (!pause)
			gumpy = {
				x: gumpy.x + x,
				y: gumpy.y + y
			};
			addLog("Gumpy se movió a: [" + gumpy.x + ":" + gumpy.y + "]", { color: "#5d369c" });
	}
	//Finalizar juego
	const endGame = () => {
		addLog("Fin del juego", { color: "#FF0000", fontWeight: "bold" });
		clearTimeout(timer);
		setPause(true);
	}
	//Reiniciar
	const restart = () => {
		logs = [];
		clearTimeout(timer);
		agl = { x: 0, y: 0, score: 0 };
		setPause(false);
		//Establecer obstaculos en el tablero
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
		<>
			<div className="flex flex-col h-screen w-full md:flex-row bg-zinc-200">
				<div className="flex flex-col w-full md:w-1/2 h-1/2 md:h-full p-4 pt-2 md:pt-4 pb-0 md:pb-6 relative">
					<h2 className="px-4 pb-2 md:py-2 font-bold text-xl text-center">Agente Inteligente</h2>
					<div className="absolute right-8 top-20 rounded-xl border-4 border-gray-300 flex flex-col overflow-hidden">
						<button onClick={() => setZoom(zoom => zoom + 0.2)} className="w-8 h-8 font-semibold border-b-2 bg-white">+</button>
						<button onClick={() => setZoom(zoom => zoom >= 1 ? zoom - 0.2 : zoom)} className="w-8 h-8 font-semibold bg-white">-</button>
					</div>
					<div className="w-full h-full bg-white rounded-xl flex items-center overflow-auto">
						<div className="flex flex-col max-h-1/2 items-center w-full md:h-full md:justify-center select-none">
							{
								[...Array(5)].map((_, y) => {
									const rows = [...Array(5)].map((_, x) => {
										return (
											<div key={`${x}:${y}`} className={`border-2 border-gray-300 min-w-16 min-h-16 text-3xl flex justify-center items-center hover:cursor-pointer ${x === 0 && y === 0 ? 'rounded-tl-xl' : ''} ${x === 4 && y === 0 ? 'rounded-tr-xl' : ''} ${x === 0 && y === 4 ? 'rounded-bl-xl' : ''} ${x === 4 && y === 4 ? 'rounded-br-xl' : ''} ${x === 0 ? 'border-l-4' : ''} ${y === 0 ? 'border-t-4' : ''} ${x === 4 ? 'border-r-4' : ''} ${y === 4 ? 'border-b-4' : ''}`}
												style={{
													backgroundColor:
														((x == agl.x || x == agl.x + 1 || x == agl.x - 1) && (y == agl.y || y == agl.y - 1 || y == agl.y + 1)) && ((x == gumpy.x || x == gumpy.x + 1 || x == gumpy.x - 1) && (y == gumpy.y || y == gumpy.y - 1 || y == gumpy.y + 1)) ? "#ff0000aa" :
															((x == agl.x || x == agl.x + 1 || x == agl.x - 1) && (y == agl.y || y == agl.y - 1 || y == agl.y + 1)) ? "#369c3688" : (
																((x == gumpy.x || x == gumpy.x + 1 || x == gumpy.x - 1) && (y == gumpy.y || y == gumpy.y - 1 || y == gumpy.y + 1)) ? "#5d369c88" : "white"),
													width: `${zoom * 5}rem`,
													height: `${zoom * 5}rem`
												}}
												onClick={() => {
													gumpy = { ...gumpy, x, y };
													clearTimeout(timer);
													setTurn(turn => turn + 1)
												}}
											>
												<div className="flex justify-center items-center w-full">
													<p className="text-center"
														style={{ fontSize: `${zoom * 1.2}rem` }}
													>
														{agl.x === x && agl.y === y ? "🤖" : ""}
														{treasure.x === x && treasure.y === y ? "🎁" : ""}
														{well.x === x && well.y === y ? "🌀" : ""}
														{secondWell.x === x && secondWell.y === y ? "🌀" : ""}
														{gumpy.x === x && gumpy.y === y ? "👹" : ""}
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
					</div>
				</div>
				<div className="flex flex-col h-1/2 md:flex-grow w-full px-4 md:flex-1 md:pr-4 md:pl-0 md:py-4 md:h-full">
					<h2 className="px-4 hidden md:block py-2 font-bold text-xl">Controles</h2>
					<div className="flex flex-col p-4 mt-2 md:mt-0 rounded-xl bg-white">
						<div className="mb-4 flex justify-between">
							<p className="font-bold text-lg text-blue-600">Turno: {turn}</p>
							<p className="font-bold text-lg text-green-600">Puntaje: {agl.score}</p>
						</div>
						<div className="mb-2">
							<label className="font-bold text-orange-500 block mb-2">Velocidad: {gameSpeed} ms</label>
							<input
								className="w-full border-2 border-black"
								type="range"
								min={100}
								max={2000}
								value={gameSpeed}
								onChange={(e) => setGameSpeed(e.target.value)}
							/>
						</div>
						<div className="flex justify-around px-4">
							<button onClick={() => setPause(!pause)} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 transition duration-300">{pause ? "Reanudar" : "Pausar"}</button>
							<button onClick={restart} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 transition duration-300">Reiniciar</button>
							<button onClick={siguiente} className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-700 transition duration-300">Siguiente</button>
						</div>
					</div>
					<h2 className="px-4 hidden md:block py-2 font-bold text-xl">Mensajes</h2>
					<div className="w-full my-2 md:mt-0 flex flex-col flex-grow overflow-y-scroll rounded-xl bg-white p-4">
						<div ref={divLogs} className="w-full h-fit flex flex-col-reverse">
							{
								logs.map((message, i) => <p className={`italic border-b-2 border-zinc-200`} style={message.style} key={i}>{message.content}</p>)
							}
						</div>
					</div>
				</div>
			</div>
		</>
	)
}

export default App;
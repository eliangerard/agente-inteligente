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

export const App = () => {
	const tolerance = 100;
	const divLogs = useRef(null);

	// Las variables hechas con useState hacen que cada vez que su valor cambia, la página se actualice para mostrar la nueva información.
	// Por lo tanto, solo las variables que al actualizarse deben provocar una actualización deben crearse con useState.
	// Solo se pueden editar usando su respectiva función set{Nombre}.
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

	// useEffect es un hook que se ejecuta después de cada renderizado, es decir, después de cada vez que el componente se actualiza.
	useEffect(() => {
		restart();
	}, [])
	// ⬆ Los corchetes vacíos indican que esta sección de código se ejecutará solo una vez, después del primer renderizado.

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
	// ⬆ El array de dependencias indica que esta sección de código se ejecutará cada vez que el valor de alguna de las variables que se encuentran en el array cambie.

	useEffect(() => {
		addLog(`El agente se movió a [${agl.x}:${agl.y}]`, { color: "#369c36" });
		if (agl.x != treasure.x && agl.y != treasure.y)
			addLog(`Gumpy se movió a [${gumpy.x}:${gumpy.y}]`, { color: "#5d369c" });
	}, [agl, gumpy])

	const addLog = (log, style) => {
		const date = new Date();
		logs.push({ content: date.toLocaleString() + " - " + log, style });
		// divLogs.current.scrollTop = divLogs.current.scrollHeight;
	}

	const moveAgl = () => {
		let x, y, score = agl.score - 1;

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

		let cycles = 0;

		do {
			if (cycles > tolerance) {
				setPause(true);
				addLog("El agente no puede moverse", { color: "#FF0000", fontWeight: "bold" });
				break;
			}
			let moveX;

			// Expresión para que si el agente detecta el tesoro se mueva hacia él
			if (isTreasureNear) {
				if (agl.x === treasure.x)
					moveX = false;
				else if (agl.y === treasure.y)
					moveX = true;
			}
			else
				moveX = Math.random() > 0.5;

			x = moveX ? Math.round(Math.random() * 2 - 1) : 0;
			y = moveX ? 0 : Math.round(Math.random() * 2 - 1);

			console.log("Agente", x, y);
			cycles++;
		} while (
			// Expresión para evitar que el agente se mantenga quieto y se salga del tablero
			(x == 0 && y == 0) || (x + agl.x) < 0 || (y + agl.y) < 0 || (x + agl.x) > 4 || (y + agl.y) > 4 ||
			// Expresión para evitar que el agente entre a los pozos
			(x + agl.x === well.x && y + agl.y === well.y) || (x + agl.x === secondWell.x && y + agl.y === secondWell.y) ||
			// Expresión para evitar que el agente se acerque a Gumpy, para que se aleje
			(isGumpyNear && (agl.x < gumpy.x && x > 0 || agl.x > gumpy.x && x < 0 || agl.y < gumpy.y && y > 0 || agl.y > gumpy.y && y < 0)) ||
			// Expresión para evitar que el agente se aleje del tesoro si gumpy no está cerca
			(isTreasureNear && !isGumpyNear && (agl.x < treasure.x && x < 0 || agl.x > treasure.x && x > 0 || agl.y < treasure.y && y < 0 || agl.y > treasure.y && y > 0) && !isWellNear && !isSecondWellNear)
		);

		if (agl.x + x === treasure.x && agl.y + y === treasure.y) {
			score += 1000;
			setPause(true);
			addLog("¡El agente encontró el tesoro!", { color: "#00AA00", fontWeight: "bold" });
		}
		if (agl.x + x === well.x && agl.y + y === well.y ||
			agl.x + x === secondWell.x && agl.y + y === secondWell.y) {
			score -= 1000;
			addLog("Caiste en un pozo", { fontWeight: "bold" });
		}
		if (agl.x + x === gumpy.x && agl.y + y === gumpy.y) {
			score -= 1000;
			addLog("Te comió Gumpy", { color: "#FF0000", fontWeight: "bold" });
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
				setPause(true);
				addLog("Gumpy no puede moverse", { color: "#FF0000", fontWeight: "bold" });
				return;
			}

			let moveX = Math.random() > 0.5;
			x = moveX ? Math.round(Math.random() * 2 - 1) : 0;
			y = moveX ? 0 : Math.round(Math.random() * 2 - 1);
			console.log("Gumpy", x, y);
			cycles++;
		} while (
			// Expresión para evitar que Gumpy se mantenga quieto y se salga del tablero
			(x == 0 && y == 0) || (x + gumpy.x) < 0 || (y + gumpy.y) < 0 || (x + gumpy.x) > 4 || (y + gumpy.y) > 4 ||
			// Expresión para evitar que Gumpy entre a los pozos
			(x + gumpy.x === well.x && y + gumpy.y === well.y) || (x + gumpy.x === secondWell.x && y + gumpy.y === secondWell.y) || (x + gumpy.x === agl.x && y + gumpy.y === agl.y) ||
			// Expresión para que Gumpy se acerque al agente
			(isAglNear && (gumpy.x < agl.x && x < 0 || gumpy.x > agl.x && x > 0 || gumpy.y < agl.y && y < 0 || gumpy.y > agl.y && y > 0))
		);

		setGumpy(gumpy => ({
			x: gumpy.x + x,
			y: gumpy.y + y
		}));
	}

	const restart = () => {
		logs = [];
		timer = null;
		setAgl({ x: 0, y: 0, score: 0 });
		setTurn(0);
		setPause(false);

		let treasure, well, secondWell, gumpy;
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

		setTreasure(treasure)
		setWell(well)
		setSecondWell(secondWell)
		setGumpy(gumpy)
	}

	const siguiente = () => {
		setAgl(prevState => ({
			...prevState,
			x: 0,
			y: 0,
		}));
		setPause(false);

		let treasure, well, secondWell, gumpy;
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

		setTreasure(treasure)
		setWell(well)
		setSecondWell(secondWell)
		setGumpy(gumpy)
	}

	return (
		<div className="w-screen h-screen">
			<div className="flex justify-between w-screen">
				<div className="w-auto h-screen p-40">
					{
						[...Array(5)].map((_, y) => {
							const rows = [...Array(5)].map((_, x) => {
								return (
									<div key={`${x}:${y}`} className="border-2 border-black w-28 h-28 text-4xl flex justify-between align-middle"
										style={{
											backgroundColor: ((x == agl.x || x == agl.x + 1 || x == agl.x - 1) && (y == agl.y || y == agl.y - 1 || y == agl.y + 1)) ? "#369c36" : (
												((x == gumpy.x || x == gumpy.x + 1 || x == gumpy.x - 1) && (y == gumpy.y || y == gumpy.y - 1 || y == gumpy.y + 1)) ? "#5d369c" : "white")
										}}
									>
										<div className="flex justify-center items-center w-full">
											<p class="text-center">
												{agl.x === x && agl.y === y ? "🤖" : ""}
												{treasure.x === x && treasure.y === y ? "🎁" : ""}
												{well.x === x && well.y === y ? "🌀" : ""}
												{secondWell.x === x && secondWell.y === y ? "🌀" : ""}
												{gumpy.x === x && gumpy.y === y ? "👹" : ""}
											</p>
											<button className="" onClick={() => setAgl({ x, y })}></button>
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
				<div className="w-full h-screen pr-40">
					<div className="w-full pb-10 pt-40">
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
						<br />
						<button onClick={() => setPause(!pause)}>{pause ? "Reanudar" : "Pausar"}</button>
						<br />
						<button onClick={restart}>Reiniciar</button>
						<br />
						<button onClick={siguiente}>Siguiente</button>
					</div>
					<h2>Mensajes</h2>
					<div className="w-full mb-40 max-h-80 mr-40 overflow-y-auto">
						<div ref={divLogs} className="w-full flex overflow-hidden flex-col-reverse p-5 bg-zinc-200">
							{
								logs.reverse().map((message, i) => <p className="italic" style={message.style} key={i}>{message.content}</p>)
							}
						</div>
					</div>
				</div>

			</div>
		</div>
	)
}

export default App;
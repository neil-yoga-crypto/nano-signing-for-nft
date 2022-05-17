let form = document.querySelector("form"),
out = document.getElementById("info");

// connect to <host>/ws to communicate with the backend
let ws = new WebSocket(`ws://localhost:9000/ws`);

ws.onerror = (e) => {
	out.innerText = "Could not connect to backend. Is it running?";
	out.innerHTML += "<br>";
	out.innerText += "More info in the console.";
	console.error(e);
};
ws.onclose = () => (form.elements[3].disabled = true);
ws.onopen = () => (form.elements[3].disabled = false);

form.onsubmit = (e) => {
	e.preventDefault();
	if (ws.readyState === ws.OPEN) {
		ws.send(
			JSON.stringify({
				type:'challenge'
			})
		);
		out.innerText = "Send your transaction now.";
		form.elements[3].disabled = true;
	} else out.innerText = "WebSocket is not open.";
};

ws.onmessage = (/** @type MessageEvent<any> */ e) => {
	let message = e.data?.toString();
	if (!message) return; // Ignore empty messages
	if (message.startsWith("{"))
		try {
			message = JSON.parse(message);
		} catch (e) {
			out.innerText = "Could not parse message.";
			out.innerHTML += "<br>";
			out.innerText += "More info in the console.";
			console.error(e);
			return;
		}
	else {
		out.innerText = "Invalid message format.";
		return;
	}
	switch (message.type) {
		case "challenge":
			let form.walletAddress.value;
			out.innerText = "Transaction timed out.";
			break;
		case "insufficient":
			out.innerText = "Insufficient funds.";
			break;
		case "paid":
			out.innerText = "Transaction successful. Redirecting...";
			location.href = message.url;
			break;
		case "wait":
			out.innerText += ".";
			break;
		default:
			out.innerText = "Unknown response.";
			break;
	}
};

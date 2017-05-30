var Environment = {
	traceListUrl: "traces.json",
	tracePostUrl: "traces"
};

function layoutGlyphPane() {
	var size = Math.floor(Math.min($(bodyElem).innerWidth(), $(window).height() * 0.7));
	glyphCanvasElem.height = glyphCanvasElem.width = size;
	
	$(timeFieldElem).width(size);
	timeFieldElem.style.fontSize = MathUtil.clip(Math.floor(size * 0.1), 16, 80) + "px";
}

var nodePositionParams = {
	dy1: 0.387,
	dx2: 0.1676,
	dy2: 0.0965,
	r: 0.05,
}

var nodePositions = [
	{ x:0, y:0 },
	{ x:0, y:-nodePositionParams.dy1 },
	{ x:0, y:nodePositionParams.dy1 },
	{ x:nodePositionParams.dx2,    y:nodePositionParams.dy2 },
	{ x:nodePositionParams.dx2*2,  y:nodePositionParams.dy*2 },
	{ x:nodePositionParams.dx2,    y:-nodePositionParams.dy2 },
	{ x:nodePositionParams.dx2*2,  y:-nodePositionParams.dy*2 },
	{ x:-nodePositionParams.dx2,   y:-nodePositionParams.dy2 },
	{ x:-nodePositionParams.dx2*2, y:-nodePositionParams.dy*2 },
	{ x:-nodePositionParams.dx2,   y:nodePositionParams.dy2 },
	{ x:-nodePositionParams.dx2*2, y:nodePositionParams.dy*2 }
];

function isOverNode(p) {
	if (!p) {
		return false;
	} else {
		return nodePositions.some(function(n) {
			var dx = n.x + 0.5 - p.x;
			var dy = n.y + 0.5 - p.y;
			return dx * dx + dy * dy <= nodePositionParams.r * nodePositionParams.r;
		});
	}
}

function vibrate() {
	if (window.navigator.vibrate) {
		console.log("blip!");
		window.navigator.vibrate(30);
	}
}

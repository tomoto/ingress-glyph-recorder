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

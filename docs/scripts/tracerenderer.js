function TraceRenderer(canvasElem, timeElem) {
    this.canvasElem = canvasElem;
    this.timeElem = timeElem;
    this.currentAnimationBaseTime = 0;
}

TraceRenderer.prototype.animate = function(points) {
    var self = this;
    window.requestAnimationFrame(function() {
        self.currentAnimationBaseTime = DateUtil.getCurrentTimeMillis();
        self._renderAnimationFrame(self.currentAnimationBaseTime, points[0], ArrayUtil.dup(points));
    });
};

TraceRenderer.prototype._renderAnimationFrame = function(baseTime, prevPoint, points) {
    
    // NOTE: points will be destroyed
    
    if (baseTime != this.currentAnimationBaseTime) {
        return; // another animation has started. abort.
    }
    
    var currentTimestamp = DateUtil.getCurrentTimeMillis() - baseTime;
    
    // flush out the points so far
    while (points.length > 0 && points[0].timestamp <= currentTimestamp) {
        var currentPoint = points.shift();
        this._drawSegment(prevPoint, currentPoint);
        prevPoint = currentPoint;
    }
    
    $(this.timeElem).text(((points.length > 0 ? currentTimestamp : prevPoint.timestamp) * 0.001).toFixed(2));
    
    if (points.length > 0) {
        var self = this;
        window.requestAnimationFrame(function() {
            self._renderAnimationFrame(baseTime, prevPoint, points);
        });
    }
};

TraceRenderer.prototype._drawSegment = function(p1, p2) {
    var scale = this.canvasElem.width;
    var lineWidthScale = scale / 25000;
    var ctx = this.canvasElem.getContext('2d');
    ctx.beginPath();
    ctx.strokeStyle = "#fff133";
    ctx.lineWidth = MathUtil.clip(Math.pow(TraceRenderer._getSpeed(p1, p2), -0.8) * lineWidthScale, 1, scale * 0.03);
    ctx.lineCap = "round";
    ctx.moveTo(p1.x * scale, p1.y * scale);
    ctx.lineTo(p2.x * scale, p2.y * scale);
    ctx.stroke();
};

TraceRenderer.prototype.clear = function() {
    this.canvasElem.getContext("2d").clearRect(0, 0, this.canvasElem.width, this.canvasElem.height);
}; 

TraceRenderer._getSpeed = function(p1, p2) {
    return MathUtil.magnitude(p2.x - p1.x, p2.y - p1.y) / Math.abs(p1.timestamp - p2.timestamp);
};

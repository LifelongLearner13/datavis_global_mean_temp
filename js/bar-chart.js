function init() {
    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 110, left: 40},
        margin2 = {top: 430, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        height2 = +svg.attr("height") - margin2.top - margin2.bottom;

    var parseDate = d3.timeParse("%b %Y");

    var x = d3.scaleTime().range([0, width]),
        x2 = d3.scaleTime().range([0, width]),
        y = d3.scaleLinear().range([height, 0]),
        y2 = d3.scaleLinear().range([height2, 0]);

    var xAxis = d3.axisBottom(x),
        xAxis2 = d3.axisBottom(x2),
        yAxis = d3.axisLeft(y);

    var brush = d3.brushX()
        .extent([[0, 0], [width, height2]])
        .on("brush end", brushed);

    var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on("zoom", zoomed);

    var line = d3.line()
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.temp); });

    var line2 = d3.line()
        .x(function(d) { return x2(d.date); })
        .y(function(d) { return y2(d.temp); });

    svg.append("defs").append("clipPath")
        .attr("id", "clip")
    .append("rect")
        .attr("width", width)
        .attr("height", height);

    var focus = svg.append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var context = svg.append("g")
        .attr("class", "context")
        .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

    d3.csv("data/GLB.Ts.csv", type, function(error, data) {
    if (error) throw error;
        console.log(data)
    x.domain(d3.extent(data, function(d) { return d.date; }));
    y.domain(d3.extent(data, function(d) { return d.temp; }));
    x2.domain(x.domain());
    y2.domain(y.domain());

    var padding = 2; // <-A
    
    var bars = focus.selectAll("rect.bar")
            .data(data);
    bars.enter()
            .append("rect") // <-B
        .merge(bars)
            .attr("class", "bar")
            .attr("clip-path", "url(#clip)")
            .attr("x", function (d) { 
                return x(d.date); // <-C
            })
            .attr("y", function (d) { 
                return y(d.temp); // <-D 
            })
            .attr("height", function (d) { 
                return height - y(d.temp); 
            })
            .attr("width", function(d){
                return Math.floor(width / data.length) - padding;
            });

    focus.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    focus.append("g")
        .attr("class", "axis axis--y")
        .call(yAxis);
        
        var bars2 = context.selectAll("rect.bar")
        .data(data);
bars2.enter()
        .append("rect") // <-B
    .merge(bars2)
        .attr("class", "bar")
        .attr("x", function (d) { 
            return x2(d.date); // <-C
        })
        .attr("y", function (d) { 
            return y2(d.temp); // <-D 
        })
        .attr("height", function (d) { 
            return height2 - y2(d.temp); 
        })
        .attr("width", function(d){
            return Math.floor(width / data.length) - padding;
        });
    context.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height2 + ")")
        .call(xAxis2);

    context.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, x.range());

    svg.append("rect")
        .attr("class", "zoom")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(zoom);
    });

    function brushed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
    var s = d3.event.selection || x2.range();
    x.domain(s.map(x2.invert, x2));
    focus.selectAll('.bar').attr("x", function (d) { 
        return x(d.date); // <-C
    })
    .attr("y", function (d) { 
        return y(d.temp); // <-D 
    })
    // focus.selectAll('.bar').attr("transform", function(d) { return "translate(" + x(d.date) + "," + 0 + ")"; });
    // focus.select(".line").attr("d", line);

    focus.select(".axis--x").call(xAxis);
    svg.select(".zoom").call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0));
    }

    function zoomed() {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
    var t = d3.event.transform;
    x.domain(t.rescaleX(x2).domain());
    focus.selectAll('.bar').attr("x", function (d) { 
        return x(d.date); // <-C
    })
    .attr("y", function (d) { 
        return y(d.temp); // <-D 
    })
    focus.select(".axis--x").call(xAxis);
    context.select(".brush").call(brush.move, x.range().map(t.invertX, t));
    }

    function type(inputObj) {
        var months = ['Apr','Aug','Dec','Feb','Jan','Jul','Jun','Mar',
                        'May','Nov','Oct','Sep'];
        return {
            date: parseDate('Jan ' + inputObj.Year),
            temp: +inputObj['J-D'],
        };

        // var outputObj = {};
        // var year = inputObj.Year;
        // for(var j = 0; j < months.length; j++) {
        //     outputObj.date = parseDate(months[j] + ' ' + year);
        //     outputObj.temp = +inputObj[months[j]];
        // }

    //   d.date = parseDate(d.date);
    //   d.price = +d.price;
    //   return d;
        // return outputObj;
    }
}
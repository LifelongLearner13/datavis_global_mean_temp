function init() {
    /****** LOCAL VARIABLES ******/

    // Elements required to render the visualization
    var svg = d3.select("svg"),
        _xChart, _yChart, _xChartAxis, _yChartAxis,
        _chart, _selector, _brush, _zoom;
    
    // Dimensions used to calculate element placement
    var chartMargin = {top: 20, right: 20, bottom: 120, left: 70},
        selectorMargin = {top: 420, right: 20, bottom: 40, left: 70},
        drawWidth = +svg.attr("width") - chartMargin.left - chartMargin.right,
        chartHeight = +svg.attr("height") - chartMargin.top - chartMargin.bottom,
        selectorHeight = +svg.attr("height") - selectorMargin.top - selectorMargin.bottom;

    // Information being graphed
    var _rawData = [];
    var _byYear = [];
    var _byMonth = [];

    // The current version only renders the mean temperature
    // per year. This could be used in the future to display
    // more data.
    var _keys = ['Apr','Aug','Dec','Feb','Jan','Jul','Jun','Mar',
                    'May','Nov','Oct','Sep', 'J-D'];

    /****** READ AND RENDER DATA ******/

    d3.csv("data/GLB.Ts.csv", clearAndFilter, function(error, data) {
        if (error) {
            console.error(error);
        }
        _rawData = data;
        _byYear = _rawData.map(calYearMean);

        renderBody();
        setupBrush();
        setupZoom();
        setupAxes(_byYear);
        renderGuideLines()
    
        renderBars(_chart, _byYear, _xChart, _yChart, chartHeight, true);
        renderBars(_selector, _byYear, _xSelector, _ySelector, selectorHeight, false);
    });

    /****** HELPER FUNCTIONS ******/

    // Setup the chart and selector areas
    function renderBody() {
        // Add clip path so that bars do not render
        // outside chart area
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", drawWidth)
            .attr("height", chartHeight);

        // Append areas for the chart and selector to the
        // svg
        _chart = svg.append("g")
            .attr("class", "_chart")
            .attr("transform", "translate(" + 
                chartMargin.left + "," + chartMargin.top + ")");

        _selector = svg.append("g")
            .attr("class", "_selector")
            .attr("transform", "translate(" + 
                selectorMargin.left + "," + selectorMargin.top + ")");

    }

    // Render the bars
    function renderBars(element, data, x, y, eleHeight, clip) {
        console.log('width: Math.floor(' + drawWidth + '/' + data.length + ') - 1');
        var b = element.selectAll("rect.bar")
                .data(data);
                console.log(Math.floor(drawWidth / data.length))
        b.enter()
            .append("rect")
        .merge(b)
            .attr("class", "bar")
            .attr('fill', function(d) {
                return d.temp < 0 ? '#1ae9f0' : '#662112';
            })
            .attr("x", function (d) { 
                return x(d.date);
            })
            .attr("y", function (d) { 
                return isNaN(y(d.temp)) ? 0 : y(d.temp);
            })
            .attr("height", function (d) { 
                return isNaN(y(d.temp)) ? 0 : eleHeight - y(d.temp); 
            })
            .attr("width", function(d){
                return Math.floor(drawWidth / data.length) - 1;
            });

        if(clip) {
            b.attr("clip-path", "url(#clip)");
        }
    }

    // Functions handling the Axes in the Visualization
    function setupAxes(data) {
        setInitDomainRange(data);
        renderAxes();
    }

    function setInitDomainRange(data) {
        // Range
        _xChart = d3.scaleTime().range([0, drawWidth]);
        _xSelector = d3.scaleTime().range([0, drawWidth]);
        _yChart = d3.scaleLinear().range([chartHeight, 0]);
        _ySelector = d3.scaleLinear().range([selectorHeight, 0]);

        // Orientation
        _xChartAxis = d3.axisBottom(_xChart);
        _xSelectorAxis = d3.axisBottom(_xSelector);
        _yChartAxis = d3.axisLeft(_yChart);

        // Domain
        _xChart.domain(d3.extent(data, function(d) { return d.date; }));
        _yChart.domain(d3.extent(data, function(d) { return d.temp; }));
        _xSelector.domain(_xChart.domain());
        _ySelector.domain(_yChart.domain());
    }

    function renderAxes() {
        // X-Axes
        _chart.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + chartHeight + ")")
            .call(_xChartAxis);

        _selector.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + selectorHeight + ")")
            .call(_xSelectorAxis);

        // Y-axis
        _chart.append("g")
            .attr("class", "axis axis--y")
            .call(_yChartAxis);
    
        _selector.append("g")
            .attr("class", "brush")
            .call(_brush)
            .call(_brush.move, _xChart.range());
        
        // Axes Titles
        _chart.append('text')
            .attr("text-anchor", "middle") 
            .attr("transform", "translate("+  (-chartMargin.left/2) +","+(chartHeight/2)+")rotate(-90)")
            .text('Mean Temperatures in Celsius');

        _selector.append("text")
            .attr("text-anchor", "middle") 
            .attr("transform", "translate("+  (drawWidth/2) +","+(selectorHeight + 40)+")")
            .text("Date");
    }
    
    function renderGuideLines() {
        _chart.append('line')
                .attr('x1', 0)
                .attr('y1', _yChart(0))
                .attr('x2', drawWidth)
                .attr('y2', _yChart(0))
                .attr('stroke-width', 1)
                .attr('stroke', 'rgba(15, 15, 15, 0.61)');
        
        _chart.append('line')
                .attr('x1', 0)
                .attr('y1', 0)
                .attr('x2', drawWidth)
                .attr('y2', 0)
                .attr('stroke-width', 1)
                .attr('stroke', 'rgba(15, 15, 15, 0.61)');
        
        _chart.append('line')
                .attr('x1', drawWidth)
                .attr('y1', 0)
                .attr('x2', drawWidth)
                .attr('y2', chartHeight)
                .attr('stroke-width', 1)
                .attr('stroke', 'rgba(15, 15, 15, 0.61)');

        _selector.append('line')
                .attr('x1', 0)
                .attr('y1', _ySelector(0))
                .attr('x2', drawWidth)
                .attr('y2', _ySelector(0))
                .attr('stroke-width', 1)
                .attr('stroke', 'rgba(15, 15, 15, 0.61)');
    }

    // Handle the interactive selection and panning
    function setupBrush() {
        _brush = d3.brushX()
            .extent([[0, 0], [drawWidth, selectorHeight]])
            .on("brush end", brushed);
    }

    function brushed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom
    
        var s = d3.event.selection || _xSelector.range();
        _xChart.domain(s.map(_xSelector.invert, _xSelector));
        renderBars(_chart, _byYear, _xChart, _yChart, chartHeight, true);

        _chart.select(".axis--x").call(_xChartAxis);
        svg.select(".zoom").call(_zoom.transform, d3.zoomIdentity
            .scale(drawWidth / (s[1] - s[0]))
            .translate(-s[0], 0));
    }

    function setupZoom() {
        _zoom = d3.zoom()
            .scaleExtent([1, Infinity])
            .translateExtent([[0, 0], [drawWidth, chartHeight]])
            .extent([[0, 0], [drawWidth, chartHeight]])
            .on("zoom", zoomed);
        
        svg.append("rect")
            .attr("class", "zoom")
            .attr("width", drawWidth)
            .attr("height", chartHeight)
            .attr("transform", "translate(" + chartMargin.left + "," + chartMargin.top + ")")
            .call(_zoom);
    }

    function zoomed() {
        if (d3.event.sourceEvent && d3.event.sourceEvent.type === "brush") return; // ignore zoom-by-brush
        var t = d3.event.transform;
        _xChart.domain(t.rescaleX(_xSelector).domain());
        renderBars(_chart, _byYear, _xChart, _yChart, chartHeight, true);
        _chart.select(".axis--x").call(_xChartAxis);
        _selector.select(".brush").call(_brush.move, _xChart.range().map(t.invertX, t));
    }

    // Functions to handle the data cleaning and processing
    var parseDate = d3.timeParse("%b %Y");

    // Clean and Filter the raw data read from the CSV
    // into a usable form
    function clearAndFilter(inputObj) {
        var outputObj = {};
        outputObj.year = inputObj.Year;
        for(var j = 0; j < _keys.length; j++) {
            outputObj[_keys[j]] = +inputObj[_keys[j]];
        }

        return outputObj;
    }

    function calYearMean(inputObj) {
        return {
            date: parseDate('Jan ' + inputObj.year),
            temp: inputObj['J-D'],
        };
    }
}
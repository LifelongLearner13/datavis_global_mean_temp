function zoomBarChart(svg) {

  /****** Declare Local Variables ******/

  // Universal, apply to both chart and selector
  var _chartObj = {},
      _svg = svg,
      _svgWidth = +svg.attr('width'), _svgHeight = +svg.attr('height'),
      _data = [];

  // Chart only variables
  var _chart,
      _chartWrapper,
      _chartMargins = {top: 10, right: 10, bottom: 140, left: 40},
      _chartHeight = _svgHeight - _chartMargins.top - _chartMargins.bottom,
      _chartX, _chartY,
      _chartXAxis, _chartYAxis;
  
  // Selector only variables
  var _selector,
      _selectorWrapper,
      _selectorMargins = {top: 550, right: 10, bottom: 10, left: 40},
      _selectorHeight = _svgHeight - _selectorMargins.top - _selectorMargins.bottom,
      _selectorX, _selectorY, 
      _selectorXAxis, _selectorYAxis;

  // One last Universal Variable
  var _width = _svgWidth - _chartMargins.left - _chartMargins.right;

  _chartObj.chartX = function (x) {
    if (!arguments.length) return _chartX;
    console.log(x)
    _chartX = x;
    return _chartObj;
  };

  _chartObj.chartY = function (y) {
    if (!arguments.length) return _chartY;
    console.log(y)
    _chartY = y;
    return _chartObj;
  };

  _chartObj.setData = function (d) {
    _data = d;
    return _chartObj;
  };

  /****** Draw the Chart ******/

  _chartObj.render = function () {
    _svg = d3.select('#chart')
              .attr("height", _svgHeight)
              .attr("width", _svgWidth);

    _chartWrapper = svg.append("g")
                    .attr("class", "chartWrapper")
                    .attr("transform", "translate(" + 
                    _chartMargins.left + "," + _chartMargins.top + ")");
    renderChartAxes(svg);
    // _chart = _chartWrapper.append('g')
    //                 .attr('class', 'chart')


    _selectorWrapper = svg.append("g")
                    .attr("class", "selectorWrapper")
                    .attr("transform", "translate(" + 
                    _selectorMargins.left + "," + _selectorMargins.top + ")");
    _selector = _selectorWrapper.append('g')
                    .attr('class', 'selector')
                    .attr('transform', 'translate(' +
                        0 + ',' + 0 + ')')
    
    
    renderSelectorAxes(svg);
    console.log(_data);
    renderBars();
    // defineBodyClip(_chart);

    // renderBody(_svg);
  };

  function renderChartAxes(chart) {
    var axesG = svg.select("g")
                    .attr("class", "axes");

    var xAxis = d3.axisBottom().scale(_chartX.range([0, _width]));
    var yAxis = d3.axisLeft().scale(_chartY.range([_chartHeight, 0]));

    axesG.append("g")
            .attr("class", "axis")
            .attr("transform", function () {
                return "translate(" + _chartMargins.left + "," + (_chartMargins.top + _chartY(0.0)) + ")";
            })
            .call(xAxis);

    axesG.append("g")
            .attr("class", "axis")
            .attr("transform", function () {
                return "translate(" + _chartMargins.left + "," + _chartMargins.top + ")";
            })
            .call(yAxis);
  }

  function renderSelectorAxes(selector) {
    var axesG = svg.select('.axes');

    var xAxis = d3.axisBottom().scale(_chartX.range([0, _width]));
    var yAxis = d3.axisLeft().scale(_chartY.range([_selectorHeight, 0]));

    axesG.append("g")
            .attr("class", "axis")
            .attr("transform", function () {
                return "translate(" + _selectorMargins.left + "," + _selectorMargins.top + ")";
            })
            .call(xAxis);
  }
 
  function renderBars() {
    var groupByYear = d3.nest()
        .key(function(d) { return d.date.getFullYear();})
        .rollup(function(v) { return d3.mean(v, function(d) { return d.temp; }); })
        .entries(_data);
    console.log(groupByYear)
    var padding = 2; // <-A

    var bars = _chart.selectAll('rect.bar')
            .data(groupByYear);
    console.log(_chartY(0.00))
    console.log()
    bars.enter()
            .append('rect')
        .merge(bars)
            .attr('class', 'bar')
        .transition()
            .attr('x', function (d) { 
                return _chartX(new Date(d.key, 0, 1));
            })
            .attr('y', function (d) {
                return d.value < 0 ? (_chartHeight / 2 + _chartY(0.0)) : _chartY(d.value);
            })
            .attr('height', function (d) { 
                return (_chartMargins.top + _chartY(0.0)) - _chartY(d.value); 
            })
            .attr('width', function(d){
                return Math.floor(_width / groupByYear.length) - padding;
            });
  }

  return _chartObj; 
}
var parseDate = d3.timeParse("%b %Y");

function processData(rawData) {
  var months = ['Apr','Aug','Dec','Feb','Jan','Jul','Jun','Mar',
                'May','Nov','Oct','Sep'];
  var newData = [];

  for(var i = 0; i < rawData.length; i++) {
    var year = rawData[i].Year;
    for(var j = 0; j < months.length; j++) {
      newData.push({
        date: parseDate(months[j] + ' ' + year),
        temp: +rawData[i][months[j]],
      });
    }
  }

  return newData;
}

function init() {
  d3.csv('data/GLB.Ts.csv', function(result) {
    var data = processData(result);

    var chartArea = d3.select("#chart");
    var chart = zoomBarChart(chartArea)
                .chartX(d3.scaleTime().domain(d3.extent(data, function(d) { return d.date; })))
                .chartY(d3.scaleLinear().domain(d3.extent(data, function(d) { return d.temp; })));
    chart.setData(data);
    chart.render();
  });
}
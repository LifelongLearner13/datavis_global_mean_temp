function zoomBarChart(svg) {

  /****** Declare Local Variables ******/

  // Universal, apply to both chart and selector
  var _chartObj = {},
      _svg = svg,
      _svgWidth = +svg.attr('width'), _svgHeight = +svg.attr('height'),
      _data = [];

  // Chart only variables
  var _chart,
      _chartMargins = {top: 20, right: 20, bottom: 110, left: 40},
      _chartHeight = _svgHeight - _chartMargins.top - _chartMargins.bottom,
      _chartX, _chartY,
      _chartXAxis, _chartYAxis;
  
  // Selector only variables
  var _selector,
      _selectorMargins = {top: 430, right: 20, bottom: 30, left: 40},
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

  /****** Draw the Chart ******/

  _chartObj.render = function () {
    _svg = d3.select('#chart')
              .attr("height", _svgHeight)
              .attr("width", _svgWidth);

    _chart = svg.append("g")
                .attr("class", "chart")
                .attr("transform", "translate(" + 
                    _chartMargins.left + "," + _chartMargins.top + ")");
        
    _selector = svg.append("g")
                  .attr("class", "selector")
                  .attr("transform", "translate(" + 
                      _selectorMargins.left + "," + _selectorMargins.top + ")");

    renderChartAxes(_chart);
    renderSelectorAxes(_selector);
    // renderSelectorAxes(_selector);

    // defineBodyClip(_chart);

    // renderBody(_svg);
  };

  function renderChartAxes(chart) {
    var xAxis = d3.axisBottom().scale(_chartX.range([0, _width]));
    var yAxis = d3.axisLeft().scale(_chartY.range([_chartHeight, 0]));

    console.log(_chartX(new Date(2017)))
    chart.append("g")
            .attr("class", "axis")
            .attr("transform", function () {
                return "translate(" + _chartMargins.left + "," + (_chartHeight / 2 + _chartMargins.top) + ")";
            })
            .call(xAxis);

    chart.append("g")
            .attr("class", "axis")
            .attr("transform", function () {
                return "translate(" + _chartMargins.left + "," + _chartMargins.top + ")";
            })
            .call(yAxis);
  }

  function renderSelectorAxes(selector) {
    var xAxis = d3.axisBottom().scale(_chartX.range([0, _width]));
    var yAxis = d3.axisLeft().scale(_chartY.range([_selectorHeight, 0]));

    selector.append("g")
            .attr("class", "axis")
            .attr("transform", function () {
                return "translate(" + _selectorMargins.left + "," + _selectorHeight + ")";
            })
            .call(xAxis);
  }
 
  return _chartObj; 
}

function init() {
  var chartArea = d3.select("#chart");
  var chart = zoomBarChart(chartArea)
                .chartX(d3.scaleTime().domain([new Date(1880, 0, 1), new Date(2017, 0, 1)]))
                .chartY(d3.scaleLinear().domain([-2.0, 2.0]));

  chart.render();
}
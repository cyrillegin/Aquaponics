'use strict';

angular.module('dragonfly.graphcontroller', [])

.controller("graphController",['$scope', 'dataService', '$window', '$http', function ($scope, dataService, $window, $http) {
  $scope.$watch(function(){
    return dataService.selection();
  }, function(v){
    if(v === undefined) return;
    if(dataService.data === undefined) return;

    var params = {
      "sensor": dataService.selection()
    }
    var req = {
      method: 'POST',
      url: 'dragonfly/getReadings',
      data: params
    };
    $http(req).then(function successCallback(response){
      DrawGraph(response.data);
    }, function errorCallback(response){
      console.log("An error has occured.", response.data);
    });

    
  });

  function DrawGraph(data){
    console.log(data);
    var d3 = $window.d3;
    var container = $('#graph-container')

    container.innerHTML = "";
    var width = container[0].clientWidth;
    var height = container[0].clientHeight+400;

    var margin = {top: 20, right: 10, bottom: 20, left: 40};
    width = width - margin.left - margin.right; height = height - margin.top - margin.bottom;

    var newChart = d3.select('#graph-container')
        .append("svg")
        .attr("class", "Chart-Container")
        .attr("id", data.name)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + 0 + ")")
        .classed("svg-content-responsive", true);

    if(data.readings.length === 0){
        newChart.append("g").append("text")
            .text("No data exists for this time range.")
            .attr("class", "ChartTitle-Text")
            .attr("x", margin.left)
            .attr("y", height/2);
        return;
    }
   
    var start = data.readings[0].created;
    var end = data.readings[data.readings.length-1].created;
    var min = data.readings[0].value;
    var max = data.readings[0].value;
    for(var j = 0; j < data.readings.length; j++){
        if(min > data.readings[j].value) min = data.readings[j].value;
        if(max < data.readings[j].value) max = data.readings[j].value;
    }

    console.log(new Date(start), new Date(end))
     var xScale = d3.scaleTime()
        .domain([new Date(start), new Date(end)])
        .rangeRound([0, width]);

    var yScale = d3.scaleLinear()
        .domain([min,max+(max-min)*0.1])
        .rangeRound([height,margin.bottom]);

    //y axis
    var yAxis = d3.axisLeft(yScale)
        .tickSizeInner(-width)
        .tickSizeOuter(-10)
        .tickValues(getTic())
        .tickFormat(function(d){
            var whatToReturn = getFormattedText(d, data.sensor);
            return getFormattedText(d, data.sensor);
        });
    newChart.append("g")
        .attr("class", "ChartAxis-Shape")
        .call(yAxis);

    //X Axis
    var xAxis = d3.axisBottom(xScale)
        .tickSizeInner(-height + margin.bottom )
        .tickSizeOuter(0)
        .tickPadding(10)
        .ticks(12);

    newChart.append("g")
        .attr("class", "ChartAxis-Shape")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);


    var xAxisTop = d3.axisBottom(xScale)
        .ticks(0);

    newChart.append("g")
        .attr("class", "ChartAxis-Shape")
        .attr("transform", "translate(0, "+margin.bottom+")")
        .call(xAxisTop);

    var yAxisRight = d3.axisLeft(yScale)
        .ticks(0);

    newChart.append("g")
        .attr("class", "ChartAxis-Shape")
        .attr("transform", "translate("+width+", 0)")
        .call(yAxisRight);

    function getTic(){
        var Ticks = [];
        var ratio  = (max-min) / 6;
        for(var i = 0; i < 7; i++){
            Ticks.push(min+(ratio*i));
        }
        return Ticks;
    }
    

    var lastPos =[];
    var lastWidth = [];

    // newChart.append("text")
    //     .attr("x", width)
    //     .attr("y", margin.bottom-5)
    //     .attr("text-anchor", "end")
    //     .text(messages)
    //     .attr("width", 100)
    //     .attr("height", 100*0.4)
    //     .attr("fill", "black");

    /* Graph lines
    * First gets a preliminary date, then itterates through the data keeping track of the last date.
    * Checks to see if the current date - last date is == to the average date.
    * If it isn't, create a break in the line and reset all of the values until a new date is found.
    */

    // var meanTimes = [];
    // var lastPoint =(data.readings[0].created);

    // for(var j = 0; j < data.readings.length; j++){
    //     meanTimes.push((data.readings[j].created - lastPoint));
    //     lastPoint = data.readings[j].created;
    // }
    // meanTimes.sort();
    // var meanTime = meanTimes[parseInt(meanTimes.length/2)];
    // var last = 0;


    var lineFunction = d3.line()
        // .defined(function(d) {
            // d.created = parseInt(d.created);
            // if(d.created < start || d.created > end) return false;
            // if(d.value > max || d.value < min){
            //     scope.newGraph.warning = "Warning: Some data points are not shown in graph and may be causing line breaks.";
            //     return false;
            // }

            // var val = (d.created - last);
            // if(val > meanTime*1.5 ||val < meanTime*0.5){
            //     last = d.created;
            //     return false;
            // }
            // last = d.created;
            // console.log("here")
            // return true;
        // })
        .x(function(d) {
            var toReturn =  isNaN(xScale(new Date(d.created))) ? 0 : xScale(new Date(d.created));
            return toReturn
          })
        .y(function(d) {
            return yScale(d.value);
        });
    var lineGraph = newChart.append("path")
        .attr("d", lineFunction(data.readings))
        .attr("stroke", "#FFB90F")
        .attr("stroke-width", 2)
        .attr("fill", "none");

    
    //TOOL-TIPS
    //Tooltip container
    var tooltip = newChart.append("g")
        .style("display", "none");

    var circleElements = [], lineElements = [], textElements = [];

    //for every stream. create a circle, text, and horizontal line element and store in an array
    var newCircle = tooltip.append("circle")
        .attr("class", "tooltip-circle")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);
    circleElements.push(newCircle);

    var newText = tooltip.append("text")
        .attr("width", 100*2)
        .attr("height", 100*0.4)
        .attr("fill", "black");

    textElements.push(newText);


    //Y-axis line for tooltip
    var yLine = tooltip.append("g")
        .append("line")
        .attr("class", "tooltip-line")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", margin.bottom)
        .attr("y2", height);

   //Date text
    var timeText = tooltip.append("text")
        .attr("x", 0)
        .attr("y", margin.bottom-5)
        .attr("width", 100)
        .attr("height", 100*0.4)
        .attr("fill", "black");

    var myData = [];
    for(var x in data.readings){
        myData.push(new Date(data.readings[x][0]).getTime()*1000);
    }

    //Selection box
    var selectionBox = newChart.append("rect")
        .attr("fill", "none")
        .attr("opacity", 0.5)
        .attr("x",0)
        .attr("y", margin.bottom)
        .attr("width", 14)
        .attr("height", height-margin.bottom)
        .attr("class", "myselection");

    //Drag behaivors for the selection box.
    var dragStart = 0, dragStartPos = 0, dragEnd = 0;
    var drag = d3.drag()
        .on("drag", function(d,i) {
            var x0 = xScale.invert(d3.mouse(this)[0]).getTime(),
                i = d3.bisect(myData, x0),
                d0 = data.readings[i - 1],
                d1 = data.readings[i];
            if(d1 === undefined) return;
            var d = x0 - new Date(d0.created) > new Date(d1.created) - x0 ? d1 : d0;
            if(xScale(new Date(d.created)) > dragStartPos){
                selectionBox.attr("width", (xScale(new Date(d.created)) - dragStartPos));
            } else {
                selectionBox.attr("width", ( dragStartPos - xScale(new Date(d.created))));
                selectionBox.attr("transform", "translate(" + xScale(new Date(d.created)) + ",0)" );
            }
        })
        .on("end", function(d,i){
            dragEnd = d3.mouse(this)[0];
            if(Math.abs(dragStart - dragEnd) < 10) return;

            var x0 = xScale.invert(dragStart), x1 = xScale.invert(dragEnd);
            if(x1 > x0){
                start = x0.getTime();
                end = x1.getTime();
            } else {
                start = x1.getTime();
                end = x0.getTime();
            }

            // scope.$apply(function(){
            //     $location.search('startTime', start);
            //     $location.search('endTime', end);
            //     $location.search('time', 'custom');
            // });
            // angular.element("#hourBtn").removeClass('active');
            // angular.element("#dayBtn").removeClass('active');
            // angular.element("#weekBtn").removeClass('active');
            // angular.element("#customBtn").addClass('active');
        });
    //Hit area for selection box
    var circleHit = newChart.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() {
            tooltip.style("display", null);
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
        })
        .on("mousemove", mousemove)
        .on("mousedown", function(){
            selectionBox.attr("fill", "#b7ff64");
            dragStart = d3.mouse(this)[0];

            var x0 = xScale.invert(d3.mouse(this)[0]).getTime(),
            i = d3.bisect(myData, x0),
            d0 = data.readings[i - 1],
            d1 = data.readings[i];
        if(d1 === undefined) return;
        var d = x0 - d0[0]*1000 > d1[0]*1000 - x0 ? d1 : d0;
            selectionBox.attr("transform", "translate(" + xScale(new Date(d.created)) + ",0)" );
            dragStartPos = xScale(new Date(d.created));
        })
        .call(drag);

    //Tooltip helper
    var bisectDate = d3.bisector(function(d) {
        return new Date(d.created);
    }).left;

    function mousemove() {
        var x0 = xScale.invert(d3.mouse(this)[0]).getTime(),
            i = d3.bisect(myData, x0),
            d0 = data.readings[i - 1],
            d1 = data.readings[i];
          console.log(x0)
        var d;
        if(d0 === undefined && d1 === undefined) return;
        if(d0 === undefined){
            d = d1;
        } else if(d1 === undefined){
            d = d0;
        } else {
            if(x0 -d0.created > d1.created -x0){
                d = d1;
            } else {
                d = d0;
            }
        }
        if(d.value < min || d.value > max) return;
        circleElements[0].attr("transform", "translate(" + xScale(new Date(d.created)) + "," + yScale(d.value) + ")");
        yLine.attr("transform", "translate(" + xScale(new Date(d.created)) + "," + 0 + ")");
        timeText.text(new Date(d.created) + " | " + getFormattedText(d.value, data.sensor));

        textElements[0]
            .text(getFormattedText(d.value, data.sensor))
            .attr("transform", "translate(" + (xScale(new Date(d.created))+10) + "," + (yScale(d.value)-10) + ")");

    }

     //Formats text
    function getFormattedText(d, info){
        var f = d3.format(".1f");
        var count = Math.round(d).toString().length;
        f = d3.format(".2f");
        if(info.units === null) return f(d);
        if(info.units == "$") return info.units + f(d);
        return f(d) + info.units;
    }
  }
  
}]);
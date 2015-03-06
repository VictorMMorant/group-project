angular.module('MyApp').controller('DetailsCtrl', function($scope, $auth,$http,$stateParams) {
      $scope.data = [
          {x: 0, value: 4},
          {x: 1, value: 8},
          {x: 2, value: 15},
          {x: 3, value: 16},
          {x: 4, value: 23},
          {x: 5, value: 42}
      ];
      
      var computeThicknessDistribution = function(x,t) {
        return t / 0.2 * (0.2969*Math.sqrt(x) + -0.126*x + -0.3516 *x*x + 0.2843*Math.pow(x,3) + -0.1015*Math.pow(x,4));
      }

      var computeCamber = function(x,m,p) {
        if(x<p) {
          return  m/(p*p) * (2*p*x - x*x);
        } else {
          return m/((1-p)*(1-p)) * (1-2*p+2*p*x-x*x);
        }
      }

      var computeGradient = function(x,m,p) {
        if(x<p) {
          return  2*m/(p*p) * (p - x);
        } else {
          return 2*m/((1-p)*(1-p)) * (p - x);
        }
      }

      var drawUpper = function(x,m,p,t) {
        return computeCamber(x,m,p) + computeThicknessDistribution(x,t)* Math.cos(Math.atan(computeGradient(x,m,p)));
      }
      var drawLower = function(x,m,p,t) {
        return computeCamber(x,m,p) - computeThicknessDistribution(x,t)* Math.cos(Math.atan(computeGradient(x,m,p)));
      }
      $scope.dataWing = [];
      
      for(var i = 0; i <= Math.PI; i+=0.31416) {
        
        var x = (1-Math.cos(i))/2;
        var upper = drawUpper(x,0.05,0.7,0.8);
        var lower = drawLower(x,0.05,0.7,0.8);
        var camber = computeCamber(x,0.05,0.7);

        $scope.dataWing.push({
          x : x, 
          value: upper,
          negValue: lower, 
          camber: camber});

      }


      $scope.options = {
        axes: {
          x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', min: 0, max: 5, ticks: 5},
          y: {type: 'linear', min: 0, max: 50, ticks: 5},
        },
        series: [
          {y: 'value', color: 'steelblue', thickness: '2px', type: 'line', label: 'Simulation 1'},
        ],
        lineMode: 'linear',
        tension: 0.7,
        tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return 'Iteration: '+x;}},
        drawLegend: true,
        drawDots: true,
        columnsHGap: 5
      }

      $scope.optionsWing = {
        axes: {
          x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', min: 0, max: 1, ticks: 10},
          y: {type: 'linear', min: -1, max: 1, ticks: 10},
          y: {type: 'linear', min: -1, max: 1, ticks: 10},
          y: {type: 'linear', min: -1, max: 1, ticks: 25}
        },
        series: [
          {y: 'value', color: 'steelblue', type: 'area', label: 'Upper Wing'},
          {y: 'negValue', color: 'steelblue', type: 'area', label: 'Lower Wing' },
          {y: 'camber', color: 'orange', type: 'area' , label: 'Camber'}
        ],
        lineMode: 'linear',
        tension: 0.7,
        tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return series.label;}},
        drawLegend: true,
        columnsHGap: 5
      }
      $http.get("/details/"+$stateParams.id).
      success(function(data, status, headers, config) {
        console.log(data[0]);
        $scope.log = data[0];
      }).
      error(function(data, status, headers, config) {
        console.log("Error: "+ data );
      });
    
  });

angular.module('MyApp').controller('DetailsCtrl', function($scope, $auth,$http,$stateParams) {
      $scope.data = [];
      $scope.dataWing = [];

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
      
      var drawSymmetric = function(x,t,c) {
        return 5*t*(0.2969 * Math.sqrt(x/c) - 0.1260 * (x/c) -0.3516 * Math.pow(x/c,2) + 0.2843 * Math.pow(x/c,3) -0.1015 * Math.pow(x/c,4));
      }
      


      /** Recover Simulation */
      $scope.recoverSimulation = function(id) {

        console.log(id);
        $http.post("/recover",{ _id: id }).success(function(data, status, headers, config) {
          console.log("Succes recovering the simulation !");
        }).error(function(data, status, headers, config) {
          console.log("Error"+data);
        });
      };
      
      $scope.options = {
        axes: {
          x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', ticks: 5},
          y: {type: 'linear', ticks: 5},
        },
        series: [
          {y: 'value', color: 'steelblue', thickness: '2px', type: 'line', label: 'Lift/Drag'},
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
          x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', ticks: 10},
          y: {type: 'linear', min: -1, max: 1, ticks: 10},
          y: {type: 'linear', min: -1, max: 1, ticks: 10}
        },
        series: [
          {y: 'value', color: 'steelblue', type: 'line', label: 'Upper Wing'},
          {y: 'negValue', color: 'steelblue', type: 'line', label: 'Lower Wing' }
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
        var iterations = data[0].iterations;
        for(var i in iterations) {
          console.log(iterations[i]);
          $scope.data.push({x: iterations[i].iteration, value: iterations[i].value});
        }

        for(var i = 0; i <= $scope.log.chord; i+=0.05*$scope.log.chord) {
        
        var x = i;
        var upper = drawSymmetric(x,$scope.log.iterations[iterations.length-1].t,$scope.log.chord);
        var lower = -1*drawSymmetric(x,$scope.log.iterations[iterations.length-1].t,$scope.log.chord);
	//Rotate aa radians
	  var c=Math.cos($scope.log.iterations[iterations.length-1].aa*-1)
	  var s=Math.sin($scope.log.iterations[iterations.length-1].aa*-1)
	  x1=x*c-upper*s
	  upper=x*s+upper*c
	  lower=x*s+lower*c
        

        $scope.dataWing.push({
          x : x1, 
          value: upper,
          negValue: lower});

      }

      }).
      error(function(data, status, headers, config) {
        console.log("Error: "+ data );
      });
    
  });

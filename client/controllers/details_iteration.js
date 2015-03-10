angular.module('MyApp').controller('DetailsIterationCtrl', function($scope, $auth,$http,$stateParams) {

      $scope.iteration = parseInt($stateParams.iteration);
      $scope.prevIteration = parseInt($stateParams.iteration)-1;
      $scope.nextIteration = parseInt($stateParams.iteration)+1;
      $scope.first = function() {
        return $scope.prevIteration !== 0;
      }
      $scope.finish = function() {
        return $scope.nextIteration !== ($scope.numIterations+1);
      }
      /** Drawing function */

      var drawSymmetric = function(x,t,c) {
        return 5*t*(0.2969 * Math.sqrt(x/c) - 0.1260 * (x/c) -0.3516 * Math.pow(x/c,2) + 0.2843 * Math.pow(x/c,3) -0.1015 * Math.pow(x/c,4));
      }      

      /** PLOT DRAWING */
      $scope.data = [];
      $scope.options = {
        axes: {
          x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', min: 1, ticks: 5},
          y: {type: 'linear', min: 0, ticks: 5},
        },
        series: [
          {y: 'value', color: 'steelblue', thickness: '2px', type: 'line', label: 'Lift/Drag'},
        ],
        lineMode: 'linear',
        tension: 0.7,
        tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return 'Iteration: '+x+'\n Lift/Drag: '+Math.round(y*100)/100;}},
        drawLegend: true,
        drawDots: true,
        columnsHGap: 5
      }

      
      /** HTTP REQUESTS */

      $http.get("/details/"+$stateParams.id).
      success(function(data, status, headers, config) {
        //console.log(data[0]);
        $scope.log = data[0];
        var iterations = data[0].iterations;
        console.log(iterations);

        for(var i in iterations) {
          
          if(i >= $scope.iteration) break;

          //console.log(iterations[i]);
          $scope.data.push({x: iterations[i].iteration, value: iterations[i].value});
          
        }
        for(var i = 0; i <= $scope.log.chord; i+=0.05*$scope.log.chord) {
        
          var x = i;
          var upper = drawSymmetric(x,$scope.log.iterations[$scope.iteration].t,$scope.log.chord);
          var lower = -1*drawSymmetric(x,$scope.log.iterations[$scope.iteration].t,$scope.log.chord);
          

        $scope.dataWing.push({
            x : x, 
            value: upper,
            negValue: lower});

        }
        $scope.currentT = Math.round($scope.log.iterations[$scope.iteration-1].t*100)/100;
        $scope.currentAA = Math.round($scope.log.iterations[$scope.iteration-1].aa*100)/100;
      }).
      error(function(data, status, headers, config) {
        console.log("Error: "+ data );
      });
    
  });

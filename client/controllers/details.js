angular.module('MyApp').controller('DetailsCtrl', function($scope, $auth,$http,$stateParams) {
      $scope.data = [
          {x: 0, value: 4, otherValue: 14},
          {x: 1, value: 8, otherValue: 1},
          {x: 2, value: 15, otherValue: 11},
          {x: 3, value: 16, otherValue: 147},
          {x: 4, value: 23, otherValue: 87},
          {x: 5, value: 42, otherValue: 45}
      ];

      $scope.options = {
        axes: {
          x: {key: 'x', labelFunction: function(value) {return value;}, type: 'linear', min: 0, max: 5, ticks: 5},
          y: {type: 'linear', min: 0, max: 150, ticks: 5},
          y2: {type: 'linear', min: 0, max: 150, ticks: 5}
        },
        series: [
          {y: 'value', color: 'steelblue', thickness: '2px', type: 'area', striped: true, label: 'Simulation 1'},
          {y: 'otherValue', axis: 'y2', color: 'red', type: 'area', striped: true, label: 'Simulation 2'}
        ],
        lineMode: 'linear',
        tension: 0.7,
        tooltip: {mode: 'scrubber', formatter: function(x, y, series) {return 'Iteration: '+x;}},
        drawLegend: true,
        drawDots: true,
        columnsHGap: 5
        }

      $http.get("/details/"+$stateParams.id).
      success(function(data, status, headers, config) {
        console.log(data);
        $scope.log = data;
      }).
      error(function(data, status, headers, config) {
        console.log("Error: "+ data);
      });
    
  });

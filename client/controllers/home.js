angular.module('MyApp')
  .controller('HomeCtrl', function($scope, $auth,$http) {
    $scope.logs = [];
  	$scope.params = new Params();
    $scope.isAuthenticated = function() {
   	  console.log("isAuthenticated")
      return $auth.isAuthenticated();
    };
    $scope.startSimulation = function() {
   	  console.log("Start Simulation");
   	  $http.post("/start",{ chord: $scope.params.chord ,airSpeed: $scope.params.airSpeed }).success(function(data, status, headers, config) {
        console.log($scope.processing);

      }).error(function(data, status, headers, config) {
        console.log("Error"+data);
      });
    };

  	$http.get("/log").
  	  success(function(data, status, headers, config) {
  	  	console.log(data);
  	  	$scope.logs = data;
  	  }).
  	  error(function(data, status, headers, config) {
  	  	console.log("Error: "+ data);
  	});
    
  });


  function Params() {

    var chord = 50;
    var airSpeed = 50;

    this.__defineGetter__("chord", function () {
        return chord;
    });

    this.__defineSetter__("chord", function (val) {        
        chord = parseInt(val);
    });

    this.__defineGetter__("airSpeed", function () {
        return airSpeed;
    });

    this.__defineSetter__("airSpeed", function (val) {        
        airSpeed = parseInt(val);
    });


}
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
   	  $http.post("/start",{ chord: $scope.params.chord ,L: $scope.params.L }).success(function(data, status, headers, config) {
        console.log("Succes starting the simulation !");
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

    var chord = 3;
    var L = 5;

    this.__defineGetter__("chord", function () {
        return chord;
    });

    this.__defineSetter__("chord", function (val) {        
        chord = parseInt(val);
    });

    this.__defineGetter__("L", function () {
        return L;
    });

    this.__defineSetter__("L", function (val) {        
        L = parseInt(val);
    });


}
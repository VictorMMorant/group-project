angular.module('MyApp')
  .controller('DetailsCtrl', function($scope, $auth,$http,$stateParams) {
      $scope.log = {};
      $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
      $scope.series = ['Series A', 'Series B'];
      $scope.data = [
        [65, 59, 80, 81, 56, 55, 40],
        [28, 48, 40, 19, 86, 27, 90]
      ];
      $http.get("/details/"+$stateParams.id).
      success(function(data, status, headers, config) {
        console.log(data);
        $scope.log = data;
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
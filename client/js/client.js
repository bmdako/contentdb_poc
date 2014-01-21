var contentdb_poc = angular.module('contentdb_poc', ['ngRoute'])

contentdb_poc.controller('Article', function($scope, $http){

    $scope.article = {}

    $http.get("/api/article/scan").success(function(data){
        $scope.articles = data
    })

    $scope.getArticle = function(id){
        $http.get("/api/article/json/" + id).success(function(data){
            $scope.article = data
        })
    }

    $scope.saveArticle = function(){
        if ($scope.article.id)
        {
            $http.put("/api/article" + $scope.article.id, $scope.article).success(function(data){
                var a = false
                for(var i = 0, bound = $scope.articles.length; i < bound; ++i) {
                    if ($scope.articles[i].id === $scope.article.id) {
                        a = true
                    }
                }

                if (a === false) {
                    $scope.articles.push($scope.article)
                }
                // TODO: Show "OK"
            })
        } else {
        }
    }

    $scope.deleteArticle = function(index, id) {
        $http.delete("/api/article/" + id).success(function(data) {
            $scope.articles.splice(index, 1)
            $scope.article = {}
        })
    }

    $scope.clearEditor = function() {
        $scope.article = {}
    }
})

// angular.module('deepLinking', ['ngRoute', 'ngSanitize'])
// contentdb_poc.config(function($routeProvider) {
//     console.log("s")
//     console.log($routeProvider)
//      $routeProvider.
//        when("/ghostdown",  {templateUrl:'ghostdown.html',  controller:'Article'})
//        //when("/settings", {templateUrl:'settings.html', controller:SettingsCntl});
//   })
// console.log(contentdb_poc)

// angular.module('deepLinking', ['ngRoute', 'ngSanitize'])
//   .config(function($routeProvider) {
//      $routeProvider.
//        when("/welcome",  {templateUrl:'welcome.html',  controller:WelcomeCntl}).
//        when("/settings", {templateUrl:'settings.html', controller:SettingsCntl});
//   });
 
// AppCntl.$inject = ['$scope', '$route']
// function AppCntl($scope, $route) {
//  $scope.$route = $route;
 
//  // initialize the model to something useful
//  $scope.person = {
//   name:'anonymous',
//   contacts:[{type:'email', url:'anonymous@example.com'}]
//  };
// }
 
// function WelcomeCntl($scope) {
//  $scope.greet = function() {
//   alert("Hello " + $scope.person.name);
//  };
// }
 
// function SettingsCntl($scope, $location) {
//  $scope.cancel = function() {
//   $scope.form = angular.copy($scope.person);
//  };
 
//  $scope.save = function() {
//   angular.copy($scope.form, $scope.person);
//   $location.path('/welcome');
//  };
 
//  $scope.cancel();
// }
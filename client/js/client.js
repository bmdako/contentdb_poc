var contentdb_poc = angular.module('contentdb_poc', [])

contentdb_poc.controller('Article', function($scope, $http){

    $scope.article = {}

    $http.get("/articles").success(function(data){
        $scope.articles = data
    })

    $scope.getArticle = function(id){
        $http.get("/json/" + id).success(function(data){
            $scope.article = data
        })
    }

    $scope.saveArticle = function(){
        if ($scope.article.id)
        {
            $http.put("/" + $scope.article.id, $scope.article).success(function(data){
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
        $http.delete("/" + id).success(function(data) {
            $scope.articles.splice(index, 1)
            $scope.article = {}
        })
    }

    $scope.clearEditor = function() {
        $scope.article = {}
    }
})

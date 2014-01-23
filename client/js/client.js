angular.module('contentdb_poc', [])
.controller('ArticleCtrl', function($scope, $http){

    $scope.article = {}

    $http.get("/api/scan").success(function(data){
        $scope.articles = data
    })

    $scope.getArticle = function(id){
        $http.get("/api/json/" + id).success(function(data){
            $scope.article = data
        })
    }

    $scope.saveArticle = function(){
        if ($scope.article.id) {
            $http.put("/api/" + $scope.article.id, $scope.article).success(function(data) {
                console.log("da")
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
        }
    }

    $scope.deleteArticle = function(index, id) {
        $http.delete("/api/" + id).success(function(data) {
            $scope.articles.splice(index, 1)
            $scope.article = {}
        })
    }

    $scope.clearEditor = function() {
        $scope.article = {}
    }
})

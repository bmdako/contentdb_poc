angular.module('contentdb_poc', [])

.controller('DashboardCtrl', function($scope, $http){

    $scope.article = {}
    $scope.Editing = false

    function scan() {
        $http.get("/api/scan").success(function(data){
            $scope.articles = data
        })
    }
    scan()

    $scope.getArticle = function(id){
        $http.get("/api/" + id).success(function(data){
            $scope.article = data
            $scope.Editing = true
        })
    }

    $scope.saveArticle = function(){
        if ($scope.article.id) {
            $http.put("/api/" + $scope.article.id, $scope.article).success(function(data) {
                var newArticle = true
                for(var i = 0, bound = $scope.articles.length; i < bound; ++i) {
                    if ($scope.articles[i].id === $scope.article.id) {
                        newArticle = false
                    }
                }

                if (newArticle) {
                    $scope.articles.push($scope.article)
                }

                $scope.getArticle($scope.article.id)
                // TODO: Show "OK"
            })
        }
    }

    $scope.clearEditor = function() {
        $scope.article = {}
        $scope.Editing = true
    }
    
    $scope.deleteArticle = function() {
        if ($scope.article.id) {
            $http.delete("/api/" + $scope.article.id).success(function(data) {
                $scope.article = {}
            })
        }
    }

    $scope.closeEditor = function() {
        scan()
        $scope.article = {}
        $scope.Editing = false
    }
})
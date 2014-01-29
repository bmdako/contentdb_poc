angular.module('contentdb_poc', ['ngRoute', 'ngSanitize'])

.config(function($routeProvider, $locationProvider) {

  $routeProvider.when('/', {
    templateUrl: 'editor_partials/dashboard.html',
    controller: DashboardCtrl
  })

    $routeProvider.when('/edit/', {
    templateUrl: 'editor_partials/edit.html',
    controller: ArticleCtrl
  })

  $routeProvider.when('/edit/:articleId', {
    templateUrl: 'editor_partials/edit.html',
    controller: ArticleCtrl
  })
  
})

function DashboardCtrl($scope, $http, $location){

    $http.get("/api/scan").success(function(data){
        $scope.articles = data
    })

    $scope.openEditor = function(id) {

        var editUrl = '/edit'
        if (id !== undefined)
        {
            editUrl += '/' + id
        }
        $location.path(editUrl)
    }
}

function ArticleCtrl($scope, $http, $routeParams, $location){

    if ($routeParams.articleId) {
        $http.get("/api/" + $routeParams.articleId).success(function(data){
            $scope.article = data
        })
    } else {
        $scope.article = {}
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

                // TODO: Show "OK"
            })
        }
    }

    $scope.clearEditor = function() {
        $scope.article = {}
    }
    
    $scope.deleteArticle = function() {
        if ($scope.article.id) {
            $http.delete("/api/" + $scope.article.id).success(function(data) {
                $scope.article = {}
            })
        }
    }

    $scope.closeEditor = function() {
        $location.path('/')
    }

    $scope.showDiff = function() {
        $scope.showDiffSection = true
        if ($scope.article.id) {
            $http.put("/api/diff/" + $scope.article.id, $scope.article).success(function(data) {
                $scope.Diff = true
                $scope.diffdata = data
            })
        }
    }
}

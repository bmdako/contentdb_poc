angular.module('contentdb_poc', ['ngRoute', 'ngSanitize'])

.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        templateUrl: 'editor_partials/dashboard.html',
        controller: DashboardCtrl
    });

    $routeProvider.when('/edit/', {
        templateUrl: 'editor_partials/editor.html',
        controller: ArticleCtrl
    });

    $routeProvider.when('/edit/:articleId', {
        templateUrl: 'editor_partials/editor.html',
        controller: ArticleCtrl
    });
});

function DashboardCtrl($scope, $http, $location){
    $http.get('/api/scan').success(function(data) {
        $scope.articles = data;
    });

    // $http.get('/api/nodequeue/210').success(function(data) {
    //     $scope.nodequeue = data;
    // });

    getNodequeue(210, function(data) {
        $scope.nodequeue210 = data
    });

    getNodequeue(5, function(data) {
        $scope.nodequeue5 = data
    });

    $scope.openEditor = function(id) {
        var editUrl = '/edit';
        if (id !== undefined)
        {
            editUrl += '/' + id;
        }
        $location.path(editUrl);
    };

    function getNodequeue(id, callback) {
        $http.get('/api/nodequeue/' + id).success(function(data) {
            callback(data);
        });
    }
}

function ArticleCtrl($scope, $http, $routeParams, $location){
    if ($routeParams.articleId) {
        $http.get('/api/' + $routeParams.articleId).success(function(data){
            if (data.id !== undefined) {
                $scope.article = data;
                console.log($scope.article);
                //sessionStorage.setItem("article", JSON.stringify(data))
                //localStorage.setItem("article", JSON.stringify(data))
            } else {
                $location.path('/edit');
            }
        }).error(function(data, status) {
            if (status === 404) {
                $http.get('/api/node/' + $routeParams.articleId).success(function(data) {
                    if (data.id !== undefined) {
                        $scope.article = data;
                        console.log($scope.article);
                    } else {
                        $location.path('/edit');
                    }
                });
            }
        });
    }

    $scope.saveArticle = function(){
        if ($scope.article.id && $scope.article.version) {
            $http.put('/api/' + $scope.article.id, $scope.article).success(function(data) {
                // TODO: Show "OK"
            });
        } else {
            $http.post('/api/', $scope.article).success(function(data) {
                // TODO: Show "OK"
            });
        }
    };

    $scope.clearEditor = function() {
        $location.path('/edit');
    };
    
    $scope.deleteArticle = function() {
        if ($scope.article.id) {
            $http.delete('/api/' + $scope.article.id).success(function(data) {
                $location.path('/');
            });
        }
    };

    $scope.closeEditor = function() {
        $location.path('/');
    };

    $scope.showDiff = function() {
        $scope.showDiffSection = true;
        if ($scope.article.id) {
            $http.put('/api/diff/' + $scope.article.id, $scope.article).success(function(data) {
                $scope.Diff = true;
                $scope.diffdata = data;
            });
        }
    };

    $scope.copyArticle = function() {
        
    };
}

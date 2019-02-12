angular
    .module('portalApplicationApp')
    .directive('resize', resize)
    resize.$inject = ['$window'];
    function resize ($window){
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return {
                    'h': window.innerHeight,
                    'w': window.innerWidth
                };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;
                scope.style = function () {
                    return {
                        //'height': (newValue.h) + 'px',
                        'width': (newValue.w - 277) + 'px'
                    };
                };
                scope.slideStyle = function () {
                    return {
                        //'height': (newValue.h) + 'px',
                        'width': 4000 + 'px'
                    };
                };
            }, true);
            w.bind('resize', function () {
                scope.$apply();
            });
        }
    }
    /*.directive('resize', function ($window) {
        return function (scope, element) {
            var w = angular.element($window);
            scope.getWindowDimensions = function () {
                return {
                    'h': window.innerHeight,
                    'w': window.innerWidth
                };
            };
            scope.$watch(scope.getWindowDimensions, function (newValue, oldValue) {
                console.log(newValue)
                scope.windowHeight = newValue.h;
                scope.windowWidth = newValue.w;

                scope.style = function () {
                    return {
                        'height': (newValue.h) + 'px',
                        'width': (newValue.w) + 'px'
                    };
                };
            }, true);
            w.bind('resize', function () {
                scope.$apply();
            });
        }
    });*/

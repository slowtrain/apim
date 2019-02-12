angular
    .module('portalApplicationApp')
    .directive('sc', sc);

    sc.$inject = ['$rootScope'];
    function sc ($rootScope){
        return function(scope, element, attrs){
            element.bind("selectstart", function() { return false; }); // 주의: 이 기능은 summernote 에디터에 마우스 cursor가 위치하지 못하게 만든다.
            element.bind("dragstart", function() { return false; });
            element.bind("copy", function() { return $rootScope.allowCopy; });
            element.bind("paste", function() { return false; });
            element.bind("cut", function() { return false; });
        }
    }
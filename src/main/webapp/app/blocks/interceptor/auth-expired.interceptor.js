(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('authExpiredInterceptor', authExpiredInterceptor);


    authExpiredInterceptor.$inject = ['$rootScope', '$q', '$injector'];

    function authExpiredInterceptor($rootScope, $q, $injector) {
        var service = {
            responseError: responseError
        };

        return service;

        function responseError(response) {
            // If we have an unauthorized request we redirect to the login page
            // Don't do this check on the account API to avoid infinite loop

            // 서버에서 admin URI만 401 에러로 던져준다.
            // 따라서 다른 URI(apis, organizations..)에 대한 403에러를 여기에 포함시킨다.

            if (response.status === 403 || (response.status === 401 && angular.isDefined(response.data.path) && response.data.path.indexOf('/api/authentication') === -1)) {
                var Auth = $injector.get('Auth');
                var state = $injector.get('$state');
                var uibModalStack = $injector.get('$uibModalStack');
                var commonUtil = $injector.get('CommonUtil');

                /*var to = $rootScope.toState;
                var params = $rootScope.toStateParams;
                if (to.name !== 'accessdenied') Auth.storePreviousState(to.name, params);*/

                Auth.logout();
                state.go('login');

                uibModalStack.dismissAll();
                commonUtil.onError("세션이 종료되었습니다.<br/>다시 로그인 하시기 바랍니다.");

                // 서버를 호출한 본 함수에서 에러모달창을 띄우면 세션종료 모달창과 중복된다.
                // 따라서 본 함수로 에러를 전달하지 못하도록 여기서 resolve.
                return $q.resolve(response);

                //var LoginService = $injector.get('LoginService');
                //LoginService.open();
            } else return $q.reject(response);
        }
    }
})();

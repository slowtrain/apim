(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Account', Account);

    Account.$inject = ['$resource'];

    function Account($resource) {
        return $resource('api/account', {}, {
            'get': {
                method: 'GET',
                params: {},
                isArray: false,
                interceptor: {
                    response: function (response) {
                        // expose response
                        return response;
                    }
                }
            },
            'save': {
                url: 'api/accountUpdate',
                method: 'PUT',
                params: {},
                isArray: false
            },
            'withdraw': {
                url: 'api/account/withdraw',
                method: 'GET',
                params: {},
                isArray: false
            },
            'checkSession': {
                url: 'api/account/checkSession',
                method: 'GET'
            },
            'resetPasswordAuth': {
                url: 'api/account/reset_password/auth',
                method: 'POST'
            },
            'resetPasswordSend': {
                url: 'api/account/reset_password/init/:type',
                method: 'POST',
                params: {
                    type: '@type'
                }
            },
            'findId': {
                url: 'api/account/find-id',
                method: 'POST'
//                transformResponse: function (data, headers, status) {
//                    data = (status >= 200 && status < 300)? {'maskingLogin' : data } : data;
//                    return data;
//                }
            },
            'deleteConfirm':{
                url:'/api/account/delete-confirm',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                params:{
                    loginPassword : '@loginPassword'
                }
            }
        });
    }
})();

(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('User', User);

    User.$inject = ['$resource'];

    function User($resource) {
        return $resource('api/users/:login', {}, {
            'query': {method: 'GET', isArray: true},
            'get': {
                method: 'GET',
                transformResponse: function (data) {
                    data = angular.fromJson(data);
                    return data;
                }
            },
            'save': {method: 'POST'},
            'update': {method: 'PUT'},
            'delete': {method: 'DELETE'},
            'updateMyInfo': {
                url: 'api/accountUpdate/myinfo',
                method: 'PUT'
            },
            'saveForAdmin': {
                url: 'api/admin/users',
                method: 'POST'
            },
            'listAllForAdmin': {
                url: 'api/admin/users',
                method: 'GET',
                isArray: true
            },
            'updateForAdmin': {
                url: 'api/admin/users',
                method: 'PUT'
            },
            'deleteForAdmin': {
                url: 'api/admin/users/:userId',
                method: 'GET',
                params: {
                    userId: '@userId'
                }
            },
            'moveUserForAdmin': {
                url: 'api/admin/users/:userId/move',
                method: 'GET',
                params: {
                    userId: '@userId',
                    organizationId: '@organizationId'
                }
            },
            'setAdmin': {
                url: 'api/admin/users/:userId/setadmin',
                method: 'GET',
                params: {
                    userId: '@userId',
                    flag: '@flag'
                }
            }
        });
    }
})();

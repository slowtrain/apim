(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Code', Code);

    Code.$inject = ['$resource'];

    function Code($resource) {
        return $resource('api/codes/:name', null, {
            'authenticationTypes': {
                method: 'GET',
                isArray: true,
                params: {
                    name: 'authentication-types'
                }
            },
            'apiStatusTypes': {
                method: 'GET',
                isArray: true,
                params: {
                    name: 'api-status-types'
                }
            },
            'appStatusTypes': {
                method: 'GET',
                isArray: true,
                params: {
                    name: 'app-status-types'
                }
            },
            'scopeTypes': {
                method: 'GET',
                isArray: true,
                params: {
                    name: 'oauth-scope-types'
                }
            }
        });
    }
})();

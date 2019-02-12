(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Activate', Activate);

    Activate.$inject = ['$resource'];

    function Activate ($resource) {
        var service = $resource('api/activate', {}, {
            'get': { method: 'GET', params: {}, isArray: false},
            'checkActivateKey': {
                url: 'api/checkActivateKey',
                method: 'GET',
                params: {},
                isArray: false
            }
        });

        return service;
    }
})();

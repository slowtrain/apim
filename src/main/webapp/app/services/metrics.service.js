/**
 * Created by ybsong on 16. 10. 24.
 */
(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Metrics', Metrics);

    Metrics.$inject = ['$resource'];

    function Metrics($resource) {
        var service = $resource('api/metrics',
            {}, {
                'query': {method: 'POST', isArray: true},
                'get': {method: 'GET'},
                'save': {method: 'POST'},
                'update': {method: 'PUT'},
                'delete': {method: 'DELETE'},
                'search': {
                    method: 'POST',
                    isArray: true,
                    transformRequest: function (data) {
                        data.fromTime = Date.parse(data.fromTime);
                        data.toTime = Date.parse(data.toTime);
                    }
                }
            });

        return service;
    }
})();

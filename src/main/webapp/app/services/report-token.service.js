/**
 * Created by ybsong on 16. 10. 24.
 */
(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ReportToken', ReportToken);

    ReportToken.$inject = ['$resource'];

    function ReportToken($resource) {
        return $resource('api/:auth/reports/tokens/:action',
            {},
            {
                'query': {
                    method: 'GET',
                    isArray: true
                },
                'trend': {
                    method: 'GET',
                    params: {
                        action: 'trend'
                    },
                    isArray: true
                }
            });
    }
})();

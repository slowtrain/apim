(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ReportService', ReportService);

    ReportService.$inject = ['$resource'];

    function ReportService($resource) {
        return $resource('/api/reports/:type/:orgType', null, {
            'organizations': {
                method: 'GET',
                params: {
                    type: 'organizations'
                }
            },
            'apps': {
                method: 'GET',
                isArray: true,
                params: {
                    type: 'apps'
                }
            },
            'apis': {
                method: 'GET',
                isArray: true,
                params: {
                    type: 'apis'
                }
            }
        });
    }
})();

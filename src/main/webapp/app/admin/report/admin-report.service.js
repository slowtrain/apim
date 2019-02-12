(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('AdminReportService', AdminReportService);

    AdminReportService.$inject = ['$resource'];

    function AdminReportService($resource) {
        return $resource('/api/admin/reports/:type', null, {
            'organizations': {
                method: 'GET',
                isArray: true,
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

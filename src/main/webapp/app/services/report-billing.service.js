/**
 * Created by ybsong on 16. 10. 24.
 */
(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('ReportBilling', ReportBilling);

    ReportBilling.$inject = ['$resource'];

    function ReportBilling($resource) {
        return $resource('api/:auth/reports/billings/:action',
            {},
            {
                'query': {
                    method: 'GET'
                },
                'trend': {
                    method: 'GET',
                    params: {
                        action: 'trend'
                    },
                    isArray: true
                },
                'charge': {
                    method: 'GET',
                    params: {
                        action: 'charge',
                        chargeMonth: '@chargeMonth',
                        providerId: '@providerId',
                        orgName: '@orgName'
                    },
                    isArray: true
                },
                'chargeOrgs': {
                    url: 'api/:auth/reports/billings/:action/orgs',
                    method: 'GET',
                    params: {
                        action: 'charge',
                        chargeMonth: '@chargeMonth',
                        providerId: '@providerId'
                    },
                    isArray: true
                }
            });
    }
})();

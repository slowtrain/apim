/**
 * Created by ybsong on 16. 10. 24.
 */
(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('BillingMetrics', BillingMetrics);

    BillingMetrics.$inject = ['$resource'];

    function BillingMetrics($resource) {
        return $resource('api/admin/billingmetrics', {},
            {
                'query': {method: 'GET', isArray: true},
                'get': {method: 'GET'},
                'save': {method: 'POST'},
                'update': {method: 'PUT'},
                'delete': {method: 'DELETE'},
                'queryTokens': {
                    url: 'api/admin/billingmetrics/tokens',
                    method: 'GET',
                    isArray: true
                },
                'search': {
                    method: 'POST',
                    isArray: true,
                    transformRequest: function (data) {
                        data.fromTime = Date.parse(data.fromTime);
                        data.toTime = Date.parse(data.toTime);
                    }
                },
                'trend': {
                    url: 'api/admin/billingmetrics/trend',
                    method: 'GET',
                    isArray: true
                },
                'tokenTrend': {
                    url: 'api/admin/billingmetrics/tokens/trend',
                    method: 'GET',
                    isArray: true
                }
            });
    }
})();

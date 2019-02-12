/**
 * Created by cskim on 18. 05. 31.
 */
(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('BillingCharge', BillingCharge);

    BillingCharge.$inject = ['$resource'];

    function BillingCharge($resource) {
        return $resource('api/charge/:action',
            {},
            {
                'queryProviding': {
                    url: '/api/charge/select/providing',
                    method: 'GET',
                    isArray: true
                },
                'queryUsing': {
                    url: '/api/charge/select/using',
                    method: 'GET',
                    isArray: true
                },
                'update': {
                    method: 'PUT',
                    params: {
                        action: 'update'
                    }
                },
                'usedAppList': {
                    url: '/api/charge/:orgId/:id/apps',
                    method: 'GET',
                    isArray: true,
                    params: {
                        orgId: '@orgId',
                        id: '@id'
                    }
                },
                'accountSelect': {
                    url: '/api/charge/account/select',
                    method: 'GET',
                    isArray: true
                },
                'accountUpdate': {
                    url: '/api/charge/account/update',
                    method: 'PUT'
                },
            });
    }
})();

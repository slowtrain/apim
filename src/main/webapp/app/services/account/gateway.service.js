(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Gateway', Gateway);

    Gateway.$inject = ['$resource'];

    function Gateway ($resource) {
        var service = $resource('/api/clusters/:clusterId/gateways', null, {
            'list': {
                method: 'GET',
                isArray: true,
                params:{
                    clusterId : '@clusterId'
                }
            },
            'create':{
                method:'POST',
                params:{
                    clusterId : '@clusterId'
                }
            },
            'update':{
                url:'/api/clusters/:clusterId/gateways/:gatewayId',
                method: 'PUT',
                params:{
                    clusterId : '@clusterId',
                    gatewayId : '@gatewayId'
                }
            },
            'delete':{
                url:'/api/clusters/:clusterId/gateways/:gatewayId',
                method: 'DELETE',
                params:{
                    clusterId : '@clusterId',
                    gatewayId : '@gatewayId'
                }
            },
            'listCluster': {
                url:'/api/clusters',
                method: 'GET',
                isArray: true
            },
            'createCluster':{
                url:'/api/clusters',
                method:'POST'
            },
            'updateCluster':{
                url:'/api/clusters/:clusterId',
                method: 'PUT',
                params:{
                    clusterId : '@clusterId'
                }
            },
            'deleteCluster':{
                url:'/api/clusters/:clusterId',
                method: 'DELETE',
                params:{
                    clusterId : '@clusterId'
                }
            },
            'shareCluster':{
                url:'/api/clusters/:clusterId/share',
                method: 'POST',
                params:{
                    clusterId : '@clusterId'
                }
            },
            'sharingOrgs':{
                url:'/api/clusters/:clusterId/shared',
                method: 'GET',
                isArray: true,
                params:{
                    clusterId : '@clusterId'
                }
            },
            'listFragments':{
                url:'/api/clusters/:clusterId/fragments',
                method: 'GET',
                isArray: true,
                params:{
                    clusterId : '@clusterId'
                }
            },
            'healthcheck': {
                url:'/api/clusters/healthcheck',
                method: 'GET',
                isArray: true
            }
        });
        return service;
    }
})();

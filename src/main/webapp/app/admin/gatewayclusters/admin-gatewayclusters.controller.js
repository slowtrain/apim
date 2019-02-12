(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('GatewayClusterController', GatewayClusterController);

    GatewayClusterController.$inject = ['$rootScope', '$interval', 'CommonUtil', '$scope', 'Gateway', '$uibModal', 'Principal', 'ParseLinks', 'AlertService', '$state', 'JhiLanguageService'];

    function GatewayClusterController($rootScope, $interval, CommonUtil, $scope, Gateway, $uibModal, Principal, ParseLinks, AlertService, $state, JhiLanguageService) {

        var vm = this;

        vm.authorities = ['ROLE_ADMIN'];
        vm.add = add;
        vm.remove = remove;
        vm.edit = edit;
        vm.loadAll = loadAll;
        vm.loadAll();
        vm.viewMenu = viewMenu;
        vm.shareCluster = shareCluster;
        vm.showGWMonitoring = showGWMonitoring;
        vm.isOpenMonitoring = true;
        showGWMonitoring();

        vm.currentDate = new Date();
        /*currentDate();
        function currentDate() {
            var interval = $interval(function () {
                vm.currentDate = new Date();
                $rootScope.$on('$stateChangeSuccess', function(){$interval.cancel(interval);});
            }, 1000);
        }*/

        function loadAll() {
            Gateway.listCluster().$promise.then(function (response) {
                vm.clusters = response;
                vm.clusters.forEach(function (cluster, i) {
                    cluster.gateways = Gateway.list({clusterId: cluster.id});
                });
            });
        }

        function showGWMonitoring() {
            if (vm.isOpenMonitoring) {
                Gateway.healthcheck().$promise.then(function (response) {
                    vm.results = response;
                }).catch(onError);
            }
        }

        function viewMenu(cluster) {
            vm.selectCluster = cluster;
            cluster.selected = true;
        }

        function shareCluster(cluster) {
            cluster.selected = false;
            $uibModal.open({
                templateUrl: 'app/admin/gatewayclusters/cluster-share.html',
                controller: 'ClusterShareController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        cluster: cluster
                    }
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        }

        function add(cluster) {
            if (cluster) cluster.selected = false;
            $uibModal.open({
                templateUrl: 'app/admin/gatewayclusters/gateway-dialog.html',
                controller: 'GatewayDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        cluster: cluster,
                        mode: 'register'
                    }
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        }

        function remove(type, cluster, gateway) {
            cluster.selected = false;
            var name = (gateway) ? gateway.name + " 게이트웨이를" : cluster.name + " 클러스터를";

            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items: function () {
                        return {
                            data: name,
                            type: type
                        }
                    }
                }
            }).result.then(function (result) {
                if (gateway) {
                    Gateway.delete({clusterId: cluster.id, gatewayId: gateway.id}, onSuccess, onError)
                }
                else {
                    Gateway.deleteCluster({clusterId: cluster.id}, onSuccess, onError)
                }
            });
        }

        function edit(cluster, gateway) {
            cluster.selected = false;
            $uibModal.open({
                templateUrl: 'app/admin/gatewayclusters/gateway-dialog.html',
                controller: 'GatewayDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        cluster: cluster,
                        gateway: gateway
                    }
                }
            }).result.then(function (result) {
                vm.loadAll();
            });
        }

        function onSuccess(result) {
            vm.loadAll();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }


        vm.dynamicPopover = {
            templateUrl: 'app/layouts/popover-template/gateway-popover.html'
        };

    }
})();

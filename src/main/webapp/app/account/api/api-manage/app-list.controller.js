(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AppListController', AppListController);

    AppListController.$inject =['$uibModalInstance', 'selection', '$state', 'Api', '$uibModal'];

    function AppListController($uibModalInstance, selection, $state, Api, $uibModal) {
    	var vm = this;
    	vm.state = $state;
        var api_id = selection.id;
        var mode = selection.mode;

        vm.authorities = ['ROLE_API_VIEW', 'ROLE_ADMIN'];
        vm.loadAll = loadAll;
        vm.loadAll();

        vm.clear = clear;

        function loadAll(){
        	if(mode == 'admin') {
            	Api.usedAppListForAdmin({id:api_id}).$promise.then(function(response){
            		vm.apps = response;
                });
        	} else {
            	Api.usedAppList({id:api_id}).$promise.then(function(response){
            		vm.apps = response;
                });
        	}
        }

        function onSuccess () {
        	vm.loadAll();
        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();

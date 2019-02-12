(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('apiForumController', apiForumController);

    apiForumController.$inject = ['$uibModalInstance', 'api', 'Api'];

    function apiForumController ($uibModalInstance, api, Api) {
        var vm = this;
        vm.clear = clear;
        vm.loadAll = loadAll;
        loadAll();

        function loadAll() {
        	Api.getForumsByApi({id:api.id}).$promise.then(function(response){
                vm.forumList = response;
        	});
        }

        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();

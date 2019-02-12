(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('listModalController', listModalController);

    listModalController.$inject = ['$uibModalInstance', 'items'];

    function listModalController ($uibModalInstance, items) {
        var vm = this;
        vm.clear = clear;
        vm.conform = conform;
        vm.items = items;
        function clear () {
            $uibModalInstance.dismiss('cancel');
        }
        function conform(item){
            $uibModalInstance.close(item);
        }
    }
})();

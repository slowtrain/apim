(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('MappingContentsController', MappingContentsController);

    MappingContentsController.$inject = ['ApiGroup', '$scope', '$uibModalInstance', 'selectedContents', 'Principal', 'ApprovalLine', 'Api', 'CommonUtil'];

    function MappingContentsController(ApiGroup, $scope, $uibModalInstance, selectedContents, Principal, ApprovalLine, Api, CommonUtil) {
        var vm = this;
        vm.clear = clear;
        vm.save = save;
        vm.selectedContents = selectedContents;
        vm.checkingOneCheckBox = checkingOneCheckBox;
        vm.result = [];

        if (selectedContents) {
            if (selectedContents.type == 'mappingApiGroups') {
                vm.title = '연동 API 그룹 선택';
                ApiGroup.listForAdmin().$promise.then(function(response){
                    vm.apiGroups = d3.nest().key(function(response){
                        selectedContents.data.apiGroups.forEach(function(g){
                            if (response.id == g.id) {
                                response.checked = true;
                                vm.result.push(response);
                            }
                        });
                        return response.organization.name
                    }).entries(response);
                });
            }
        }

        vm.contentsMappingApigroupPopover = {
                templateUrl : 'app/layouts/popover-template/contents-mapping-apigroup-popover.html'
        };

        function checkingOneCheckBox (g) {
            g.checked? vm.result.push(g) : vm.result.splice(vm.result.indexOf(g), 1);
        }

        function clear() {
            $uibModalInstance.dismiss();
        }

        function save() {
            $uibModalInstance.close(vm.result);
        }
    }
})();

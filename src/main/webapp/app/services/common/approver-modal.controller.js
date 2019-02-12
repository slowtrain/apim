(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApproverController', ApproverController);
    ApproverController.$inject = ['$uibModalInstance', '$stateParams', '$uibModal', 'data', 'Approval'];

    function ApproverController($uibModalInstance, $stateParams, $uibModal, data, Approval) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.clear = clear;
        vm.data = data;
        vm.approvers = [];
        loadAll();

        function loadAll() {
            Approval.progress({id: data.id}).$promise.then(function (response) {
                response.forEach(function (obj) {
                    if (obj.type) vm.approvers.push(obj); // type이 존재하는 경우는 배열이 아니다.
                    else {
                        Object.keys(obj).forEach(function (key) {
                            vm.approvers.push(obj[key]);
                        });
                    }
                });
                vm.approvers.forEach(function (a) {
                    a.typeName = a.type == 'ORGANIZATION' ? a.typeName = '기관' : a.typeName = '사용자';
                    if (!a.decision) a.decision = {name: "승인 진행 중"};
                });
            });
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();

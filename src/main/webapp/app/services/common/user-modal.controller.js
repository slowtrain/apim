(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('UserModalController', UserModalController);

    UserModalController.$inject = ['CommonUtil', '$scope', '$uibModalInstance', 'selections'];

    function UserModalController(CommonUtil, $scope, $uibModalInstance, selections) {
        var vm = this;
        if(selections.type == 'USER') vm.user = selections.delegate;
        else vm.partner = selections.delegate;

        vm.displayActivated = displayActivated;
        vm.authorities = ['ROLE_HASLOGIN'];
        vm.clear = clear;
        vm.fileSize = CommonUtil.fileSize;
        vm.fileDown = fileDown;

        function fileDown(file) {
            if($scope.account) window.location = '/files/download/'+file.id;
        }

        function displayActivated(user){
            switch (user.state) {
                case 'ACTIVE': return '활성';
                case 'INACTIVE': return '비활성';
                case 'REGISTERING': return '등록진행중';
                case 'WITHDRAWING': return '탈퇴진행중';
            }
        }

        function onSuccess(result) {
            $uibModalInstance.close(result);
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }
    }
})();

(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('modalController', modalController);

    modalController.$inject = ['$uibModalInstance', 'items', 'AlertService', 'Account', 'CommonUtil'];

    function modalController($uibModalInstance, items, AlertService, Account, CommonUtil) {
        var vm = this;
        vm.items = items;
        vm.messages = (items.message)? vm.items.message.split('<br/>'):
                              (items.type=='delete')? vm.items.data.concat(' 삭제하시겠습니까?').split('<br/>'):
                              (items.type=='unuse')? vm.items.data.concat(' 삭제하시겠습니까?').split('<br/>') : []; //신한에서만 미사용 처리시 '사용정지' 용어를 '삭제'로 교체함
        vm.detailComment = '';
        vm.yes = yes;
        vm.clear = clear;
        // if(vm.items.type=='activate') vm.items.message = '승인이 완료되면 정상적으로 이용하실 수 있습니다.';

        function clear() {
            if (vm.items.type == 'changeCaptcha') $uibModalInstance.close('changeCaptcha');
            if (vm.items.type == 'activate') $uibModalInstance.close('activate');
            if (vm.items.type == 'withdraw') $uibModalInstance.close(false);
            if (vm.items.type == 'withdrawConfirm') $uibModalInstance.close('withdrawConfirm');
            if (vm.items.type == 'modify') $uibModalInstance.close('modify');
            if (vm.items.type == 'register') $uibModalInstance.close('register');
            if (vm.items.type == 'redeploy') $uibModalInstance.close('redeploy');
            if (vm.items.type == 'orgDeactivate') $uibModalInstance.close(false);
            $uibModalInstance.dismiss();
        }

        function yes() {
            if (vm.loginPassword) Account.deleteConfirm({loginPassword: vm.loginPassword}, close, onError);
            else close();
        }

        function close() {
            if (!vm.detailComment) vm.detailComment = true;
            $uibModalInstance.close(vm.detailComment);
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();

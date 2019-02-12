(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ModalController', ModalController);

    ModalController.$inject = ['$timeout', '$uibModalInstance', 'params', 'type'];

    function ModalController($timeout, $uibModalInstance, params, type) {
        var vm = this;
        vm.yes = yes;
        vm.clear = clear;

        vm.params = params;
        vm.type = type;
        vm.messages = (params.message)? params.message.split('<br/>'): [];
        if (type==0){
            vm.params.title = (!params.title)? '알림' : params.title;
            if (vm.params.timeout){
                $timeout(function(){ $uibModalInstance.close(false) }, vm.params.timeout);
            }
        }else if (type==1){
            vm.params.title = (!params.title)? '알림' : params.title;
            vm.params.button = {
                text : (!params.button)? '닫기' : params.button.text
            };
        }else{
            vm.params.title = (!params.title)? '삭제확인' : params.title;
            vm.params.button = {
                text1 : (!params.button || !params.button.text1)? '예' : params.button.text1,
                text2 : (!params.button || !params.button.text2)? '아니오' : params.button.text2
            };
        }

        function clear() {
            $uibModalInstance.close(false);
        }

        function yes() {
            $uibModalInstance.close(true);
        }
    }
})();

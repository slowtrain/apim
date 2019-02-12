(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('SelectReceiversNotiController', SelectReceiversNotiController);

    SelectReceiversNotiController.$inject = ['MailTemplate', '$scope', '$uibModalInstance', 'User', 'CommonUtil'];

    function SelectReceiversNotiController(MailTemplate, $scope, $uibModalInstance, User, CommonUtil) {
        var vm = this;
        vm.clear = clear;
        vm.save = save;
        vm.excludeNull = excludeNull;
        vm.checkingAll = checkingAll;
        vm.checkingOneCheckBox = checkingOneCheckBox;
        vm.result = [];

        User.listAllForAdmin({size:0, page:0, sort:'id,desc'}).$promise.then(function(response){
            vm.users = d3.nest().key(function(response){
                if (!response.organization) response.organization={name: 'null'};
                return response.organization.name;
            }).entries(response);
        });

        function checkingAll(org) {
            if (!org) {
                vm.users.filter(function(org){
                    return excludeNull(org);
                }).forEach(function(o){
                    o.checked = vm.checkedAllOrgs;
                    checkingAll(o);
                });
            } else {
                org.values.forEach(function(user){
                    user.checked = org.checked;
                    checkingOneCheckBox(user);
                });
            }
        }

        function excludeNull(org) {
            return org.key != 'null';
        }

        function checkingOneCheckBox (user) {
            user.checked? vm.result.push(user) : vm.result.splice(vm.result.indexOf(user), 1);
            if (!vm.result.length) vm.checkedAllOrgs = false;
        }

        function clear() {
            $uibModalInstance.dismiss();
        }

        function save() {
            $uibModalInstance.close(vm.result);
        }
    }
})();

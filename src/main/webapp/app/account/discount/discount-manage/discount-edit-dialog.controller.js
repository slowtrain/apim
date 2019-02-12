(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('DiscountEditDialogController', DiscountEditDialogController);

    DiscountEditDialogController.$inject = ['$timeout', '$scope', '$uibModalInstance','JhiLanguageService', 'selections'];

    function DiscountEditDialogController($timeout, $scope, $uibModalInstance, JhiLanguageService, selections) {
        var vm = this;
        vm.authorities = ['ROLE_PLAN_CREATE'];
        vm.clear = clear;
        vm.save = save;
        vm.checkRates = checkRates;
        vm.discountRatesLimit = 100.0;

        if(selections){
            vm.discountPolicy = angular.copy(selections);
            vm.rates = vm.discountPolicy.rates.toString().indexOf('.') > -1 ? vm.discountPolicy.rates.toString().split('.') : [vm.discountPolicy.rates, '00'] ;
            if (vm.rates[1].length == 1) vm.rates[1] = vm.rates[1] + '0';
        }else{
            vm.rates = [];
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function checkRates(){
            if (vm.rates[0] > 100) {
                vm.rates[0] = 100; vm.rates[1] = null;
            }else if (vm.rates[0] == 0) {
                if (vm.rates[1] == '00' && vm.rates[1].length == 2) vm.rates[1] = '01';
            }else if (vm.rates[0] == 100) vm.rates[1] = null;
        }

        function clear () {
            vm.discountPolicy = (selections)? selections: {};
            $uibModalInstance.dismiss('cancel');
        }

        function save () {
            //id가 없으면 save, 있으면 update
            vm.discountPolicy.rates = !vm.rates[1] ? vm.rates[0] : vm.rates[0] + '.' + vm.rates[1];
            if(!vm.discountPolicy.id){
                vm.discountPolicy.type = 'save';
                $uibModalInstance.close(vm.discountPolicy);
            }else{
                vm.discountPolicy.type = 'update';
                $uibModalInstance.close(vm.discountPolicy);
            }
        }

    }
})();

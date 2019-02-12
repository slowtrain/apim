(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('BillingEditDialogController', BillingEditDialogController);

    BillingEditDialogController.$inject = ['$timeout', 'CommonUtil', '$scope', '$uibModalInstance','JhiLanguageService', 'selections'];

    function BillingEditDialogController($timeout, CommonUtil, $scope, $uibModalInstance, JhiLanguageService, selections) {
        var vm = this;
        vm.authorities = ['ROLE_PLAN_CREATE'];
        vm.clear = clear;
        vm.save = save;
        vm.addBilling = addBilling;
        vm.delSegments = delSegments;

        if(selections){
            vm.billing = angular.copy(selections);
            vm.mode = 'edit';
            init();
        }else{
            vm.billing = {segments: []};
            vm.mode = 'register';
        }

        vm.intervalBillings = {};
        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function init() {
            vm.billing.chargePerHit = CommonUtil.commaBind(vm.billing.chargePerHit);
            vm.billing.leastAmount = CommonUtil.commaBind(vm.billing.leastAmount);
            if (!vm.billing.segments.length) vm.billing.segments = [];
            else {
                vm.billing.segments.forEach(function(seg) {
                    seg.chargePerHit = CommonUtil.commaBind(seg.chargePerHit);
                    seg.threshold = CommonUtil.commaBind(seg.threshold);
                });
            }
        }

        function delSegments(idx){
            vm.billing.segments.splice(idx, 1);
        }

        function addBilling(){
            vm.billing.segments.push({threshold: '', chargePerHit: ''});
        }

        function clear () {
            vm.billing = selections;
            $uibModalInstance.dismiss('cancel');
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function save () {
            var thresholdError = false;
            if (vm.billing.segments.length > 0){
                vm.billing.segments.forEach(function(seg, i){
                    if (i > 0 && numeral(seg.threshold).value() <= numeral(vm.billing.segments[i-1].threshold).value()) {
                        thresholdError = true;
                        seg.thresholdError = true;
                    }else seg.thresholdError = false;
                });
                if(thresholdError) {
                    CommonUtil.onError("임계치의 입력값이 잘못되었습니다.<br/>임계치의 나중 값은 앞의 값보다 커야 합니다.");
                    return;
                }else{
                    vm.billing.segments.forEach(function(seg, i){
                        seg.threshold = numeral(seg.threshold).value() || 0;
                        seg.chargePerHit = numeral(seg.chargePerHit).value() || 0;
                    });
                }
            }

            vm.billing.chargePerHit = numeral(vm.billing.chargePerHit).value() || 0;
            vm.billing.leastAmount = numeral(vm.billing.leastAmount).value() || 0;

            if(!vm.billing.id){
                vm.billing.type = 'save';
                $uibModalInstance.close(vm.billing);
            }else{
                vm.billing.type = 'update';
                $uibModalInstance.close(vm.billing);
            }
        }

        function decimalCheck(currentNum) {
            var copyNum = currentNum;
            if (currentNum.indexOf('.') > -1) {
                if (currentNum.slice(-1) === '.') copyNum = currentNum.slice(0, -1);
                else copyNum = currentNum.split('.')[0] + '.' + currentNum.split('.')[1].slice(0, 2);
            }
            return copyNum;
        }
    }
})();

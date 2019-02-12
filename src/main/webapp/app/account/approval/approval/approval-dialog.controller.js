(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApprovalDialogController', ApprovalDialogController);

    ApprovalDialogController.$inject = ['Organization', 'CommonUtil', '$uibModalStack', '$scope', '$uibModalInstance', '$uibModal', 'selections', 'Api', 'Apps', 'Approval', 'JhiLanguageService'];

    function ApprovalDialogController(Organization, CommonUtil, $uibModalStack, $scope, $uibModalInstance, $uibModal, selections, Api, Apps, Approval, JhiLanguageService) {
        var vm = this;

        vm.authorities = ['ROLE_HASLOGIN'];

        vm.alerts = [];
        vm.clear = clear;
        vm.clearTopModal = clearTopModal;
        vm.languages = null;
        vm.decide = decide;

        vm.selections = selections;
        vm.approval = vm.selections.obj;
        // 결정 관련 항목
        vm.decision = {
            comment: "",
            isReserved: vm.approval.isReserved,
            reservedTime: new Date()
        };
        if (vm.approval.isReserved && vm.approval.reservedTime) {
            vm.decision.reservedTime = new Date(vm.approval.reservedTime); // 예약 시간
            vm.decision.reservedHour = vm.decision.reservedTime.getHours();   // 예약 시간의 시간 값
        }

        if (vm.approval.type === 'PARTNER') vm.partner = vm.selections.data;
        vm.approval.type = vm.approval.type ? vm.approval.type.toUpperCase() : vm.approval.type;
        vm.account = $scope.account;
        vm.closeTerm = closeTerm;
        vm.showTermsContent = showTermsContent;
        vm.closeBillingPolicy = closeBillingPolicy;
        vm.showBillingPolicies = showBillingPolicies;
        vm.isbillingPoliciesOpen = false;
        vm.showAppTermsContent = showAppTermsContent;
        vm.displayActivated = displayActivated;
        vm.fileSize = CommonUtil.fileSize;
        vm.fileDown = fileDown;
        vm.makeHourOptions = makeHourOptions;
        vm.closeAlert = closeAlert;
        vm.register = {};
        vm.filter = filter;
        vm.accountNumberSearch = accountNumberSearch;
        vm.getAccountNumber = getAccountNumber;

        vm.makeHourOptions();

        function fileDown(file) {
            if ($scope.account) window.location = '/files/download/' + file.id;
        }

//        vm.translate = (vm.approval.type=="API")? "apiList": "appManage";
        if (vm.approval.type === "API") {
            vm.api = selections.data;
        } else if (vm.approval.type === "APP") {
            vm.app = selections.data;
            vm.apiList = vm.app.appApiMappings;
            Apps.changeSet({id: vm.app.id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        } else if (vm.approval.type === "USER") {
            vm.user = selections.data;
        } else {
            vm.partner = vm.selections.data;
            Organization.changeSet({id: vm.partner.id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        }

        function displayActivated(user) {
            switch (user.state) {
                case 'ACTIVE':
                    return '활성';
                case 'INACTIVE':
                    return '비활성';
                case 'REGISTERING':
                    return '등록진행중';
                case 'WITHDRAWING':
                    return '탈퇴진행중';
            }
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        vm.billingPolicyPopover = {
            templateUrl: 'app/layouts/popover-template/billing-policy-popover.html'
        };

        vm.apiplanPopover = {
            templateUrl: 'app/layouts/popover-template/apiplan-popover.html'
        };

        function filter(value, choice){
            var result='';
            if(choice ==1){
                vm.quotaValueUseCycleOption.some(function(option){
                    if(value==option.val) result = option.name;
                    return value==option.val;
                });
                return result;
            }else{
                vm.dayLimitOption.some(function(option){
                    if(value==option.val) result = option.name;
                    return value==option.val;
                });
                return result;
            }
        }

        vm.quotaValueUseCycleOption = [
            {val:'SECOND', name:'초'},
            {val:'MINUTE', name:'분'},
            {val:'HOUR', name:'시'},
            {val:'DAY', name:'일'},
            {val:'MONTH', name:'월'}
        ];

        vm.dayLimitOption = [
            {val:'SUNDAY', name:'일'},
            {val:'MONDAY', name:'월'},
            {val:'TUESDAY', name:'화'},
            {val:'WEDNESDAY', name:'수'},
            {val:'THURSDAY', name:'목'},
            {val:'FRIDAY', name:'금'},
            {val:'SATURDAY', name:'토'}
        ];

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess(result) {
            $uibModalInstance.close(result);
        }

        function decide() { //아래의 obj란 승인요청시 입력된 사항들(제목,comment, type[app or api])을 말한다.
            // 예약승인 시간
            /*vm.decision.reservedTime.setHours(vm.decision.reservedHour, 0, 0, 0);
            if (vm.decision.reservedTime < new Date()) {
                vm.alerts.push({
                    type: 'warning',
                    message: '예약 시간이 현재 시간보다 이전입니다.'
                });
                return;
            }*/
            //Approval.addComment({id: vm.selections.obj.id}, vm.approval);
            //mode값은 approve or deny
            if (vm.selections.mode === 'approve') {
                Approval.approve({id: vm.selections.obj.id}, vm.decision, onSuccess, onError);
            } else {
                Approval.deny({id: vm.selections.obj.id}, vm.decision, onSuccess, onError);
            }
        }

        function showTermsContent() {
            if (vm.api.termsOfUse) {
                Api.getTermsContent({id: vm.api.termsOfUse.id}).$promise.then(function (response) {
                    $uibModal.open({
                        templateUrl: 'app/services/common/terms-modal.html',
                        controller: 'termsModalController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            item: response
                        }
                    }).result.then(function (result) {
                    });
                });
            }
            //layout 방식
//        	if(vm.api.termsOfUse) {
//        		vm.isTermsOpen = true;
//        		vm.termContent = vm.api.termsOfUse.content;
//        	} else {
//        		vm.isTermsOpen = false;
//        	}
        }

        function clearTopModal() {
            $uibModalStack.dismiss($uibModalStack.getTop().key);
        }

        function showBillingPolicies() {
            vm.isbillingPoliciesOpen = vm.api.billingPolicy && vm.api.billingPolicy.id;
            if (vm.isbillingPoliciesOpen) {
                $uibModal.open({
                    templateUrl: 'app/services/common/billing-policy.html',
                    scope: $scope,
                    backdrop: 'static',
                    size: 'md'
                });
            }
            vm.billingPolicytooltipIsOpen = !vm.isbillingPoliciesOpen;
            if (vm.billingPolicytooltipIsOpen) {
                $timeout(function () {
                    vm.billingPolicytooltipIsOpen = false;
                }, 100);
            }
        }

        function closeTerm() {
            vm.isTermsOpen = false;
            vm.isAppTermsOpen = false;
        }

        function closeBillingPolicy() {
            vm.isbillingPoliciesOpen = false;
        }

        function showAppTermsContent(api) {
            if(api.termsOfUse) {
                Api.getTermsContent({id:api.termsOfUse.id}).$promise.then(function (response) {
                    $uibModal.open({
                        templateUrl: 'app/services/common/terms-modal.html',
                        controller: 'termsModalController',
                        controllerAs: 'vm',
                        backdrop: 'static',
                        size: 'lg',
                        resolve: {
                            item: response
                        }
                    }).result.then(function (result) {

                        });
                });
            }
            //layout 방식
//        	if(api.termsOfUse) {
//        		vm.isAppTermsOpen = true;
//        		vm.termContent = api.termsOfUse.content;
//        	} else {
//        		vm.isAppTermsOpen = false;
//        	}
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }


        // datePicker settings

        /**
         * 시간 표현을 위한 옵션을 만든다.
         */
        function makeHourOptions() {
            var now = new Date();
            var isSameDate = now.getYear() === vm.decision.reservedTime.getYear()
                && now.getMonth() === vm.decision.reservedTime.getMonth()
                && now.getDate() === vm.decision.reservedTime.getDate();
            var startHour = 0;
            if (isSameDate) {
                startHour = now.getHours() + 1; // 현재 시간보다 1시간 이후
            }
            vm.hourOptions = [];
            for (var i = startHour; i < 24; i++) {
                vm.hourOptions.push(i < 10 ? {hour: '0' + i + ':00', value: i} : {hour: i + ':00', value: i});
            }
        }

        function closeAlert(index) {
            vm.alerts.splice(index, 1);
        }

        // number input에 대한 키보드 입력을 막음
        $("[type='number']").keydown(function (e) {
            e.preventDefault();
        });

        $scope.showReservedTimeCalendar = function ($event) {
            $event.preventDefault();
            $event.stopPropagation();

            vm.reservedTimeCalendarOpen = !vm.reservedTimeCalendarOpen;
        }
        $scope.dateOptions = {
            showWeeks: false,
            minDate: new Date()
        };

        vm.accountNumberPopover = {
                templateUrl: 'app/layouts/popover-template/account-number-popover.html'
        };

        function getAccountNumber(withdrawal) {
            /*if (!vm.loginPassword || vm.loginPassword.trim() =='') {
                vm.tooltipIsOpen = true;
                $('#loginPassword').focus();
                return;
            }*/
            var params = {
                    withdrawalId:withdrawal.id,
                    password: vm.loginPassword,
                    history: withdrawal.history? withdrawal.history : false
                }
                Organization.getAccountNumber(params, function(result){
                    vm.thisAccountNumber = result.accountNumber;
                    vm.loginPassword = null;
                    vm.initSearch = false;
                }, function(error) { withdrawal.isOpen = false; onError(error); });
        }

        function accountNumberSearch(withdrawal) {
            vm.initSearch = true;
            vm.loginPassword = '';
            getAccountNumber(withdrawal);
        }
    }
})();

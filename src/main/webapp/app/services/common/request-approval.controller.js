(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ReqApprovalController', ReqApprovalController);

    ReqApprovalController.$inject = ['$uibModalStack', '$scope', '$uibModalInstance', '$uibModal', 'ApprovalLine', 'selection', 'Api', 'Apps', 'Organization', 'JhiLanguageService', 'CommonUtil'];

    function ReqApprovalController($uibModalStack, $scope, $uibModalInstance, $uibModal, ApprovalLine, selection, Api, Apps, Organization, JhiLanguageService, CommonUtil) {
        var vm = this;

        vm.authorities = ['ROLE_APPROVAL_CREATE'];
        vm.clear = clear;
        vm.clearTopModal = clearTopModal;
        vm.languages = null;
        vm.request = request;
        vm.lineView = lineView;
        vm.selectUsers = selectUsers;
        vm.isOpen = false;
        vm.showTermsContent = showTermsContent;
        vm.init = init;
        vm.init();
        vm.closeTerm = closeTerm;
        vm.closeBillingPolicy = closeBillingPolicy;
        vm.showBillingPolicies = showBillingPolicies;
        vm.isbillingPoliciesOpen = false;
        vm.validParam = (selection.type == 'api') ? true : false;
        vm.showAppTermsContent = showAppTermsContent;
        vm.splitContents = splitContents;
        vm.filter = filter;
        vm.accountNumberSearch = accountNumberSearch;

        vm.approval = {
            type: selection.type,
            title: selection.data.name + "  -  승인요청",
            comment: "",
            approvers: []
        };
        vm.account = $scope.account;

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

        vm.translate = (selection.type == "api") ? "apiList" : (selection.type == "app") ? "appManage" : "settings";

        if (selection.type == "api") {
            vm.api = selection.data;
        } else if (selection.type == "org") {
            vm.Org = selection.data;
            Organization.changeSet({id: vm.Org.id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        } else {
            vm.app = selection.data;
            /*vm.app.appApiMappings.forEach(function (api) {
                if (api.api.status == 'RUNNING') vm.apiList.push(api);
            });*/
            Apps.changeSet({id: vm.app.id}).$promise.then(function (response) {
                vm.changeSets = response.changeSets;
            });
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function splitContents(changeSet){
            changeSet.fromInfos =(changeSet.from)? changeSet.from.split(' | ') : [];
            changeSet.toInfos =(changeSet.to)? changeSet.to.split(' | ') : [];
        }

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        vm.billingPolicyPopover = {
            templateUrl: 'app/layouts/popover-template/billing-policy-popover.html'
        };

        function init() {
            ApprovalLine.list().$promise.then(function (response) {
                vm.lineList = response;
                vm.resetList = angular.copy(vm.lineList);
                vm.clickedlineList = [];
                vm.availableList = [];
            });
        }

        function clear() {
            $uibModalInstance.dismiss('cancel');
        }

        function clearTopModal() {
            $uibModalStack.dismiss($uibModalStack.getTop().key);
        }

        function onSuccess(result) {
            $uibModalInstance.close(result);
        }

        function onError(error) {
            CommonUtil.onError(error.data.message);
        }

        function request() {
            if (selection.type == "api") {
                Api.reqApproval({
                    id: selection.data.id
                }, vm.approval, onSuccess, onError);
            } else if (selection.type == "org") {
                Organization.reqApproval({
                    id: selection.data.id
                }, vm.approval, onSuccess, onError);
            } else {
                Apps.reqApproval({
                    id: selection.data.id
                }, vm.approval, onSuccess, onError);
            }
        }

        ///////////////////////////////////////////////승인라인선택

        function lineView(line) {
            vm.lineUsers = [];
            vm.lineUsers = line.users;
        }

        // 라인 선택 팝업
        vm.selectLine = function () {
            $uibModal.open({
                templateUrl: 'app/services/common/select-approval-line-modal.html',
                controller: 'selectApprovalLineModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    items: {
                        data: '',
                        type: true
                    }
                }
            }).result.then(function (result) {
                appendApprovers(result);
            });
        };

        //사용자 선택 팝업
        function selectUsers(line, type) {
            $uibModal.open({
                templateUrl: 'app/services/common/select-modal.html',
                controller: 'selectModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    items: {
                        type: true,
                        data: vm.approval.approvers,
                        category: 'request'
                    }
                }
            }).result.then(function (result) {
                appendApprovers(result.users);
            });
        }

        function appendApprovers(users) {
            vm.approval.approvers = [];
            users.forEach(function (user) {
                var sameList = vm.approval.approvers.filter(function (a) {
                    return a.id == user.id;
                });
                if (sameList.length == 0) {
                    vm.approval.approvers.push(user);
                    vm.validParam = false;
                }
            });
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
                        init();
                    });
                });
            }
        }

        //layout 방식
//        function showTermsContent() {
//        	if(vm.api.termsOfUse) {
//        		vm.isTermsOpen = true;
//        		vm.termContent = vm.api.termsOfUse.content;
//        	} else {
//        		vm.isTermsOpen = false;
//        	}
//        }

        function showAppTermsContent(api) {
            Api.getTermsContent({id: api.termsOfUse.id}).$promise.then(function (response) {
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
                    init();
                });
            });

            //layout 방식
//        	if(api.termsOfUse) {
//        		vm.isAppTermsOpen = true;
//        		vm.termContent = api.termsOfUse.content;
//        	} else {
//        		vm.isAppTermsOpen = false;
//        	}
        }

        function showBillingPolicies() {
            vm.isbillingPoliciesOpen = (vm.api.billingPolicy && vm.api.billingPolicy.id) ? true : false;
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

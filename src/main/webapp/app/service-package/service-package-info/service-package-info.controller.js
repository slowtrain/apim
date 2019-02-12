(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ServiceCategoryInfoController', ServiceCategoryInfoController);

    ServiceCategoryInfoController.$inject = ['Forum', 'ProfileService', 'CommonConstants', '$rootScope', '$compile', '$timeout', 'GeneralInfo', '$state', '$stateParams', '$scope', 'Api', '$uibModal', 'CommonUtil'];

    function ServiceCategoryInfoController(Forum, ProfileService, CommonConstants, $rootScope, $compile, $timeout, GeneralInfo, $state, $stateParams, $scope, Api, $uibModal, CommonUtil) {

        var vm = this;
        vm.$rootScope = $rootScope;
        vm.goForum = goForum;
        vm.gotoContents = gotoContents;
        vm.showGroup = showGroup;
        vm.showDetailApi = showDetailApi;
        vm.clickTab = clickTab;
        vm.checkAll = checkAll;
        vm.checkOneCategory = checkOneCategory;
        vm.searchCategories = searchCategories;
        vm.searchTableOpen = searchTableOpen;
        vm.serviceBtnReset = serviceBtnReset;
        vm.serviceBtnAll = serviceBtnAll;
        vm.getServiceIcon = getServiceIcon;
        vm.serviceInit = serviceInit;
        vm.serviceInit2 = serviceInit2;
        vm.scrollTop = CommonUtil.scrollTop;
        vm.serviceCategoryTitles = CommonConstants.serviceCategoryTitles;
        loadAll();

        /*$scope.$on('$stateChangeSuccess', function () {
            loadAll();
        });*/

        function gotoContents(contents) {
            $rootScope.contentId = (contents)? contents.id : '-1';
            loadAll();
            vm.scrollTop();
        }

        function searchTableOpen() {
            vm.searchResultList = null;
            vm.allChecking1 = false, vm.allChecking2 = false, vm.allChecking3 = false;
            vm.allCategories.forEach(function(c) {
                c.checked = false;
            });
        }

        function serviceBtnAll() {
            vm.allCategories.forEach(function(c) {
                c.checked = true;
            });
            loadRecentServices();
        }

        function serviceBtnReset() {
            vm.allCategories.forEach(function(c) {
                c.checked = false;
            });
            loadRecentServices();
        }

        function serviceInit() {
            var flag = false;
            if (vm.allCategories) {
                vm.allCategories.some(function(c) {
                    flag = c.checked;
                    return c.checked;
                });
            }

            return !flag;
        }

        function serviceInit2() {
            var flag2 = true;
            if (vm.allCategories) {
                vm.allCategories.some(function(c) {
                    flag2 = !c.checked;
                    return !c.checked;
                });
            }

            return !flag2;
        }

        function checkAll(arg) {
            switch(arg) {
                case '1' :
                    $scope.list1.forEach(function(c){ c.checked = vm.allChecking1; }); break;
                case '2' :
                    $scope.list2.forEach(function(c){ c.checked = vm.allChecking2; }); break;
                case '3' :
                    $scope.list3.forEach(function(c){ c.checked = vm.allChecking3; }); break;
            }
        }

        function loadRecentServices () {
            vm.resultTitle = '최신순';
            GeneralInfo.allContents({kind: 'service-package', sort: 'createdDate,desc', noContentsBody: true}, loadSearchResult, onError);
        }

        function searchCategories() {
            vm.checkedList = vm.allCategories.filter(function(c){
                return c.checked;
            });
            vm.resultTitle = '타이틀순'
            GeneralInfo.searchCategories(vm.checkedList, loadSearchResult, onError);
        }

        function loadSearchResult(response) {
            vm.searchResultList = response.filter(function(service){
                service.sliceSentence = (service.sentence.length > 60)? service.sentence.slice(0, 57).concat(' . . .') : service.sentence;
                service.splitSentences = service.sliceSentence.split('\\n').map(function(s, i) { // 똑같은 문장이 반복되는 경우를 고려하여 추가된 코딩
                    return {
                        idx: i,
                        sentence: s
                    };
                });
                return service.title != '공통템플릿';
            });
        }

        function checkOneCategory(category, arg) {
            var checkedFlag = false;
            category.checked = !category.checked;
            switch(arg) {
                case '1' :
                    $scope.list1.some(function(c){
                        checkedFlag = c.checked;
                        return checkedFlag;
                    });
                    vm.allChecking1 = checkedFlag; break;
                case '2' :
                    $scope.list2.some(function(c){
                        checkedFlag = c.checked;
                        return checkedFlag;
                    });
                    vm.allChecking2 = checkedFlag; break;
                case '3' :
                    $scope.list3.some(function(c){
                        checkedFlag = c.checked;
                        return checkedFlag;
                    });
                    vm.allChecking3 = checkedFlag; break;
            }
            /*if (category.checked == true) {
                serviceInit('false');
            }*/
        }

        function showDetailApi(api) {
            if (!$scope.account) {
                CommonUtil.modalOne("자세한 정보를 보시려면<br/>로그인을 하시기 바랍니다.");
                return;
            }
            Api.apiByIdForPartner({id: api.id}).$promise.then(function(response){
                $uibModal.open({
                    templateUrl: 'app/api-services/api-service/api-view.html',
                    controller: 'ApiViewController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'lg',
                    resolve: {
                        selectedApi: {
                            api: response,
                            forPartner: true
                        }
                    }
                }).result.then(function (result) {
                    loadAll();
                });
            });
        }

        function clickTab() {
            vm.show2 = !vm.show2;
            if (vm.show2) vm.selectedGroup = vm.contents.apiGroups[0];
        }

        function getServiceIcon(categories) {
            $('#serviceIcon'+categories.id).html(categories.contentsIcon);
            $('.apiImg p img').css('width','');
        }

        function showGroup(group) {
            vm.selectedGroup = group;
        }

        function goForum(params) {
            $rootScope.paramUrl = params;
            $state.go('forumCommunity');
        }

        function loadAll() {
            if ($rootScope.contentId != -1) {
                vm.contents = GeneralInfo.getOne({id: $rootScope.contentId}, onSuccess, onError);
            } else {
                GeneralInfo.listCategories().$promise.then(function(response){
                    vm.allCategories = response;
                    loadRecentServices();
                });
            }
        }

        function onSuccess(response) {
            $('#contentsBody').html(response.contentsBody);
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();

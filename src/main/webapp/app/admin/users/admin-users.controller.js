(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminUserController', AdminUserController);

    AdminUserController.$inject = ['$scope', 'CommonUtil', '$uibModal', 'Principal', 'User', 'Role', 'AlertService', '$state', '$stateParams', 'JhiLanguageService'];

    function AdminUserController($scope, CommonUtil, $uibModal, Principal, User, Role, AlertService, $state, $stateParams, JhiLanguageService) {
        var vm = this;

        vm.authorities = ['ROLE_USER_VIEW', 'ROLE_ADMIN'];
        //vm.currentAccount = null;
        vm.languages = null;
        vm.loadAll = loadAll;
        vm.setActive = setActive;
        vm.setGAReceive = setGAReceive;
        vm.userFlagOfAdmin = userFlagOfAdmin;
        vm.setAdmin = setAdmin;
        vm.displayActivated = displayActivated;

        vm.clear = clear;
        vm.searching = searching;

        vm.size = 10;
        vm.page = 0;
        vm.sort = 'id,desc';
        vm.pageChanged = pageChanged;
        vm.sorting = sorting;
        vm.condition = {
            searchFieldType: vm.searchingColumn,
            searchText: vm.searchingText,
            state: vm.searchingState,
            roleCode: vm.searchingRoleCode,
            type: vm.searchingOrgType,
            size: vm.size,
            page: vm.page,
            sort: vm.sort
        };

        vm.showDetail = showDetail;
        vm.editUser = editUser;
        vm.delUser = delUser;
        vm.checkOrgType = checkOrgType;
        vm.downloadExcel = downloadExcel;

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        Principal.hasAuthority('ROLE_ADMIN').then(function (result) {
            if (result) vm.isAdmin = true;
            else {
                vm.searchColumns.pop(); //admin 아닌경우, 기관명검색 필요없으므로 필드명선택에서 기관명검색을 뺀다.
                Principal.hasAuthority('ROLE_USER_MODIFY').then(function (result) {
                    if (result) vm.isModifier = true;
                });
            }
            vm.loadAll();
        });

        function checkOrgType(orgType) {
            return (orgType == "PROVIDER") ? "제공기관" : (orgType == "PARTNER") ? "이용기관" : "";
        }

        vm.orgTypes = [{name: "PROVIDER", ko: "제공기관"}, {name: "PARTNER", ko: "이용기관"}];
        vm.roles = Role.list();
        vm.states = [{value: "ACTIVE", ko: "활성"}, {value: "INACTIVE", ko: "비활성"}, {value: "REGISTERING", ko: "등록진행중"}, {value: "WITHDRAWING", ko: "탈퇴진행중"}];
        vm.searchColumns = [{name: "ID", ko: "아이디"}, {name: "NAME", ko: "닉네임"}, {name: "EMAIL", ko: "이메일"}, {name: "ORGNAME", ko: "기관명"}];

        function displayActivated(user) {
            switch (user.state) {
                case 'ACTIVE':
                    return "userManagement.active";
                case 'INACTIVE':
                    return "userManagement.inactive";
                case 'REGISTERING':
                    return "userManagement.registering";
                case 'WITHDRAWING':
                    return "userManagement.withdrawing";
            }
        }

        function setActive(user) {
            var message = (user.state == 'ACTIVE') ? user.login+" 의 사용자 상태를<br/>비활성으로 변경하시겠습니까?" : user.login+" 의 사용자 상태를<br/>활성으로 변경하시겠습니까?";
            var callback = function(result) {
                if (result) {
                    user.state = (user.state == 'ACTIVE') ? 'INACTIVE' : 'ACTIVE';
                    User.updateForAdmin(user, function(){ vm.loadAll() }, onError);
                }
            }
            CommonUtil.onError(message, 'sm', 'changeStatus', callback, "사용자 상태 변경");
        }

        function setGAReceive(user) {
            user.gatewayAlertReceive = !user.gatewayAlertReceive;
            User.updateForAdmin(user, function(){ vm.loadAll() }, onError);
        }

        function userFlagOfAdmin(user) {
            return user.authorities.indexOf('ROLE_ADMIN') > -1;
        }

        function setAdmin(user) {
            var flag = userFlagOfAdmin(user) ? false : true;
            User.setAdmin({userId: user.id, flag: flag}, function(){ vm.loadAll() }, onError);
        }

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                searchFieldType: vm.searchingColumn,
                searchText: vm.searchingText,
                state: vm.searchingState,
                roleCode: vm.searchingRoleCode,
                type: vm.searchingOrgType,
                size: vm.size,
                page: 0,
                sort: vm.condition.sort
            };
            loadAll();
        }

        // 검색 결과를 excel로 다운로드 받는다.
        function downloadExcel() {
            var url = '/api/admin/users/excel';
            var queryString = $.param(vm.condition, true);
            window.open(url + '?' + queryString, '_blank');
        }

        function loadAll(page) {
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            User.listAllForAdmin(vm.condition, onSuccess, onError);
        }

        function showDetail(user) {
            $uibModal.open({
                templateUrl: 'app/admin/users/user-manage-detail.html',
                controller: 'AdminUserDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        user: user,
                        type: 'detailView'
                    }
                }
            }).result.then(function (result) {
                if (result) vm.loadAll();
            });
        }

        function editUser(user) {
            $uibModal.open({
                templateUrl: 'app/admin/users/user-manage-dialog.html',
                controller: 'AdminUserDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        roles: vm.roles,
                        user: user,
                        refOrg: $scope.account.organization,
                        isAdmin: vm.isAdmin
                    }
                }
            }).result.then(function (result) {
                if (result == 'create') loadAll(0);
                else loadAll();
            });
        }

        function delUser(user) {
            var name = user.login + " 정보를";
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items: function () {
                        return {
                            data: name,
                            type: 'delete'
                        }
                    }
                }
            }).result.then(function (result) {
                if (result) User.deleteForAdmin({userId: user.id},
                    function () {
                        loadAll(0)
                    }, onError);
            });
        }

        function onSuccess(data, headers) {
            vm.totalItems = headers('X-Total-Count');
            vm.users = data;
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function clear() {
            vm.user = {
                id: null, login: null, firstName: null, lastName: null, email: null,
                activated: null, langKey: null, createdBy: null, createdDate: null,
                lastModifiedBy: null, lastModifiedDate: null, resetDate: null,
                resetKey: null, authorities: null
            };
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }
    }
})();

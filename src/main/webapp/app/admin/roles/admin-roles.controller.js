(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('AdminRoleController', AdminRoleController);

    AdminRoleController.$inject = ['Role', '$uibModal', 'CommonUtil'];

    function AdminRoleController(Role, $uibModal, CommonUtil) {
        var vm = this;

        vm.authorities = ['ROLE_ADMIN'];
        vm.register = register;
        vm.remove = remove;
        vm.edit = edit;
        vm.showAuth = showAuth;
        vm.update = update;
        vm.loadAll = loadAll;
        vm.loadAll(null, true);
        vm.releaseAll = true;
        vm.selectAll = selectAll;

        function selectAll() {
            vm.releaseAll = !vm.releaseAll;
            vm.authList.forEach(function (auth) {
                auth.values.forEach(function (value) {
                    if(!value.disabled) value.checked = !vm.releaseAll;
                });
            });
            /*d3.selectAll('input[name=authorities]').each(function(){
             $(this).attr("checked", vm.releaseAll);
             });*/
        }

        var data = [];

        function loadAll(data, initiate) {
            Role.list().$promise.then(function (response) {
                vm.roles = response;
                vm.roles.sort(function(a, b){
                    if (a.organizationType > b.organizationType) return -1; //이건 역순정렬
                    if (a.organizationType < b.organizationType) return 1;
                    if (a.name > b.name) return 1; //이건 순정렬
                    if (a.name < b.name) return -1;
                    return 0;
                });
                if (!data) {
                    if (initiate) init(vm.roles[0]); // 초기 로딩인 경우
                    else vm.showAuth(vm.roles[0]);
                } else {
                    vm.showAuth(data);
                }
            });
        }

        function init (role) {
            Role.listAuth().$promise.then(function (response) {
                response.forEach(function (auth, i) {
                    auth.title = auth.kind.name; //html페이지 분류항목title 표시를 위해 추가
                });
                vm.listAuth = response;
                vm.authList = d3.nest().key(function (response) {
                    return response.title
                }).entries(response);
                showAuth(role);
            });
        }

        function showAuth(role) {
            vm.roleSelected = role;
            Role.roleAuth({roleCode: role.code}).$promise.then(function (response) {
                data = response;
                var list = [];
                vm.listAuth.forEach(function (listA, i) {
                    var flagOfDisabled = false;
                    if(role.organizationType != 'PROVIDER' && listA.title != '통계' && listA.title != '사용자' && listA.title != '앱'){
                        flagOfDisabled = true;
                    }
                    var flag = 0;
                    data.forEach(function (roleA, j) {
                        if (roleA.code == listA.code) {
                            roleA.checked = true; //db에는 없는 추가칼럼
                            roleA.title = listA.title; //db에는 없는 추가칼럼
                            roleA.disabled = flagOfDisabled; //db에는 없는 추가칼럼
                            flag = 1;
                            list.push(roleA);
                        }
                    });
                    if (flag == 0) {
                        list.push({
                            code: listA.code,
                            name: listA.name,
                            title: listA.title, //db에는 없는 추가칼럼
                            checked: false, //db에는 없는 추가칼럼
                            disabled: flagOfDisabled, //db에는 없는 추가칼럼
                            kind: {
                                code: listA.kind.code,
                                name: listA.kind.name
                            }
                        });
                    }
                });
                vm.authList = d3.nest().key(function (list) {
                    return list.title
                }).entries(list);
            });
            vm.role = role;
            vm.releaseAll = true;
        }

        function update() {
            var authorities = [];
            vm.authList.forEach(function (list, i) {
                list.values.forEach(function (value, j) {
                    if (value.checked) authorities.push(value);
                });
            });
            var rolebody = {
                code: vm.role.code,
                name: vm.role.name,
                description: vm.role.description,
                authorities: authorities
            };
            Role.update(rolebody, function (result) {
                if (result) CommonUtil.onError("변경사항이 저장되었습니다.", '', '', null, '변경 확인');
            });
        }

        function register() {
            $uibModal.open({
                templateUrl: 'app/admin/roles/role-dialog.html',
                controller: 'RoleDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        mode: 'register',
                        allData: vm.roles
                    }
                }
            }).result.then(function (role) {
                vm.loadAll(role);
            });
        }

        function edit(role) {
            $uibModal.open({
                templateUrl: 'app/admin/roles/role-dialog.html',
                controller: 'RoleDialogController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        mode: 'edit',
                        role: role,
                        allData: vm.roles
                    }
                }
            }).result.then(function (role) {
                vm.loadAll(role);
            });
        }

        function remove(role) {
            var name = "[ " + role.name + " ]" + " 역할을";
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
            }).result.then(function () {
                Role.delete({roleId: role.code}, onSuccess, onError);
            });
        }

        function onSuccess() {
            vm.loadAll();
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }
    }
})();

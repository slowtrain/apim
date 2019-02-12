(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ForumEditController', ForumEditController);

    ForumEditController.$inject = ['CommonUtil', '$uibModal', '$scope', 'Forum', 'selections', 'Organization', 'Principal', 'LoginService', '$state','$interval','JhiLanguageService','$uibModalInstance'];

    function ForumEditController (CommonUtil, $uibModal, $scope, Forum, selections, Organization, Principal, LoginService, $state, $interval, JhiLanguageService, $uibModalInstance) {
        var vm = this;

        vm.authorities = ['ROLE_FORUM_CREATE'];

        vm.clear = clear;
        vm.languages = null;
        vm.save = save;
        vm.addUsers = addUsers;
        vm.findAvailableUsers = findAvailableUsers;
        vm.removeWriter = removeWriter;
        //vm.findApisByProvider = findApisByProvider;
        vm.forum = {};
        vm.flag = false;
        vm.flagOfOrg = false;
        vm.orgs = Organization.providers();
        vm.isAdmin = ($scope.account && $scope.account.authorities.indexOf('ROLE_ADMIN') > -1)? true: selections.isAdmin;

        if(selections.forum){
            vm.forum = angular.copy(selections.forum);
            vm.flag = true;
            vm.flagOfOrg = true;
            if(selections.forum.owner) {
                if(selections.forum.owner.id != vm.forum.owner.id){
                    vm.availableUsers = []; vm.forum.writableUsers = [];
                }else{
                    vm.availableUsers = [];
                    vm.forum.writableUsers = angular.copy(selections.forum.writableUsers);
                }
                findAvailableUsers();
            } else {
                vm.forum.isAdminWritable = !vm.forum.isAnonymousWritable;
            }
        }else if(selections.refOrg){
            //vm.forum.owner = selections.refOrg;
            //vm.flagOfOrg = true;
            //findAvailableUsers();
        }

        vm.availableUsers = []; var exist=0;

        /*function findApisByProvider(provider){
            if (provider) {
                CommonUtil.underLoading('selectingForumApi', '0px');
                Organization.apis({id: provider.id, status:'RUNNING'}).$promise.then(function(response){
                    vm.apis = response;
                    if(vm.flag) {
                        if(selections.forum.owner.id != provider.id){
                            vm.availableUsers = []; vm.forum.writableUsers = [];
                        }else{
                            vm.availableUsers = [];
                            vm.forum.writableUsers = angular.copy(selections.forum.writableUsers);
                            //vm.forum.writableUsers = selections.forum.writableUsers.filter(function(user){
                            //    return user.state == 'ACTIVE';
                            //});
                        }
                        findAvailableUsers();
                    }
                    CommonUtil.completeLoading();
                });
            }else vm.apis = [];
        }*/

        function findAvailableUsers(){
            if(!vm.isAdmin){
                Organization.users().$promise.then(function(response){
                    response = response.filter(function(user){
                        return user.state == 'ACTIVE';
                    });
                    if(vm.forum.writableUsers.length > 0){
                        response.forEach(function(user, i){
                            vm.forum.writableUsers.some(function(f_user){
                                if(f_user.id == user.id) exist = 1;
                                return (f_user.id == user.id);
                            });
                            if(exist==0) vm.availableUsers.push(user);
                            exist = 0;
                        });
                    }else vm.availableUsers = response;
                });
            }else{
                Organization.usersForAdmin({orgId: vm.forum.owner.id}).$promise.then(function(response){
                    response = response.filter(function(user){
                        return user.state == 'ACTIVE';
                    });
                    if(vm.forum.writableUsers.length > 0){
                        response.forEach(function(user, i){
                            vm.forum.writableUsers.some(function(f_user){
                                if(f_user.id == user.id) exist = 1;
                                return (f_user.id == user.id);
                            });
                            if(exist==0) vm.availableUsers.push(user);
                            exist = 0;
                        });
                    }else vm.availableUsers = response;
                });
            }
        }

        function addUsers(){
            if (!vm.availableUsers || vm.availableUsers.length == 0){
                CommonUtil.onError("현재 추가 가능한 사용자가 없습니다.");
            }else{
                var name = "게시글 작성가능자 추가";
                $uibModal.open({
                    templateUrl: 'app/services/common/select-modal.html',
                    controller: 'selectModalController',
                    controllerAs: 'vm',
                    backdrop: 'static',
                    size: 'md',
                    resolve: {
                        items:function(){
                            return{
                                data: {
                                    name : name,
                                    availableUsers : vm.availableUsers
                                },
                                category: 'orgAddUsers',
                                type: 'orgAddUsers'
                            }
                        }
                    }
                }).result.then(function (result) {
                      if(result != 'cancel'){
                        insertUsers(result.orgUsers);
                    }
                });
            }
        }

        function insertUsers(users){
            users.forEach(function(user, i){
                vm.forum.writableUsers.push(user);
                vm.availableUsers = vm.availableUsers.filter(function(el){
                    return el.id != user.id
                });
            });
        }

        function removeWriter(user) {
            vm.forum.writableUsers.splice(vm.forum.writableUsers.indexOf(user), 1);
            if (user.state == 'ACTIVE') vm.availableUsers.push(user);
        }

        function clear () {
            vm.forum = (vm.flag)? selections.forum: {};
            $uibModalInstance.dismiss('cancel');
        }

        function onSuccess (result) {
            $uibModalInstance.close(result);
        }

        function onError (error) {
            CommonUtil.onError(error.data.description);
        }

        function save () {
            if(!vm.forum.owner) vm.forum.isAnonymousWritable = !vm.forum.isAdminWritable;
            if(vm.forum.api){
                vm.forum.api.attachFileList = null; // 에러요인이 되므로 null로 조치
                vm.forum.api.specFile = null;
            }
            if(vm.flag) Forum.update(vm.forum, onSuccess, onError);
            else Forum.create(vm.forum, onSuccess, onError);
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

    }
})();

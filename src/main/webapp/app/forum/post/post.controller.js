(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('PostController', PostController);

    PostController.$inject = ['CommonConstants', 'Organization', 'GeneralInfo', 'CommonUtil', 'Principal', '$rootScope', '$stateParams', '$state', '$scope', 'Forum', 'Post', 'JhiLanguageService', '$uibModal', '$timeout'];

    function PostController(CommonConstants, Organization, GeneralInfo, CommonUtil, Principal, $rootScope, $stateParams, $state, $scope, Forum, Post, JhiLanguageService, $uibModal, $timeout) {
        var vm = this;
        vm.languages = null;
        vm.state = $rootScope.paramUrl;
        vm.stateParams = $stateParams;
        vm.allowedSelectCategoryForums = CommonConstants.allowedSelectCategoryForums;
        vm.allowedReplyWritingForums = CommonConstants.allowedReplyWritingForums;
        //vm.authorities = ['ROLE_HASLOGIN'];
        vm.gotoTop = gotoTop;
        vm.gotoDetail = gotoDetail;
        vm.edit = edit;
        vm.contentSlice = contentSlice;
        vm.pageChanged = pageChanged;
        vm.loadAll = loadAll;
        vm.searchBoxView = true;
        vm.providers = Organization.providers();

        vm.flag = (vm.state.forumId == "all") ? true : false;
        vm.condition = {
                forumId: vm.flag? vm.forumSelected : vm.state.forumId,
                targetOrganizationId: vm.providerSelected? vm.providerSelected.id : null,
                writerName: vm.writerSelected,
                postTitle: vm.postTitleSelected,
                size: vm.stateParams.size,
                page: vm.stateParams.page,
                sort: vm.stateParams.sort
        };
        vm.searching = searching;
        vm.goForumAll = goForumAll;

        vm.isWritable = vm.state.isWritable;
        Forum.list().$promise.then(function(response){
            vm.forums = response.filter(function(forum){
//                forum.fullTitle = forum.owner? '['+forum.owner.name+'] '+forum.title : '[공통] '+forum.title;
                forum.fullTitle = forum.title; // 신한에서는 fullTitle이 필요없음.
                return true;
            });
        });

        function arraySorting(array, cri, reverse) {
            switch(cri){
                case 'title' :
                    array.sort(function (a, b) {
                        if (a.title > b.title) return (reverse)? -1 : 1;
                        if (a.title < b.title) return (reverse)? 1 : -1;
                        return 0;
                    });
                    break;
                case 'id' :
                    array.sort(function (a, b) {
                        if (a.id > b.id) return (reverse)? -1 : 1;
                        if (a.id < b.id) return (reverse)? 1 : -1;
                        return 0;
                    });
                    break;
            }
        }

        if ($rootScope.account){
            vm.refOrg =$rootScope.account.organization;
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
            vm.isForumCreator = $rootScope.account.authorities.indexOf('ROLE_FORUM_CREATE') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        if (vm.flag) {
            loadAll();
        } else {
            if (!!vm.state.forumOwner) {
                Post.postCategories({orgId: vm.state.ownerId}).$promise.then(function(response){
                    $rootScope.postCategories = response;
                    vm.postCategories = angular.copy(response);
                    arraySorting(vm.postCategories, 'name');
                    vm.postCategories.push([0, '미분류']);
                    loadList();
                });
            } else loadList();
        }

        function edit() {
            $uibModal.open({
                templateUrl: 'app/forum/forum/forum-edit.html',
                controller: 'ForumEditController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        forum: null,
                        refOrg: vm.refOrg
                    }
                }
            }).result.then(function () {
                goForumAll();
            });
        }

        function goForumAll() {
            $rootScope.paramUrl = {forumId: 'all', forumTitle: '포럼 전체'};
            $state.reload('forumCommunity', $rootScope.paramUrl);
        }

        function searching () {
            vm.currentPage = 1;
            vm.condition = {
                forumId: vm.flag? vm.forumSelected : vm.state.forumId,
                targetOrganizationId: vm.providerSelected? vm.providerSelected.id : null,
                writerName: vm.writerSelected,
                postTitle: vm.postTitleSelected,
                size: vm.stateParams.size,
                page: 0,
                sort: vm.condition.sort //sort는 초기화없이 이전 설정이 계속 유지된다.
            };
            vm.flag? loadAll() : loadList();
        }

        function loadAll() {
            vm.listTitle = "포럼 전체";
            Forum.viewAll(vm.condition, function (response, headers) {
                vm.postlist = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function loadList() {
            vm.listTitle = vm.state.forumTitle;
            Post.list(vm.condition, function (response, headers) {
                vm.postlist = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function gotoDetail(post) {
            if (post.title != "비밀글입니다.") {
                if ($rootScope.paramUrl.forumId == 'all') {
                    $rootScope.paramUrl = {
                        forumId: 'all',
                        forumTitle: '포럼 전체',
                        idForviewAll: post.forum.id,
                        postId: post.id,
                        page: vm.condition.page,
                        sort: vm.stateParams.sort
                    };
                } else {
                    $rootScope.paramUrl = {
                        forumOwner: vm.state.forumOwner,
                        forumId: vm.state.forumId,
                        forumTitle: vm.state.forumTitle,
                        isWritable: vm.state.isWritable,
                        idForviewAll: post.forum.id,
                        postId: post.id,
                        page: vm.condition.page,
                        sort: vm.stateParams.sort
                    };
                }
                $state.go('post.detail');
            }
        }

        function contentSlice(post) {
            var id = "#content" + post.id;
            return (post.title == "비밀글입니다.") ? "" : $(id).html(post.content).text().slice(0, 40);
        }

        function gotoTop() {
            $(window).scrollTop(0);
        }

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            if (vm.flag) {
                loadAll();
            } else {
                loadList();
            }
        }

        function onSuccess() {

        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        /*function orgForumLoadAll() {
            vm.movePost = false;
            if($scope.account && $scope.account.organization){
                Org.forums().$promise.then(function (response) {
                    vm.forums = response;
                    vm.forums.forEach(function(forum){
                        forum.name = forum.title
                    });
                    roleCheck('ROLE_POST_MODIFY');
                });
            }
        }

        function roleCheck(role) {
            $rootScope.account.role.authorities.filter(function (roles) {
                if (role == roles.code) vm.movePost = true;
            });
        }
        orgForumLoadAll();
        console.log($rootScope.paramUrl)
        function selectForum(post){
            $uibModal.open({
                templateUrl: 'app/services/common/list-modal.html',
                controller: 'listModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    items: function () {
                        return {
                            data: vm.forums,
                            type:'selection',
                            title:'moveForum',
                            list:post
                        }
                    }
                }
            }).result.then(function (response) {
                Post.move({
                    forumId: post.forum.id,
                    postId: post.id,
                    targetForumId: response.id
                }).$promise.then(function () {
                    loadList();
                });
            });
        }*/
    }
})();

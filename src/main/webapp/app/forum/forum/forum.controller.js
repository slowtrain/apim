(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ForumController', ForumController);

    ForumController.$inject = ['CommonUtil', '$rootScope', '$state', '$timeout', 'Forum', 'Organization', 'Api', 'JhiLanguageService', 'Principal', '$uibModal', 'Post'];

    function ForumController(CommonUtil, $rootScope, $state, $timeout, Forum, Organization, Api, JhiLanguageService, Principal, $uibModal, Post) {
        var vm = this;
        vm.languages = null;
        vm.remove = remove;
        vm.state = $rootScope.paramUrl;
        vm.edit = edit;
        vm.checkSearch = checkSearch;
        vm.accordionUI = accordionUI;
        vm.accordionUI2 = accordionUI2;
        vm.forumView = forumView;

        if ($rootScope.account){
            vm.refOrg =$rootScope.account.organization;
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
            vm.isForumCreator = $rootScope.account.authorities.indexOf('ROLE_FORUM_CREATE') > -1;
        }
        if ($rootScope.paramUrl.forumId=='all') vm.selectId2 = null;

        getForumList();

        /* 미사용
         * 현재는 로그인화면이 모달창이 아니므로, 포럼화면상태에서 로그인을 하는 경우는 없다.
         * 현재는 로그아웃되면 무조건 home으로 전환되므로, 로그아웃시에 포럼화면에 대한 권한을 재설정할 필요가 없다.
         *
        // 포럼 화면 상태에서 로그인을 시도할 경우 권한 재설정이 필요하다.
        $rootScope.$on('authenticationSuccess', function () {
            vm.refOrg = Principal.identity().$$state.value.organization;
            getForumList();
        });
        // TODO 필요한가? 로그아웃 시에도 권한 재설정이 필요함
        $scope.$on('logout', function () {
            $timeout(getForumList, 1000);
        });
        */

        JhiLanguageService.getAll().then(function (languages) {
            vm.languages = languages;
        });

        function checkSearch(org) {
            vm.searchForum = (!vm.searchForum.owner) ? {} : vm.searchForum;
        }

        function edit(forum) {
            $uibModal.open({
                templateUrl: 'app/forum/forum/forum-edit.html',
                controller: 'ForumEditController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'md',
                resolve: {
                    selections: {
                        forum: forum,
                        refOrg: vm.refOrg
                    }
                }
            }).result.then(function () {
                getForumList();
            });
        }

        function remove(forum) {
            var name = forum.title + " 포럼을";
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
                if(result) Forum.delete({id: forum.id}, function(){ getForumList(); $rootScope.paramUrl={link: 'deletion'}; forumView() }, onError);
            });
        }

        function getForumList() {
            CommonUtil.underLoading('underLoading', {top:'0px', left:'0px', height: '100%'}, '50px', false);
            //모든 기관 정렬
            vm.providers = [];
            Forum.listPublic().$promise.then(function (response) {
                vm.commonForums = response;
                vm.commonForums.push({id:999, title:"1:1 문의하기", description:"1:1 문의하기", isAnonymousWritable:false, isApiDeleted:false, isConfigurable:false, isPrivate:false, isWritable:true});
                vm.providers = [{
                    originalId: 0,
                    id: 0,
                    title: '공통',
                    child: vm.commonForums
                }];
                Organization.providersForums().$promise.then(function (response) {
                    arraySorting(response, 'originalId');
                    vm.providers = vm.providers.concat(response);
                    if ($rootScope.paramUrl && $rootScope.paramUrl.link == 'postDetail') vm.accordionUI({originalId:$rootScope.paramUrl.ownerId, fromDetail:true});
                    else vm.accordionUI(vm.providers[0]);
                    CommonUtil.completeLoading();
                });
                /*Organization.providers().$promise.then(function (response_providers) {
                    if (!response_providers.length) CommonUtil.completeLoading();
                    else {
                        arraySorting(response_providers, 'id'); console.log(response_providers)
                        response_providers.forEach(function (provider, i) {
                            Organization.forums({id: provider.id}).$promise.then(function (response_forums){
                                if(response_forums.length > 0){
                                    vm.providers.push({
                                        originalId: provider.id,
                                        id: i + 1,
                                        title: provider.name, //기관명
                                        child: response_forums
                                    });
                                    var providerForums = d3.nest().key(function(response_forums){
                                        return (response_forums.api)? response_forums.api.name : null
                                    }).entries(response_forums);
                                    var commons = providerForums.filter(function(forum){
                                        return forum.key == 'null';
                                    });

                                    if(commons.length > 0){
                                        provider.apiDeletedForums = commons[0].values.filter(function(forum){
                                            return forum.isApiDeleted == true;
                                        });
                                        provider.commons = commons[0].values.filter(function(forum){
                                            return forum.isApiDeleted == false;
                                        });
                                    }else{
                                        provider.apiDeletedForums = [];
                                        provider.commons = [];
                                    }

                                    provider.apis = [{
                                        id: i+100,
                                        title: '공통',
                                        child: provider.commons
                                    }];

                                    var apiForums = providerForums.filter(function(forum){
                                        return forum.key != 'null';
                                    });
                                    apiForums.forEach(function(apiForum, j){
                                        provider.apis.push({
                                            id: j+ 1000,
                                            title: apiForum.key,
                                            child: apiForum.values
                                        });
                                    });

                                    if(provider.apiDeletedForums.length > 0){
                                        provider.apis.push({
                                            id: i+ 10000,
                                            title: '모음 - API 삭제 포럼',
                                            child: provider.apiDeletedForums
                                        });
                                    }

                                    vm.providers.push({
                                        originalId: provider.id,
                                        id: i + 1,
                                        title: provider.name, //기관명
                                        child: provider.apis //기관 api목록
                                    });
                                }else{
                                    vm.providers.push({
                                        originalId: provider.id,
                                        id: i + 1,
                                        title: provider.name, //기관명
                                        child: [] //기관 api목록
                                    });
                                }
                                if (provider.id == '2') {console.log(provider); vm.accordionUI({initial:true})};
                                if (i == response_providers.length-1) {
                                    if ($rootScope.paramUrl && $rootScope.paramUrl.link == 'postDetail') vm.accordionUI({originalId:$rootScope.paramUrl.ownerId, fromDetail:true});
                                    //else vm.accordionUI({initial:true});
                                    CommonUtil.completeLoading(); // 로딩마무리는 promise 마지막회전에서 이루어져야 한다.
                                }
                            });
                        });
                    }
                });*/
            });
        }

        function arraySorting(array, cri, reverse) {
            switch(cri){
                case 'originalId' :
                    array.sort(function (a, b) {
                        if (a.originalId > b.originalId) return (reverse)? -1 : 1;
                        if (a.originalId < b.originalId) return (reverse)? 1 : -1;
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

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        // ACCODION UI

        function accordionUI(provider) {
            if(provider.originalId != vm.selectId) {
                vm.selectId2 = null;
                provider.accordion = false;
            }
            if(provider.fromDetail) {
                $timeout(function(){
                    vm.providers.some(function(p){
                        if (p.originalId == $rootScope.paramUrl.ownerId) {
                            vm.selectId = p.originalId;
                            p.accordion = true;
                        }
                        return p.originalId == $rootScope.paramUrl.ownerId;
                    });
                });
            } else if(provider.child) {
                vm.selectId = provider.originalId;
                provider.accordion = !provider.accordion;
            }
        }
        function accordionUI2(api){
            if(api.id != vm.selectId2){
                vm.selectId2 = null;
                vm.selectForum = null;
                api.accordion = false;
            }
            if(api.child) {
                vm.selectId2 = api.id;
                vm.selectForum = api;
                api.accordion = !api.accordion;
            }else if(api.title !='공통') {
                vm.selectId2 = api.id;
                vm.selectForum = api;
                forumView(api);
            }
        }

        function forumView(forum) {
            if(forum){
                $rootScope.paramUrl = {ownerId: forum.owner? forum.owner.id : null, forumOwner:forum.owner? forum.owner.name : null, forumId: forum.id, forumTitle: forum.title, isWritable: forum.isWritable};
                if($state.$current.self.name != 'question' && forum.id == 999) $state.go('question', $rootScope.paramUrl);
                else if(forum.id == 999) $state.reload('question', $rootScope.paramUrl);
                else if($state.$current.self.name != 'post') $state.go('post', $rootScope.paramUrl);
                else $state.reload('post', $rootScope.paramUrl); //새로고침을 위해
            }else{
                //홈 화면에서 포럼 접속시
                if($rootScope.paramUrl.link == 'home'){
                    if($rootScope.paramUrl.url == 'post') $state.go('post', $rootScope.paramUrl);
                    else $state.go('post.detail', $rootScope.paramUrl);

                //포럼 목록에서 포럼을 삭제한 경우, 전체글목록으로 이동
                }else if($rootScope.paramUrl.link == 'deletion') {
                    // 현재 state에서 패러미터만 바꿀 경우에는 reload를 써야 한다.
                    $rootScope.paramUrl = {forumId: 'all', forumTitle: '포럼 전체'};
                    $state.reload('post', {forumId: 'all', forumTitle: '포럼 전체'});

                // 다른 메뉴에서 포럼으로 접속시 전체게시글 표시
                }else if($rootScope.paramUrl.link != 'postDetail') {
                    $rootScope.paramUrl = {forumId: 'all', forumTitle: '포럼 전체'};
                    $state.go('post', {forumId: 'all', forumTitle: '포럼 전체'});
                }
            }
        }
        forumView();
    }
})();

(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('PostDetailController', PostDetailController);

    PostDetailController.$inject = ['CommonConstants', 'Organization', '$compile', '$rootScope', '$uibModal', '$timeout', 'User', '$stateParams', '$scope', 'Post', 'Forum', 'Principal', '$state','$interval','JhiLanguageService', 'CommonUtil'];

    function PostDetailController (CommonConstants, Organization, $compile, $rootScope, $uibModal, $timeout, User, $stateParams, $scope, Post, Forum, Principal, $state, $interval, JhiLanguageService, CommonUtil) {
        var vm = this;
        vm.state = $rootScope.paramUrl;
        vm.providers = Organization.providers();
        vm.allowedSelectCategoryForums = CommonConstants.allowedSelectCategoryForums;
        vm.allowedPrivateWritingForums = CommonConstants.allowedPrivateWritingForums;
        vm.allowedReplyWritingForums = CommonConstants.allowedReplyWritingForums;
        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;
        vm.fileSize = CommonUtil.fileSize;
        vm.deletion = false;
        vm.files = [{data:null}];

        $scope.addFileInput = function(event, noAdd){
            if (!vm.deletion){
                var idx = event.target.id.split('-')[1];
                CommonUtil.addFileInput(idx, vm.files, noAdd);
            }
        }

        if ($rootScope.account){
            vm.user = $rootScope.account; //login 정보 사용하기 위해.
            vm.isAdmin = $rootScope.account.authorities.indexOf('ROLE_ADMIN') > -1;
            vm.isForumCreator = $rootScope.account.authorities.indexOf('ROLE_FORUM_CREATE') > -1;
        }else vm.user={login: '-1'} //비로그인자에게 -1 부여.

        vm.languages = null;
        vm.update = update;
        vm.delPost = delPost;
        vm.commentW = commentW;
        vm.readOnlyToggle = readOnlyToggle;
        vm.readToggle = readToggle;
        vm.readOnly = true;
        vm.htmlContents = htmlContents;
        vm.commentWShow = commentWShow;
        vm.commentInputOff = commentInputOff;
        vm.viewForums = viewForums;
        vm.selectForum = selectForum;
        vm.maximumImageFileSizeCheck = maximumImageFileSizeCheck;
        vm.summernoteToolbar =
        {
            toolbar: [
                ['edit',['undo','redo']],
                ['headline', ['style']],
                ['style', ['bold', 'italic', 'underline', 'superscript', 'subscript', 'strikethrough', 'clear']],
                ['fontface', ['fontname']],
                ['textsize', ['fontsize']],
                ['fontclr', ['color']],
                ['alignment', ['ul', 'ol', 'paragraph', 'lineheight']],
                ['height', ['height']],
                ['table', ['table']],
                ['insert', $rootScope.check_ie9 ? ['link','video','hr'] : ['link','picture','video','hr']],
                ['view', ['fullscreen', 'codeview']],
                ['help', ['help']]
            ],
            lang: 'ko-KR',
            maximumImageFileSize: CommonConstants.editorImageFileSize,
            callbacks: {
                onImageUploadError : vm.maximumImageFileSizeCheck
            }
        };

        function maximumImageFileSizeCheck(){
            CommonUtil.onError('이미지크기가 '+CommonUtil.fileSize({fileSize: CommonConstants.editorImageFileSize})+'를 초과했습니다.')
        }

        vm.replyToolbar =
            {
                toolbar: [
                    ['style', ['bold', 'italic', 'underline']],
                    ['fontclr', ['color']],
                    ['insert', $rootScope.check_ie9 ? ['link'] : ['link','picture']]
                ],
                lang: 'ko-KR',
                maximumImageFileSize: CommonConstants.editorImageFileSize,
                callbacks: {
                    onImageUploadError : vm.maximumImageFileSizeCheck
                }
            };

        //vm.user = Principal.identity();
        vm.mode = "register";
        vm.fileDown = fileDown;
        vm.delFile = delFile;
        vm.init = init;
        vm.categoryFilter = categoryFilter;

        vm.flag = (vm.state.forumId=="all")? true: false;
        vm.forumId = (vm.state.forumId=="all")? vm.state.idForviewAll: vm.state.forumId;
        vm.listTitle = (vm.flag)? "포럼 전체": vm.state.forumTitle;

        function categoryFilter(category) {
            return !vm.searchCategory || category[1].indexOf(vm.searchCategory) > -1;
        }

        function init(){
            Post.detail({
                forumId: vm.forumId,
                postId: vm.state.postId
            }).$promise.then(function(response){
                vm.post = response;
                vm.original = angular.copy(vm.post);
                $timeout(function(){$('#postContent').html(vm.post.content);});
            });
        }

        init();

        function selectForum(post){
            if($scope.account && $scope.account.organization){
                Organization.availableForums().$promise.then(function (response) {
                    vm.forums = response;
                    vm.forums.forEach(function(forum){
                        forum.name = forum.title
                    });
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
                            vm.goForumAll();
                        });
                    });
                });
            }
        }

        vm.goForumAll = goForumAll;
        function goForumAll() {
            $rootScope.paramUrl = {forumId: 'all', forumTitle: '포럼 전체'};
            $state.go('post', $rootScope.paramUrl);
        }

        function htmlContents(reply){
            var id = '#content'+reply.id;
            $(id).html(reply.content);
        }

        function delFile(file, index){
            vm.post.attachFileList.splice(index, 1);
        }

        function fileDown(file){
            if($scope.account) window.location = '/files/download/'+file.id;
        }

        function commentInputOff(arg){
            $("div.replyHide").hide();
            if(vm.mode == 'modify') vm.addReply = arg;
            else vm.addReply = {};
        }

        function commentWShow(arg, mode) {
            $("div.replyHide").hide();
            vm.addReply ={};
            if(mode) { vm.addReply = angular.copy(arg); vm.mode="modify"; }
            else vm.mode="register";
            var id = "#reply"+arg.id;
            $(id).show();
        }

        function readOnlyToggle(choice, post) {
            if(choice) reloadPost();
            else {
                vm.readOnly = choice;
                CommonUtil.scrollTop();
                vm.post = angular.copy(post);
                $timeout(function(){$('#postContent').html(post.content);},200);
            }
        }

        function readToggle(arg, choice, content) {
            var id = "#"+arg;
            $(id).attr("readonly", choice);
            if(content) $(id).val(content);
        }

        function commentW(arg, reply) {
            if(vm.mode=="register" || arg== vm.post){
                Post.commentW({forumId: vm.forumId, postId: arg.id}, reply, onSuccess);
                vm.addReply={};
            }else{
                Post.update({forumId: vm.forumId, postId: arg.id}, reply, onSuccess);
            }
        }

        function onSuccess(arg) {
            if (arg==vm.post.id) {
                $rootScope.paramUrl = {forumOwner: vm.state.forumOwner, forumId:vm.state.forumId, forumTitle:vm.state.forumTitle, isWritable:vm.state.isWritable, page:vm.state.page, sort:vm.state.sort};
                $state.go('post');
               // location.replace("#/forum/"+vm.state.forumId+"/posts?page="+vm.state.page+"&size="+vm.state.size+"&sort="+vm.state.sort);
            }else{
                if(vm.reply){
                    if(arg.id){
                        vm.reply = '';
                        $timeout(function(){ $compile($('#commentContent').contents())($scope) });
                    }
                }
                init();
            }
        }

        function viewForums(forum){
            $rootScope.paramUrl = {
                    ownerId:(forum && forum.owner)? forum.owner.id : 0,
                    forumOwner:(forum && forum.owner)? forum.owner.name : vm.state.forumOwner,
                    forumId:(forum)? forum.id: vm.state.forumId,
                    forumTitle:(forum)? forum.title: vm.state.forumTitle,
                    isWritable:(forum)? forum.isWritable: vm.state.isWritable,
                    sort: vm.state.sort,
                    link: 'postDetail'
            };
            $state.go('post');
            if (forum) $timeout(function(){$state.reload('forumCommunity')});
        }

        function updatePost(data){
            vm.post.attachFileIds = (data)? data: [];
            vm.post.attachFileList.forEach(function(file, i){
                vm.post.attachFileIds.push(file.id);
            });
            Post.update({forumId: vm.forumId, postId: vm.post.id}, vm.post, reloadPost, function(error) { CommonUtil.onError(error.data.description); });
        }

        function reloadPost(){
            $state.reload('post.detail');
        }

        function update(){
            var flag = false;
            var totalSize = 0;
            $('input[type=file].file-input').each(function(idx){
                if($(this).val()) {
                    if(navigator.userAgent.indexOf('MSIE 9.0') <0 && $(this)[0].files[0].size >= CommonConstants.attachFileSize) vm.violationOfSize= true;
                    else {
                        totalSize += $(this)[0].files[0].size;
                        flag= true;
                    }
                }
                else $(this).attr('disabled', 'disabled');
            });

            if (vm.violationOfSize) {
                $('input[type=file].file-input').each(function (idx) {
                    $(this).removeAttr('disabled');
                });
                CommonUtil.onError('각각의 파일은 '+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+'를 넘을 수 없습니다.');
                vm.violationOfSize = false;
                return;
            }

            if (totalSize > CommonConstants.totalFileSize) {
                CommonUtil.onError('업로드 파일의 총 용량은 '+CommonUtil.fileSize({fileSize: CommonConstants.totalFileSize})+'를 넘을 수 없습니다.');
                return;
            }

            var xsrf_token = CommonUtil.getCookie("XSRF-TOKEN");

            if(flag){
                $("#fileForm").ajaxForm({
                    url : "/files/upload?_csrf="+xsrf_token,
                    enctype: "multipart/form-data",
                    type : "post",
                    dataType: "json",
                    data: {type: "forum"},
                    success : function(data) {
                        updatePost(data);
                        $scope.$apply();
                    },
                    error: function (error) {
                        $('input[type=file].file-input').each(function (idx) {
                            $(this).removeAttr('disabled');
                        });
                        //ie9의 경우 서버에서 에러메시지를 받지 못하므로 ui에서 일괄 표시한다.
                        if(navigator.userAgent.indexOf('MSIE 9.0')!==-1) {
                            CommonUtil.onError('업로드 대상 파일을 다시 확인해 주십시오.');
                            return;
                        }
                        if(error.status == 500) CommonUtil.onError('업로드 대상 파일을 다시 확인해 주십시오.');
                        else CommonUtil.onError(error.responseJSON.description);
                        return;
                    }
                });
                $("#fileForm").submit();
            }else updatePost();
        }

        function delPost(arg){
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items:function(){
                        return{
                            data: '이 글을',
                            type:'delete'
                        }
                    }
                }
            }).result.then(function () {
                Post.delete({forumId: vm.forumId, postId: arg}).$promise.then(function(response){
                    onSuccess(arg);
                    vm.mode="register";
                }).catch(function(error) { CommonUtil.onError(error.data.description)} );
            });
        }
    }
})();

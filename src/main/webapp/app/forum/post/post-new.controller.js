(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('PostNewController', PostNewController);

    PostNewController.$inject = ['Organization', 'GeneralInfo', 'CommonConstants', '$timeout', '$compile', '$rootScope', '$stateParams', '$scope', 'Post', 'Forum', '$state', 'JhiLanguageService', 'CommonUtil'];

    function PostNewController (Organization, GeneralInfo, CommonConstants, $timeout, $compile, $rootScope, $stateParams, $scope, Post, Forum, $state, JhiLanguageService, CommonUtil) {
        var vm = this;
        vm.languages = null;
        vm.save = save;
        vm.state = $rootScope.paramUrl;
        vm.allowedSelectCategoryForums = CommonConstants.allowedSelectCategoryForums;
        vm.allowedPrivateWritingForums = CommonConstants.allowedPrivateWritingForums;
        vm.clear = clear;
        vm.categoryFilter = categoryFilter;
        vm.setSecret = false;
        vm.flag = (vm.state.forumId=="all")? true: false;
        vm.providers = Organization.providers();

        vm.forum = {};
        vm.post={};

        vm.delInput = CommonUtil.delInput;
        vm.selectFile = CommonUtil.selectFile;
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
        vm.listTitle = (vm.flag)? "포럼 전체": vm.state.forumTitle;

        /*Forum.list().$promise.then(function(response){
            vm.forums = response.filter(function(forum){
                return forum.isWritable = true;
            })
        });*/

        function categoryFilter(category) {
            return !vm.searchCategory || category[1].indexOf(vm.searchCategory) > -1;
        }

        function clear() {
            onSuccess();
        }

        function createPost(){
            var id = (vm.state.forumId=="all")? vm.forum.id: vm.state.forumId;
            Post.create({forumId: id}, vm.post, onSuccess);
        }

        function save(){
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
                CommonUtil.onError("첨부파일사이즈는 "+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+"를 넘을 수 없습니다.");
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
                        vm.post.attachFileIds=data;
                        createPost();
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
            }else createPost();
        }

        function onSuccess (result) {
            $state.go('post', {forumOwner: vm.state.forumOwner, forumId: vm.state.forumId, forumTitle:vm.state.forumTitle, isWritable:vm.state.isWritable});
        }
    }
})();

(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('ApiTermsController', ApiTermsController);

    ApiTermsController.$inject =['$compile', '$timeout', 'CommonConstants', '$stateParams', '$scope', 'Api', '$uibModal', 'CommonUtil'];

    function ApiTermsController($compile, $timeout, CommonConstants, $stateParams, $scope, Api, $uibModal, CommonUtil) {

        var vm = this;
        vm.stateParams = $stateParams;
        vm.sorting = sorting;

        vm.authorities = ['ROLE_API_VIEW', 'ROLE_ADMIN'];
        vm.loadAll = loadAll;
        vm.condition = {
            size: vm.stateParams.size,
            page: vm.stateParams.page,
            sort: vm.stateParams.sort
        };
        vm.loadAll();
        vm.delTerms = delTerms;
        vm.addTerms = addTerms;
        vm.editTerms = editTerms;
        vm.pageChanged = pageChanged;
        vm.readOnlyToggle = readOnlyToggle;
        vm.save = save;
        vm.clear = clear;
        vm.showTermsContent = showTermsContent;
        vm.closeTerm = closeTerm;
        vm.fileSize = CommonUtil.fileSize;
        vm.fileDown = fileDown;
        vm.readOnly = true;
        vm.delFile = delFile;

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

        vm.termPopover = {
            templateUrl: 'app/layouts/popover-template/content-popover.html'
        };

        vm.maximumImageFileSizeCheck = maximumImageFileSizeCheck;
        vm.summernoteToolbar =
        {
            toolbar: [
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

        vm.iePdfviewHelpPopover = { templateUrl : "/app/layouts/popover-template/ie-pdf-view-help-popover.html" };

        function sorting(predicate, option){
            vm.condition.sort = CommonUtil.sorting(vm.condition.sort, predicate, option);
            vm.condition.page = 0;
            vm.currentPage = 1;
            loadAll();
        }

        function delFile(file, index){
            vm.terms.attachFileIds = null;
            vm.terms.attachFileList.splice(index, 1);
        }

        function readOnlyToggle() {
            vm.readOnly = false;
        }

        function loadAll(page){
            vm.showDiv = false;
            if (page >=0) {
                vm.condition.page = page;
                vm.currentPage = page + 1;
            }
            Api.listTerms(vm.condition, function(response, headers){
                vm.termsList = response;
                vm.totalItems = headers('x-total-count');
            });
        }

        function pageChanged() {
            vm.condition.page = vm.currentPage - 1;
            loadAll();
        }

        function addTerms(){
            vm.readOnly = false;
            vm.showDiv = true;
            vm.mode = 'register';
            vm.terms = {};
        }

        function editTerms(terms, mode){
            vm.showDiv = true;
            vm.mode = mode;
            vm.readOnly = (mode=="view")? true: false;
            vm.terms = terms;
            vm.original = angular.copy(terms);
            $timeout(function () {
                $("#contentsBody").html(vm.terms.content);
            });
        }

      //현재 삭제권한은 admin에게만 있다. 아직 이 제한 사항을 코드에 반영 안 했음.
        function delTerms(terms){
            var name = terms.name + " 약관을";
            var func = function(result){
                if(result) Api.delTerms({id: terms.id}, function() { loadAll(0) }, onError);
            }
            CommonUtil.deleteModal(name, func);
        }

        function onError(error){
            CommonUtil.onError(error.data.description);
        }

        function createTerms () {
            vm.terms.attachFileList = null;
            if (vm.mode=='register') Api.addTerms(vm.terms, function() { loadAll(0) }, onError);
            else Api.editTerms({id:vm.terms.id}, vm.terms, loadAll, onError);
        }

        function onSuccess () {
            vm.loadAll();
        }

        function clear() {
            vm.terms = (vm.mode=='register')? {}: angular.copy(vm.original); //2-way binding 막기위해서.
            $timeout(function () {
                $compile($('#summernoteEditor').contents())($scope);
            });
        }

        function showTermsContent(terms) {
            $uibModal.open({
                templateUrl: 'app/services/common/terms-modal.html',
                controller: 'termsModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'lg',
                resolve: {
                    item: terms
                }
            });
        }

        function closeTerm() {
            vm.isTermsOpen_$index = false;
        }

        function save(){

            var xsrf_token = CommonUtil.getCookie("XSRF-TOKEN");

            if($("input[name=file-input]").val()){
                var type = $("input[name=file-input]").val().substring($("input[name=file-input]").val().lastIndexOf('.')+1).toUpperCase();
                if(type != "PDF") {
                    CommonUtil.onError("PDF 파일만 가능합니다.");
                    return;
                }
                if(navigator.userAgent.indexOf('MSIE 9.0') <0 && $("input[name=file-input]")[0].files[0].size >= CommonConstants.attachFileSize) {
                    CommonUtil.onError("파일사이즈는 "+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+"를 넘을 수 없습니다.");
                    return;
                }
                $("#fileForm").ajaxForm({
                    url : "/files/upload?_csrf="+xsrf_token,
                    enctype: "multipart/form-data",
                    type : "post",
                    dataType: "json",
                    data:{type:"terms"},
                    success : function(data) {
                        vm.terms.attachFileIds=data;
                        createTerms();
                        $scope.$apply();
                    },
                    error: function (error) {
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
            }else{
                vm.terms.attachFileIds = [];
                if(vm.terms.attachFileList && vm.terms.attachFileList.length > 0){
                    vm.terms.attachFileList.forEach(function (list) {
                        vm.terms.attachFileIds.push(list.id);
                    });
                }
                createTerms();

                /*//만약 기존 파일이 없으면
                if(!vm.terms.attachFileList || vm.terms.attachFileList.length==0) {
                    CommonUtil.onError("첨부파일은 필수입니다.");
                } else {
                    vm.terms.attachFileIds = [];
                    vm.terms.attachFileList.forEach(function (list) {
                        vm.terms.attachFileIds.push(list.id);
                    });
                    createTerms();
                }*/
            }
        }

        function fileDown(file){
            if($scope.account) window.open('/files/view/'+file.id, '약관', null);
        }
    }
})();

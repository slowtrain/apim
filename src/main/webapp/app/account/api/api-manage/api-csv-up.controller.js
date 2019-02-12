(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .controller('apiCsvUpController', apiCsvUpController);

    apiCsvUpController.$inject = ['CommonConstants', '$uibModalStack', '$compile', '$uibModalInstance', '$scope', '$uibModal', 'Api', 'JhiLanguageService', '$timeout', 'CommonUtil'];

    function apiCsvUpController(CommonConstants, $uibModalStack, $compile, $uibModalInstance, $scope, $uibModal, Api, JhiLanguageService, $timeout, CommonUtil) {

        var vm = this;
        var xsrf_token = CommonUtil.getCookie("XSRF-TOKEN");
        //신규 추가일 경우 초기값 설정
        vm.delInput = CommonUtil.delInput;
        vm.selectFile = selectFile;
        vm.deletion = false;

        vm.csvFiles = [{data:null}];

        $scope.addFileInput = function(event, noAdd){
            var idx = event.target.id.split('-')[1];
            CommonUtil.addFileInput(idx, vm.csvFiles, noAdd);
        }

        vm.authorities = ['ROLE_API_CREATE'];

        vm.clear = clear;
        vm.languages = null;
        vm.save = save;

        function selectFile(idx) {
            vm.totalCount = null;
            vm.successCount = null;
            vm.results = null;
            vm.showFails = false;
            CommonUtil.selectFile(idx);
        }


        function clear() {
            $uibModalInstance.close('confirm');
        }

        function onSuccess(result) {
            if (result.status == 'UPDATING') {
                CommonUtil.onError('승인이 필요한 사항을 변경하셨습니다.<br/>승인요청을 진행하시기 바랍니다.');
            }
            $uibModalInstance.close(result);
        }

        function onError(error) {
            CommonUtil.onError(error.data.description);
        }

        function save(form) {
            CommonUtil.underLoading('uploading', {top:'0px', left:'14px', width:'96%', height: '100%'}, '50px', false);
            if ($('input[name=csvFile]').val()) {
                var type = $('input[name=csvFile]').val().substring($('input[name=csvFile]').val().lastIndexOf('.') + 1).toUpperCase();
                if (type != "XLSX") {
                    CommonUtil.onError("XLSX 파일만 가능합니다.");
                    CommonUtil.completeLoading();
                    return;
                }
                if(navigator.userAgent.indexOf('MSIE 9.0') <0 && $('input[name=csvFile]')[0].files[0].size >= CommonConstants.attachFileSize) {
                    CommonUtil.onError("파일 용량은 "+CommonUtil.fileSize({fileSize: CommonConstants.attachFileSize})+"를 넘을 수 없습니다.");
                    CommonUtil.completeLoading();
                    return;
                }
                $("#csvFile").ajaxForm({
                    url: "/files/upload-csv?_csrf=" + xsrf_token,
                    enctype: "multipart/form-data",
                    type: "post",
                    cache: "false",
                    dataType: "json",
                    data: {type: "CSV"},
                    /*beforeSend: function() {
                        var percentVal = '0%';
                        $('.bar').width(percentVal);
                        $('.percent').html(percentVal);
                    },
                    uploadProgress: function(event, position, total, percentComplete) {
                        var percentVal = percentComplete + '%';
                        $('.bar').width(percentVal);
                        $('.percent').html(percentVal);
                    },*/
                    success: function (data) {
                        /*var percentVal = '100%';
                        $('.bar').width(percentVal);
                        $('.percent').html(percentVal);*/
                        CommonUtil.completeLoading();
                        vm.results = data.fail;
                        vm.totalCount = data.totalCount[0];
                        vm.successCount = data.successCount[0];
                        $scope.$apply();
                    },
                    error: function (error) {
                        CommonUtil.completeLoading();
                        //ie9의 경우 서버에서 에러메시지를 받지 못하므로 ui에서 일괄 표시한다.
                        if(navigator.userAgent.indexOf('MSIE 9.0')!==-1) {
                            CommonUtil.onError('파일을 다시 확인해 주십시오.');
                            return;
                        }
                        if(error.status == 500) CommonUtil.onError('파일을 다시 확인해 주십시오.');
                        else CommonUtil.onError(error.responseJSON.description);
                        return;
                    }
                });
                $("#csvFile").submit();
            }
        }
    }
})();

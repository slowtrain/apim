(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('CommonUtil', CommonUtil)
        .directive('onChangeFile', onChangeFile)
        .directive('ngEnter', ngEnter);

    onChangeFile.$inject = [];
    function onChangeFile() {
        return {
            link: function (scope, element, attrs) {
                var onChangeHandler = scope.$eval(attrs.onChangeFile);
                element.bind('change', onChangeHandler);
            }
        }
    }

    ngEnter.$inject = ['$document']; // 버튼 하나의 모달창에 대해 enter 키 닫힘기능 추가
    function ngEnter($document) {
        return {
            scope: {
                ngEnter: "&"
            },
            link: function(scope, element, attrs) {
                var enterWatcher = function(event) {
                    if (event.keyCode === 13) {
                        scope.ngEnter();
                        scope.$apply();
                        event.preventDefault();
                        $document.unbind("keydown keypress", enterWatcher);
                    }
                };
                $document.bind("keydown keypress", enterWatcher);
            }
        }
    }

    CommonUtil.$inject = ['$rootScope', '$uibModal', '$timeout', '$document'];
    function CommonUtil ($rootScope, $uibModal, $timeout, $document) {
        var service = {
            underLoading : underLoading,
            completeLoading : completeLoading,
            sorting : sorting,
            getCookie : getCookie,
            getStorage : getStorage,
            setStorage : setStorage,
            removeStorage : removeStorage,
            fileDown : fileDown,
            fileSize : fileSize,
            closeDays : closeDays,
            modalZero: modalZero,
            modalOne: modalOne,
            modalTwo: modalTwo,
            onError : onError,
            deleteModal : deleteModal,
            unuseModal : unuseModal,
            commaSplit:commaSplit,
            commaBind:commaBind,
            scrollTop: scrollTop,
            selectFile: selectFile,
            addFileInput: addFileInput,
            delInput: delInput
        };

        return service;

        function selectFile(index) {
            $('#hiddenInputFile-'+index).click();
        }

        function addFileInput(index, files, noAdd) {
            var location = $('#hiddenInputFile-'+index).val().split("\\");
            $('#viewInputFile'+index).val(location[location.length-1]);
            if (location[0]=="") return; //선택취소할 경우에도 file.data=true가 되는 것을 방지하기 위해.
            $timeout(function(){
                if (!noAdd) files.push({data:null});
                if (index < 1000) files[index].data = true;
                else files[index-1000].data = true;
            });
        }

        function delInput(index, files, mode, trunk) {
            if(mode=='edit') trunk.attachFileList.splice(index, 1);
            else{
                $('#hiddenInputFile-'+index).val(null);
                files.splice(index, 1);
            }
        }

        function scrollTop() {
            $timeout(function() { $("html, body").scrollTop(0) });
        }

        function underLoading(element, backPosition, imgPosition, logoDisplay){
//            if ($(document).has("#loading").length > 0) return;
            logoDisplay = false;
            var backPosition = backPosition || {};
            var element = element || 'uiViewContent';
            var backTop =  backPosition.top || '76px';
            var backLeft =  backPosition.left || '0px';
            var backWidth =  backPosition.width || '100.1%';
            var backHeight =  backPosition.height || '94%';
            var imgPosition =  imgPosition || '40%';
            var loadingCircle = $('<div id = "loading" class="loading" style="top:'+backTop+'; left:'+backLeft+'; width:'+backWidth+'; height:'+backHeight+'">' +
//                '<img id="loading_logo" src="/img/portal/uno_logo.png" style="top:'+imgPosition+'"/>' +
                '<img id="loading_img" alt="loading" src="/img/portal/underloading.gif" style="top:'+imgPosition+'"/></div>').appendTo($('#'+element)).hide();
            loadingCircle.show();
//            if (logoDisplay === false) $('#loading_logo').hide();
        }

        function completeLoading(){
            $('#loading').remove();
            $('#loading_img').remove();
            $('#loading_logo').remove();
        }

        function sorting(sort, dbField, tdField, defaultCri) {
            var bottomClass = "sort-position glyphicon glyphicon-triangle-bottom"; //내림차순 표시
            var topClass = "sort-position glyphicon glyphicon-triangle-top"; //오름차순 표시
            var id = (tdField)? tdField : dbField;
            var order =  null;
            if(sort.indexOf(dbField) > -1){
                order = (sort.indexOf(',desc') > -1)? 'A' : 'N'; //그냥 desc를 검색하면, description 칼럼도 해당되므로, 쉼표까지 같이 검색한다.

                // desc 다음에는 asc
                if (order == 'A'){
                    $("i#"+id).removeClass(bottomClass);
                    $("i#"+id).addClass(topClass);
                    sort = dbField+',asc';

                // asc 다음에는 초기정렬(id 내림차순)로 복귀
                }else{
                    $("i#"+id).removeClass(topClass);
                    $("i#"+id).addClass(bottomClass);
                    $("i").removeClass("sort");
                    sort = defaultCri || 'id,desc';
                }
            // sorting을 처음 클릭시 해당 칼럼 desc 정렬
            }else{
                $("i").removeClass("sort");
                $("i#"+id).removeClass(topClass);
                $("i#"+id).addClass(bottomClass);
                $("i#"+id).addClass("sort");
                sort = dbField+',desc';
            }
            return sort;
        }



        function getCookie(name){
            var i, x, y, arrayOfCookies = document.cookie.split(";");
            for (i=0; i< arrayOfCookies.length; i++){
                x = arrayOfCookies[i].substr(0, arrayOfCookies[i].indexOf("="));
                y = arrayOfCookies[i].substr(arrayOfCookies[i].indexOf("=")+1);
                x = x.replace(/^\s+|\s+$/g, "");
                if (x == name) return decodeURI(y);
            }
        }

        function setStorage(name, value, expiredays){
            if (!!expiredays) {
                var todayDate = new Date();
                todayDate.setDate(todayDate.getDate()+expiredays);
                window.localStorage.setItem(name+value, todayDate.toGMTString());
            }else window.localStorage.setItem(name, value);
        }

        function getStorage(name){
            return window.localStorage.getItem(name);
        }

        function removeStorage(name){
            window.localStorage.removeItem(name);
        }

        function closeDays(name){
            var id = window.localStorage.getItem(name);
            setStorage(id,"done",1);
            self.close();
        }

        function deleteCookie(name){
            var expireDate = new Date();
            expireDate.setDate(expireDate.getDate()-1);
            document.cookie = name+"=; path=/; expires="+expireDate.toGMTString() +";"
        }

        function fileDown(file, url){
            if (window.localStorage.getItem('loginStatus')=='success' || $rootScope.account)
            window.location = (url? url:'/files/download/')+file.id;
        }

        function fileSize(file){
            var fsize=0;
            var checkSize = function(size){
                fsize = Math.floor(size/1024);
                return fsize;
            };
            return (checkSize(file.fileSize) == 0)? file.fileSize+"bytes": (fsize < 1024)? fsize+"kb": checkSize(fsize)+"mb";
        }

        function modalZero(params) {
            if (typeof params == 'string') params = {message: params};
            $uibModal.open({
                templateUrl: 'app/components/modal/modal.html',
                controller: 'ModalController',
                controllerAs: 'vm',
                animation: false,
                backdrop: 'static',
                size: (params.size ? params.size : 'sm'),
                resolve: {
                    params: params,
                    type: 0
                }
            }).result.then(function (result) {
                    if (params.callback) params.callback(result);
                });
        }

        function modalOne(params) {
            if (typeof params != 'object') params = {message: params};
            $uibModal.open({
                templateUrl: 'app/components/modal/modal.html',
                controller: 'ModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: (params.size ? params.size : 'sm'),
                resolve: {
                    params: params,
                    type: 1
                }
            }).result.then(function (result) {
                    if (params.callback) params.callback(result);
                });
        }

        function modalTwo(params) {
            $uibModal.open({
                templateUrl: 'app/components/modal/modal.html',
                controller: 'ModalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: (params.size ? params.size : 'sm'),
                resolve: {
                    params: params,
                    type: 2
                }
            }).result.then(function (result) {
                    if (params.callback) params.callback(result);
                });
        }

        function onError (message, size, type, customfunc, title) {
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: (size?size:'sm'),
                resolve: {
                    items:function(){
                        return{
                            type:(type? type:'error'),
                            message: message,
                            title:title
                        }
                    }
                }
            }).result.then(function(result){ customfunc(result) });
        }

        function deleteModal (name, customfunc) {
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items:function(){
                        return{
                            data: name,
                            type: 'delete'
                        }
                    }
                }
            }).result.then(function(result){ customfunc(result) });
        }

        function unuseModal (name, customfunc) {
            $uibModal.open({
                templateUrl: 'app/services/common/modal.html',
                controller: 'modalController',
                controllerAs: 'vm',
                backdrop: 'static',
                size: 'sm',
                resolve: {
                    items:function(){
                        return{
                            data: name,
                            type: 'unuse'
                        }
                    }
                }
            }).result.then(function(result){ customfunc(result) });
        }

        function commaSplit(number){
            number = String(number);
            var num = number.replace(/[^(\d.)]+/g, '');
            return num;
        }

        function commaBind(number){
            number = String(number);
            var num = number.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
            return num;
        }
    }
})();

(function($){
    var opt, ele;

    $.fn.siteSecurity = function(option, rootScope) {
        ele = $(this);
        opt = option;

        /*if (opt.exceptionip !='') {
            $.get("http://ipinfo.io", function(res){
                resconverter(res.ip);
            }, "jsonp");
        } else resconverter(false);*/

        resconverter(false);
        function resconverter(ip) {
            if (opt.exception !=ip || ip === false) {

                    /** IE에서 printScreen 키에 대한 keyup 이벤트 오류가 있다.
                     * 굳이 IE에서 capture를 막아야 한다면, 아래 코드(interval)를 사용한다.
                    if (opt.printScreen =='y') {
                        $(document).ready(function(){
                            setInterval(function(){
                                if (window.clipboardData) window.clipboardData.clearData();
                            }, 500)
                        });
                    }*/

                ele.bind('keydown', function(e){ //f12, ctrl+A 키는 keydown 이벤트로 캐치할 수 있다.
                    if (opt.f12 =='y' && e.keyCode === 123) { e.preventDefault();}
                    if (opt.A == 'y' && e.ctrlKey && e.keyCode === 65) { e.preventDefault();}
                });

                ele.bind('keyup', function(e){ //printScreen 키는 keyup 이벤트로 캐치할 수 있다.
                    if (opt.printScreen =='y' && e.keyCode === 44) {
                        // printScreen에 대해서는 e.preventDefault를 사용할 수 없다.
                        // printScreen 작업은 keyup 이벤트 이전에 이미 완료되기 때문.
                        if (window.clipboardData) window.clipboardData.clearData();
                        else {
                            var blockCapture = document.createElement('textarea');
                            blockCapture.textContent = "캡처 불가";

                            document.body.appendChild(blockCapture); // 이 코드를 넣어야 blockCapture의 value에 대한 execCommand copy가 수행된다.


                             /** 아래 코드는 select()로 대신할 수 있어서 주석처리한다.
                            var selection = document.getSelection();
                            var range = document.createRange();
                            range.selectNode(copyFrom);
                            selection.removeAllRanges();
                            selection.addRange(range);*/

                            blockCapture.select();

                            rootScope.allowCopy = true;
                            document.execCommand("copy");
                            document.body.removeChild(blockCapture);
                            rootScope.allowCopy = false;
                        }
                    }
                });

                if (opt.rightclick =='y') $(document).bind("contextmenu", function() { return false; });

                /**
                 * 아래 설정은 각 페이지 별도 적용을 위해 site-security-directive.js로 옮김
                 *
                if (opt.copy =='y') {
                    $(document).bind("copy", function() { return allowCopy; });
                    $(document).bind("paste", function() { return false; });
                    $(document).bind("cut", function() { return false; });
                }
                if (opt.select == 'y') $(document).bind("selectstart", function() { return false; });
                if (opt.drag == 'y') $(document).bind("dragstart", function() { return false; });*/

            }
        }
    }
})(jQuery);
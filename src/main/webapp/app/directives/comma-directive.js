angular
    .module('portalApplicationApp')
    .directive('maskPassword', maskPassword)
    .directive('comma', comma)
    .directive('decimal', decimal)
    .directive('number', number);

    maskPassword.$inject = [];
    function maskPassword (){
        return function(scope, element, attrs){
            element.on('blur keyup', function(){
                $(element).attr('type', 'password');
                if (element[0].value=='') {
                    $(element).attr('type', 'text');
                }
            });
        }
    }

    comma.$inject = [];
    function comma (){
        return function(scope, element, attrs){
            element.on('blur keyup', function(){
                element[0].value = bindComma(unComma(element[0].value), attrs.limit);
            });
        }
    }

    decimal.$inject = [];
    function decimal (){
        return function(scope, element, attrs){
            element.on('blur keyup', function(){
                if (attrs.noPoint) element[0].value = bindComma(unComma(element[0].value), attrs.limit); //여기서는 카멜기법 표기
                else {
                    if (element[0].value.indexOf('.') > -1) {
                        var values = element[0].value.split('.');
                        if (values[1] == null) {
                            element[0].value = bindComma(unComma(values[0]), attrs.limit) + '.';
                        } else {
                            element[0].value = bindComma(unComma(values[0]), attrs.limit) + '.' + unComma(values[1].slice(0, 1)) ;
                        }
                    } else {
                        element[0].value = bindComma(unComma(element[0].value), attrs.limit);
                    }
                }
            });
        }
    }

    number.$inject = [];
    function number (){
        return function(scope, element){
            element.on('blur keyup', function(){
                element[0].value = unComma(element[0].value);
            });
        }
    }

    // 콤마찍기
    function bindComma(str, limit){
        str = (limit && Number(str) > Number(limit))? limit : str ;
        return str.toString().replace(/(\d)(?=(?:\d{3})+(?!\d))/g, '$1,');
    }

    // 콤마 풀기
    function unComma(str){
        str = String(str);
        return str.replace(/[^\d]/g, '');
    }

    function mask(str) {
        return str.toString().replace(/./g, '*');
    }

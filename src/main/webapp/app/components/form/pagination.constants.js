(function() {
    'use strict';

    angular
        .module('portalApplicationApp')
        .constant('paginationConstants', {
            'itemsPerPage':10,
            'perPageOptions':[
                {val:10, display:'10개씩 보기'},
                {val:25, display:'25개씩 보기'},
                {val:50, display:'50개씩 보기'},
                {val:100, display:'100개씩 보기'}
            ]
        });
})();

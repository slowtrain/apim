(function () {
    'use strict';

    angular
        .module('portalApplicationApp')
        .factory('Auth', Auth);

    Auth.$inject = ['CommonUtil', '$rootScope', '$state', '$sessionStorage', '$q', '$translate', 'Principal', 'AuthServerProvider', 'Account', 'LoginService', 'Register', 'Activate', 'Password', 'PasswordResetInit', 'PasswordResetFinish'];

    function Auth(CommonUtil, $rootScope, $state, $sessionStorage, $q, $translate, Principal, AuthServerProvider, Account, LoginService, Register, Activate, Password, PasswordResetInit, PasswordResetFinish) {
        return {
            activateAccount: activateAccount,
            checkActivateKey: checkActivateKey,
            authorize: authorize,
            changePassword: changePassword,
            createAccount: createAccount,
            getPreviousState: getPreviousState,
            secondaryAuthenticateForLogin: secondaryAuthenticateForLogin,
            login: login,
            logout: logout,
            resetPasswordFinish: resetPasswordFinish,
            resetPasswordInit: resetPasswordInit,
            resetPreviousState: resetPreviousState,
            storePreviousState: storePreviousState,
            updateAccount: updateAccount
        };

        function activateAccount(key, callback) {
            var cb = callback || angular.noop;

            return Activate.get(key,
                function (response) {
                    return cb(response);
                },
                function (err) {
                    return cb(err);
                }.bind(this)).$promise;
        }

        function checkActivateKey(key, callback) {
            var cb = callback || angular.noop;
            return Activate.checkActivateKey(key,
                function (response) {
                    return cb(response);
                },
                function (err) {
                    return cb(err);
                }.bind(this)).$promise;
        }

        function authorize(force) {
            var authReturn = Principal.identity(force).then(authThen);

            return authReturn;

            function authThen() {
                var isAuthenticated = Principal.isAuthenticated();

                // an authenticated user can't access to login and register pages
                if (isAuthenticated && $rootScope.toState.parent === 'account' && ($rootScope.toState.name === 'login' || $rootScope.toState.name === 'register')) {
                    $state.go('home');
                }

                // recover and clear previousState after external login redirect (e.g. oauth2)
                if (isAuthenticated && !$rootScope.fromState.name && getPreviousState()) {
                    var previousState = getPreviousState();
                    resetPreviousState();
                    $state.go(previousState.name, previousState.params);
                }

                if ($rootScope.toState.data.authorities && $rootScope.toState.data.authorities.length > 0 && !Principal.hasAnyAuthority($rootScope.toState.data.authorities)) {
                    if (isAuthenticated) {
                        // user is signed in but not authorized for desired state
                        $state.go('accessdenied');
                    }
                    else {
                        $state.go('login');
                        // user is not authenticated. stow the state they wanted before you
                        // send them to the login service, so you can return them when you're done
                        storePreviousState($rootScope.toState.name, $rootScope.toStateParams);

                        // now, send them to the signin state so they can log in
                        //$state.go('accessdenied').then(function () {
                         //   LoginService.open();
                        //});
                    }
                }
                if(isAuthenticated && Principal.isDormant() && $rootScope.toState.name !='requestReset') {
                    $state.go('requestReset');
//                    var callback = function(result) {
//                        if(result) $state.go('requestReset');
//                    };
//                    CommonUtil.onError('장기간 미사용으로 휴면처리되었습니다.<br/>비밀번호초기화를 통해 재사용하실 수 있습니다.', null, 'modify', callback , '휴면 알림');
                }
                if(isAuthenticated && ($rootScope.toState.name !='change-password') && Principal.hasExpiredPassword()){
                    $state.go('change-password');
                }
            }
        }

        function changePassword(currentPassword, newPassword, callback) {
            var cb = callback || angular.noop;

            return Password.save({currentPassword: currentPassword}, newPassword, function () {
                return cb();
            }, function (err) {
                return cb(err);
            }).$promise;
        }

        function createAccount(account, callback) {
            var cb = callback || angular.noop;

            return Register.save(account,
                function () {
                    return cb(account);
                },
                function (err) {
                    this.logout();
                    return cb(err);
                }.bind(this)).$promise;
        }

        function login(credentials, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            AuthServerProvider.login(credentials)
                .then(loginThen)
                .catch(function (err) {
                    //this.logout(); 로그아웃을 통해 $broadcast까지 수행되면 홈화면으로 가게 된다.(app.module.js설정).
                    //따라서 로그인실패시에는 그냥 로그인화면에 남아있도록 logout수행을 주석처리한다.
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

            function loginThen(data) {
                Principal.identity(true).then(function (account) {
                    // After the login the language will be changed to
                    // the language selected by the user during his registration
                    if (account !== null) {
                        $translate.use(account.langKey).then(function () {
                            $translate.refresh();
                        });
                    }
                    deferred.resolve(data);
                });
                return cb();
            }

            return deferred.promise;
        }


        function logout() {
            AuthServerProvider.logout();
            Principal.authenticate(null);
            delete $rootScope.account;
            $rootScope.$broadcast('logout');
        }

        function resetPasswordFinish(keyAndPassword, callback) {
            var cb = callback || angular.noop;

            return PasswordResetFinish.save(keyAndPassword, function () {
                return cb();
            }, function (err) {
                return cb(err);
            }).$promise;
        }

        function resetPasswordInit(mail, callback) {
            var cb = callback || angular.noop;

            return PasswordResetInit.save(mail, function () {
                return cb();
            }, function (err) {
                return cb(err);
            }).$promise;
        }

        function updateAccount(account, callback) {
            var cb = callback || angular.noop;

            return Account.save(account,
                function () {
                    return cb(account);
                },
                function (err) {
                    return cb(err);
                }.bind(this)).$promise;
        }

        function getPreviousState() {
            var previousState = $sessionStorage.previousState;
            return previousState;
        }

        function resetPreviousState() {
            delete $sessionStorage.previousState;
        }

        function storePreviousState(previousStateName, previousStateParams) {
            var previousState = {"name": previousStateName, "params": previousStateParams};
            $sessionStorage.previousState = previousState;
        }

        function secondaryAuthenticateForLogin(credentials, callback) {
            var cb = callback || angular.noop;
            var deferred = $q.defer();

            AuthServerProvider.secondaryAuthenticateForLogin(credentials)
                .then(loginThen)
                .catch(function (err) {
                    //this.logout();
                    deferred.reject(err);
                    return cb(err);
                }.bind(this));

            function loginThen(data) {
                deferred.resolve(data);
                return cb();
            }

            return deferred.promise;
        }
    }
})();

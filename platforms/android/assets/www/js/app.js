(function(angular) {

  var pockeyt = angular.module('pockeyt',
      [
        // Third-party deps
        'ngAnimate',
        'ngSanitize',
        'ui.router',
        'snap',
        'LocalStorageModule',
        'infinite-scroll',
        'angularSpinner',
        'hm.readmore',
        'ct.ui.router.extras',
        'satellizer',
        'ui.utils.masks',
        'chart.js',
        'angular-inview',

        // App components
        'pockeyt.utils',
        'pockeyt.config',
        'pockeyt.services.api',
        'pockeyt.services.my-pockeyt',
        'pockeyt.services.user-service',
        'pockeyt.services.bookmark',
        'pockeyt.services.authorization',
        'pockeyt.services.notification',
        'pockeyt.services.bg-geolocate',
        'pockeyt.services.geolocation-auth',
        'pockeyt.services.user-details',
        'pockeyt.services.notify-service',
        'pockeyt.services.viewed-posts',
        'pockeyt.services.interaction-post',
        //'pockeyt.controllers.left_drawer',
        //'pockeyt.controllers.right_drawer',
        'pockeyt.controllers.login',
        'pockeyt.controllers.partner',
        'pockeyt.controllers.my-pockeyt',
        'pockeyt.controllers.connect',
        'pockeyt.controllers.explore',
        'pockeyt.controllers.referral',
        'pockeyt.controllers.events',
        'pockeyt.controllers.blogs',
        'pockeyt.controllers.bookmark',
        'pockeyt.controllers.main',
        'pockeyt.controllers.profile',
        'pockeyt.controllers.signup',
        'pockeyt.controllers.pay',
        'pockeyt.controllers.tips',
        'pockeyt.controllers.tip-rate',
        'pockeyt.controllers.menu',
        'pockeyt.controllers.bill',
        'pockeyt.controllers.recent-transactions',
        'pockeyt.controllers.recent-transaction',
        'pockeyt.controllers.location-settings',
        'pockeyt.controllers.deals',
        'pockeyt.controllers.deal',
        'pockeyt.controllers.loyalty-program',
        'pockeyt.controllers.loyalty-card',
        'pockeyt.controllers.deal-details',
        'pockeyt.directives.partner',
        'pockeyt.directives.date-picker',
        'pockeyt.directives.title-search',
        'pockeyt.directives.contact-us',
        'pockeyt.directives.favorite',
        'pockeyt.directives.business',
        'pockeyt.directives.event',
        'pockeyt.directives.blog',
        'pockeyt.directives.bookmark',
        'pockeyt.directives.password-match',
        'pockeyt.directives.focus-on',
        'pockeyt.directives.view-loaded',
        'pockeyt.directives.feed-item',
      ]
  );

  pockeyt.config(function($urlRouterProvider) {
    // Don't sync the url till we're ready
    $urlRouterProvider.deferIntercept();
  });

  pockeyt.run(function($rootScope, $state, $q, $urlRouter, $timeout, Notification, $auth, UserService, bgGeolocate) {
    Notification.init();
    function goNextState(state) {
      if (state.name === 'main.explore' || $rootScope.viewLoaded) {
        $rootScope.viewLoaded = false;
        return $state.go(state, undefined, { location: false });
      } else {
        return goNextState(state);
      }
    };

    function DelayPromise(delay) {  
      //return a function that accepts a single variable
      return function(data) {
        //this function returns a promise.
        return new Promise(function(resolve, reject) {
          setTimeout(function() {
            //a promise that is resolved after "delay" milliseconds with the data provided
            resolve(data);
          }, delay);
        });
      }
    };
    $timeout(loadStart, 850);
    // get list of all registered states
    function loadStart() {
      if (!$rootScope.notifOpenApp) {
        $rootScope.isBooting = true;
        // SpinnerPlugin.activityStart("Loading...");
        $state.get()
           // limit to those with 'state.preload'
          .filter(function(state) { return state.preload; })
          // create a promise chain that goes to the state, then goes to the next one
          .reduce(function (memo, state) {
            // dont update the location (location: false)
            return memo.then(DelayPromise(500)).then(function() {
              return goNextState(state);
            });
          }, $q.when())
          .then(function() {
            // ok, now sync the url
            $urlRouter.listen();
            // SpinnerPlugin.activityStop();
            $rootScope.isBooting = false;
            return UserService.identity()
            .then(function(identity) {
              if (($auth.isAuthenticated()) && (angular.isDefined(identity))) {
                if(identity.customer_id !== null) {
                  if (identity.default_tip_rate !== null) {
                    Notification.checkNotifPermissions();
                    bgGeolocate.initialInit();
                    return Notification.billWaiting();
                  } else {
                    return navigator.notification.alert(
                      'You have set your payment method but have not specified a default tip rate. Please set to continue.',
                      function() {
                        $state.go('main.profile.tip-select');
                      },
                      'Set Default Tip',
                      'Set Rate'
                    );
                  }
                }
              }
            });
          });
      } else {
        $urlRouter.listen();
        return UserService.identity()
        .then(function(identity) {
          if (($auth.isAuthenticated()) && (angular.isDefined(identity))) {
            bgGeolocate.initGeo();
            return Notification.billWaiting();
          }
        });
      }
    }
  });

  pockeyt.run(['$rootScope', '$state', '$stateParams', 'Authorization', 'UserService',
    function($rootScope, $state, $stateParams, Authorization, UserService) {
      FastClick.attach(document.body);
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
        $rootScope.toState = toState;
        $rootScope.toStateParams = toStateParams;
        if (UserService.isIdentityResolved()) {
          Authorization.authorize();
        }
      });
    }
  ]);

  pockeyt.config(['$stateProvider', '$stickyStateProvider', '$urlRouterProvider', '$urlMatcherFactoryProvider', '$authProvider', 'localStorageServiceProvider', 'ChartJsProvider',
    function($stateProvider, $stickyStateProvider, $urlRouterProvider, $urlMatcherFactoryProvider, $authProvider, localStorageServiceProvider, ChartJsProvider) {
      ChartJsProvider.setOptions({
        responsive: false
      });
      var UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      $urlMatcherFactoryProvider.type('uuid4', {
        encode: function(uuid) {return uuid;},
        decode: function(uuid) {return uuid;},
        is: function(item) {
          return UUID_REGEX.test(item);
        }
      });

      var stateDetailsResolver = ['$state', function($state) {
        return {
          state: $state.current,
          params: $state.params,
          previousName: $state.current.name,
          url: $state.href($state.current.name, $state.params)
        };
      }];

      $stateProvider
          .state('fullscreen', {
            templateUrl: 'templates/layouts/fullscreen.html',
            abstract: true
          })
          .state('main', {
            templateUrl: 'templates/layouts/main.html',
            controller: 'MainController',
            controllerAs: 'main',
            abstract: true,
          })
          /*
          .state('login', {
            parent: 'fullscreen',
            templateUrl: 'templates/login.html',
            controller: 'LoginController',
            controllerAs: 'login',
            url: '/login'
          })*/
          .state('main.explore', {
            parent: 'main',
            views: {
              'explore': {
                templateUrl: 'templates/explore.html',
                controller: 'ExploreController',
                controllerAs: 'explore',
              }
            },
            url: '/explore',
            sticky: true,
            dsr: true,
            preload: true,
            resolve: {
              allPartners: ['partnersRepository', function(partners) {
                return partners.all();
              }]
            }
          })
          .state('main.connect', {
            parent: 'main',
            views: {
              'connect': {
                templateUrl: 'templates/connect.html',
                controller: 'ConnectController',
                controllerAs: 'connect',
              }
            },
            url: '/connect',
            sticky: true,
            dsr: true,
            preload: true,
            resolve: {
              allPartners: ['businessesRepository', function(partners) {
                return partners.allBizs();
              }]
            }
          })
          .state('referral', {
            parent: 'main',
            templateUrl: 'templates/referral.html',
            url: '/referral',
            controller: 'ReferralController',
            controllerAs: 'referral',
          })
          .state('main.events', {
            parent: 'main',
            views: {
              'events': {
                templateUrl: 'templates/events.html',
                controller: 'EventsController',
                controllerAs: 'events',
              }
            },
            url: '/events',
            sticky: true,
            dsr: true,
            preload: true,
            resolve: {
              allPartners: ['eventsRepository', function(partners) {
                return partners.all();
              }]
            }
          })
          .state('main.menu', {
            parent: 'main',
            views: {
              'menu': {
                templateUrl: 'templates/menu.html',
                controller: 'MenuController',
                controllerAs: 'menu',
              }
            },
            url: '/menu',
            preload: false,
            resolve: {
              user: ['Authorization', function(Authorization) {
                return Authorization.authorize();
              }],
              billOpen: ['UserDetails', 'user', function(UserDetails, user) {
                if (user === 'signup' || user === 'login') { return; }
                return UserDetails.checkBillOpen();
              }]
            }
          })
          .state('main.my-pockeyt', {
            parent: 'main',
            views: {
              'my-pockeyt': {
                templateUrl: 'templates/my-pockeyt.html',
                controller: 'MyPockeytController',
                controllerAs: 'myPockeyt',
              }
            },
            url: '/my-pockeyt',
            sticky: true,
            dsr: true,
            preload: true,
            resolve: {
              allPartners: ['favoritesRepository', function(partners) {
                return partners.allFavs();
              }]
            }
          })
          .state('main.menu.bookmark', {
            parent: 'main',
            templateUrl: 'templates/bookmark.html',
            controller: 'BookmarkController',
            controllerAs: 'bookmark',
            url: '/bookmark',
            resolve: {
              allPartners: ['bookmarksRepository', function(partners) {
                return partners.allBookmarks();
              }]
            }
          })
          .state('main.menu.bill', {
            parent: 'main',
            templateUrl: 'templates/bill.html',
            controller: 'BillController',
            url: '/bill',
            resolve: {
              currentBill: ['UserDetails', function(UserDetails) {
                return UserDetails.getBill();
              }]
            }
          })
          .state('main.menu.recent-transactions', {
            parent: 'main',
            templateUrl: 'templates/recent-transactions.html',
            controller: 'RecentTransactionsController',
            url: '/recent-transactions',
            resolve: {
              recentTransactions: ['transactionsRepository', function(transactions) {
                return transactions.all();
              }]
            }
          })
          .state('main.menu.deals', {
            parent: 'main',
            templateUrl: 'templates/deals.html',
            controller: 'DealsController',
            url: '/deals',
            resolve: {
              allDeals: ['dealsRepository', function(deals) {
                return deals.all();
              }]
            }
          })
          .state('main.menu.deals.deal', {
            parent: 'main',
            templateUrl: 'templates/deal.html',
            controller: 'DealController',
            url: '/deal',
            params: {
              deal: null,
            }
          })
          .state('main.menu.recent-transactions.recent-transaction', {
            parent: 'main',
            templateUrl: 'templates/recent-transaction.html',
            controller: 'RecentTransactionController',
            url: '/recent-transaction',
            params: {
              transaction: null,
            }
          })
          .state('main.menu.loyalty-program.loyalty-card', {
            parent: 'main',
            templateUrl: 'templates/loyalty-card.html',
            controller: 'LoyaltyCardController',
            url: '/loyalty-card',
            params: {
              loyaltyCard: null
            }
          })
          .state('main.menu.loyalty-program', {
            parent: 'main',
            templateUrl: 'templates/loyalty-program.html',
            controller: 'LoyaltyProgramController',
            url: '/loyalty-program',
            resolve: {
              loyaltyCards: ['loyaltyCardsRepository', function(cards) {
                return cards.all();
              }]
            }
          })
          .state('main.menu.location-settings', {
            parent: 'main',
            templateUrl: 'templates/location-settings.html',
            controller: 'LocationSettingsController',
            url: '/location-settings',
            resolve: {
              geoSettingPhone: ['bgGeolocate', function(bgGeolocate) {
                return bgGeolocate.getGeoState();
              }],
              geoSettingApp: ['bgGeolocate', function(bgGeolocate) {
                return bgGeolocate.getAppLocationServices();
              }]
            }
          })
          .state('main.tip-custom', {
            parent: 'main',
            url: '/tip-custom',
            templateUrl: 'templates/tip-custom.html',
            controller: 'TipsController',
            params: {
              user: null,
              transaction: null,
              profile: null
            },
          })
          .state('main.menu.login', {
            parent: 'main',
            url: '/login',
            templateUrl: 'templates/login.html',
            controller: 'LoginController',
          })
          .state('main.pay', {
            parent: 'main',
            url: '/pay',
            templateUrl: 'templates/pay.html',
            controller: 'PayController',
          })
          .state('main.menu.signup', {
            parent: 'main',
            url: '/signup',
            templateUrl: 'templates/signup.html',
            controller: 'SignupController',
          })
          .state('main.menu.profile', {
            parent: 'main',
            templateUrl: 'templates/profile.html',
            controller: 'ProfileController',
            url: '/profile',
            resolve: {
              user: ['UserService', function(UserService) {
                return UserService.identity();
              }]
            }
          })
          .state('main.menu.profile.tip-select', {
            parent: 'main',
            url: '/tip-select',
            templateUrl: 'templates/tip-select.html',
            controller: 'TipRateController',
            resolve: {
              user: ['UserService', function(UserService) {
                return UserService.identity();
              }]
            }
          })
          .state('main.menu.profile.edit', {
            parent: 'main',
            url: '/edit',
            templateUrl: 'templates/edit-profile.html',
            controller: 'ProfileController',
            controllerAs: 'profile',
            resolve: {
              user: ['UserService', function(UserService) {
                return UserService.identity();
              }]
            }
          })
          .state('main.explore.partner', {
            parent: 'main',
            templateUrl: 'templates/partner-explore.html',
            controller: 'PartnerController',
            controllerAs: 'partner',
            params: {
              partner: {value: undefined}
            },
            url: '/partner/{partner}',
            resolve: {
              partner: ['$stateParams', 'partnersRepository',
                function($stateParams, partners, $state) {
                  return partners.find($stateParams.partner);
                }
              ],
              allPosts: ['businessPostsRepository', 'partner', function(businessPosts, partner) {
                return businessPosts.all(partner.business_id);
              }]
            }
          })
          .state('main.deal-details', {
            parent: 'main',
            templateUrl: 'templates/deal-details.html',
            controller: 'DealDetailsController',
            url: '/deal-details',
            params: {
              deal: null,
              prevState: null
            }
          })
          .state('main.my-pockeyt.favorite', {
            parent: 'main',
            templateUrl: 'templates/partner-my-pockeyt.html',
            controller: 'PartnerController',
            controllerAs: 'partner',
            params: {
              partner: {value: undefined}
            },
            url: '/favorite/{partner}',
            resolve: {
              partner: ['$stateParams', 'favoritesRepository',
                function($stateParams, partners, $state) {
                  return partners.find($stateParams.partner);
                }
              ],
              allPosts: ['businessPostsRepository', 'partner', function(businessPosts, partner) {
                return businessPosts.all(partner.business_id);
              }]
            }
          })
          .state('main.connect.business', {
            parent: 'main',
            templateUrl: 'templates/partner-find.html',
            controller: 'PartnerController',
            controllerAs: 'partner',
            params: {
              partner: {value: undefined}
            },
            url: '/business/{partner}',
            resolve: {
              partner: ['$stateParams', 'businessesRepository',
                function($stateParams, partners, $state) {
                  return partners.find($stateParams.partner);
                }
              ],
              allPosts: ['businessPostsRepository', 'partner', function(businessPosts, partner) {
                return businessPosts.all(partner.business_id);
              }]
            }
          })
          .state('main.menu.bookmark.saved', {
            parent: 'main',
            templateUrl: 'templates/partner-bookmark.html',
            controller: 'PartnerController',
            controllerAs: 'partner',
            params: {
              partner: {value: undefined}
            },
            url: '/saved/{partner}',
            resolve: {
              partner: ['$stateParams', 'bookmarksRepository',
                function($stateParams, partners, $state) {
                  return partners.find($stateParams.partner);
                }
              ],
              allPosts: ['businessPostsRepository', 'partner', function(businessPosts, partner) {
                return businessPosts.all(partner.business_id);
              }]
            },
          })
          /*
          .state('my-profile', {
            parent: 'main',
            templateUrl: 'templates/my-profile.html',
            url: '/my-profile'
          })
          .state('payment', {
            parent: 'main',
            templateUrl: 'templates/payment.html',
            url: '/payement'
          })*/
          .state('settings', {
            parent: 'main',
            templateUrl: 'templates/settings.html',
            url: '/settings'
          });

      $urlRouterProvider.otherwise('/my-pockeyt');

      $authProvider.loginUrl = 'https://pockeytbiz.com/api/authenticate';
      $authProvider.signupUrl = 'https://pockeytbiz.com/api/register';

      localStorageServiceProvider
          .setPrefix('pockeyt')
          .setStorageType('localStorage')
          .setStorageCookie(0, '/')
          .setStorageCookieDomain('')
          .setNotify(true, true);
    }
  ]);

})(angular);
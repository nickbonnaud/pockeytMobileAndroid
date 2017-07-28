(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.events', ['pockeyt.models.partner', 'pockeyt.services.whitelabel', 'pockeyt.services.api', 'pockeyt.services.my-pockeyt']);

  module.factory('eventsRepository', ['$q', '$rootScope', 'Partner', 'whitelabel', 'PockeytApi', 'MyPockeyt', function($q, $rootScope, Partner, whitelabel, api, MyPockeyt) {

    var repository = {
      _stale: true,
      _cache: [],
      _unlocked: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      empty: false,
      selectedDate: 'today',

      getSelectedDate: function() {
        return this.selectedDate;
      },

      doEvents: function(selectedDate) {
        this.selectedDate = selectedDate;
        if (!angular.isDefined(selectedDate)) {
          this.selectedDate = "today";
        }
        this._cache = [];
        this.page = 1;
        return this.loadSelectedDate(this.selectedDate);
      },

      _transformPost: function(post) {
        return {
          id: post.id,
          business_id: post.profile_id,
          business_name: post.business_name,
          title: post.title,
          body: post.body,
          post_photo: post.photo_url,
          date: moment.utc(post.published_at.date).local().toDate(),
          event_date: post.event_date,
          is_redeemable: post.is_redeemable,
          logo: post.logo ? post.logo : '',
        };
      },

      _findInCache: function(id) {
        for(var i = 0; i < this._cache.length; i++) {
          if(this._cache[i].id == id) {
            return this.fix(this._cache[i]);
          }
        }

        return null;
      },

      find: function(id, rejectOnNotFound, ignoreStaleness) {
        var doFind = function(resolve, reject) {
          var partner = this._findInCache(id);
          if(partner == null) {
            if(typeof rejectOnNotFound === 'undefined' || !!rejectOnNotFound)
              reject(new Error('Could not find in cache and no remote available.'));
            else
              resolve(null);
          } else {
            resolve(partner)
          }
        }.bind(this);

        if(this._stale && (typeof ignoreStaleness === 'undefined' || !ignoreStaleness)) {
          return this.loadSelectedDate().then(function() {
            return $q(doFind);
          });
        } else {
          return $q(doFind);
        }
      },

      loadSelectedDate: function(selectedDate) {
        if (!this.isLoading) {
          this.isLoading = true;
          var page = this.page;

          return api.request('/v2/events?calendar=' + selectedDate + '&page=' + page).then(function(response) {
            if (response.data.data.length === 0) {
              this.empty = true;
            } else {
              this.empty = false;
            }
            if (!response.data.meta.pagination.links.next) {
              this.hasMore = false;
            } else {
              this.hasMore = true;
            } 
            var promises = response.data.data
                .map(this._transformPost.bind(this))
                .map(function(partnerData) {
                  return this.find(partnerData.id, false, true).then(function(partner) {
                    return $q.resolve({data: partnerData, partner: partner});
                  });
                }.bind(this));
            return $q.all(promises)
                .then(function(descriptors) {
                  angular.forEach(descriptors, function(descriptor) {
                    if(descriptor.partner == null) {
                      this._cache.push(new Partner(descriptor.data));
                    } else {
                      descriptor.partner.fill(descriptor.data);
                    }
                  }.bind(this));
                  this._stale = false;
                  this.isLoading = false;
                  return this._cache;
                }.bind(this));
          }.bind(this));
        }
      },

      loadMore: function() {
        if (!repository.isLoading) {
          this.page += 1;
          this.loadSelectedDate(this.selectedDate);
        }
      },

      all: function() {
        this._cache = [];
        this.page = 1;
        this.hasMore = true;
        return this.loadSelectedDate(this.selectedDate);
      },

      allCached: function() {
        return this._cache;
      },
    };
    return repository;

  }]);

})(angular, moment);
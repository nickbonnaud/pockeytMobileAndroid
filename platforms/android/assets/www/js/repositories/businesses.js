(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.businesses', ['pockeyt.models.partner', 'pockeyt.services.api']);

  module.factory('businessesRepository', ['$q', 'Partner', 'PockeytApi', function($q, Partner, api) {

    var repository = {
      _stale: true,
      _cache: [],
      _unlocked: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      search: null,
      noResults: false,

      doSearch: function (search) {
        this.hasMore = true;
        this.page = 1;
        this._cache = [];
        this.search = search.input;
        this.loadSearch(search);
      },

      _transformProfile: function(profile) {
        return {
          business_id: profile.profile_id,
          business_name: profile.business_name,
          url: profile.website,
          logo: profile.logo ? profile.logo : '',
          hero: profile.hero ? profile.hero : '',
          tags: profile.tags,
          info: profile.formatted_description,
        };
      },

      _findInCache: function(id) {
        for(var i = 0; i < this._cache.length; i++) {
          if(this._cache[i].business_id == id) {
            return this._cache[i];
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
          return this.loadBizs().then(function() {
            return $q(doFind);
          });
        } else {
          return $q(doFind);
        }
      },

      loadBizs: function() {
        if (this.hasMore && !this.isLoading) {
          this.isLoading = true;
          var page = this.page;

          return api.request('/v2/profiles?page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              this.hasMore = false;
             }
            var promises = response.data.data
                .map(this._transformProfile.bind(this))
                .map(function(partnerData) {
                  return this.find(partnerData.business_id, false, true).then(function(partner) {
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

      loadMoreBizs: function() {
        if (repository.hasMore && !repository.isLoading) {
          this.page += 1;
          if(this.search === null || this.search === "") {
            this.loadBizs();
          } else {
            return this.loadSearch(this.search);
          }
        }
      },

      loadSearch: function(search) {
        this.noResults = false;
        this.search = search;
        if (search === "") {
          search = null;
          return this.loadBizs();
        }

        if (this.hasMore && !this.isLoading) {
          this.isLoading = true;
          var page = this.page;
          return api.request('/v2/search?input=' + search + '&page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              this.hasMore = false;
              this.search = null;
             }
             if (!response.data.meta.pagination.count) {
              this.noResults = true;
             }
            var promises = response.data.data
                .map(this._transformProfile.bind(this))
                .map(function(partnerData) {
                  return this.find(partnerData.business_id, false, true).then(function(partner) {
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
                  this.isLoading = false;
                  return this._cache;
                }.bind(this));
          }.bind(this));
        }
      },

      allBizs: function() {
        this._cache = [];
        this.page = 1;
        this.hasMore = true;
        return this.loadBizs();
      },

      allCached: function() {
        return this._cache;
      },
    };

    return repository;

  }]);

})(angular, moment);
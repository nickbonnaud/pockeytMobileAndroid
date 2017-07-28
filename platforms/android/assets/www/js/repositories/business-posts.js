(function(angular, moment) {

  var module = angular.module('pockeyt.repositories.business-posts', ['pockeyt.models.partner', 'pockeyt.services.api']);

  module.factory('businessPostsRepository', ['$q', 'Partner', 'PockeytApi', function($q, Partner, api) {

    var repository = {
      _stale: true,
      _cache: [],
      page: 1,
      hasMore: true,
      isLoading: false,
      empty: false,

      _transformPost: function(post) {
        if (post.is_redeemable) {
          return {
            id: post.id,
            business_id: post.profile_id,
            business_name: post.business_name,
            message: post.message,
            post_photo: post.photo_url,
            date: moment.utc(post.published_at.date).local().toDate(),
            is_redeemable: post.is_redeemable,
            deal_item: post.deal_item,
            price: post.price,
            end_date: moment.utc(post.end_date.date).local().toDate(),
            logo: post.logo ? post.logo : '',
          };
        } else if (post.event_date && post.event_date != '0000-00-00') {
          return {
            id: post.id,
            business_id: post.profile_id,
            business_name: post.business_name,
            message: post.message,
            post_photo: post.photo_url,
            date: moment.utc(post.published_at.date).local().toDate(),
            event_date: post.event_date,
            is_redeemable: post.is_redeemable,
            logo: post.logo ? post.logo : '',
          };
        } else {
          return {
            id: post.id,
            business_id: post.profile_id,
            business_name: post.business_name,
            message: post.message,
            post_photo: post.photo_url,
            date: moment.utc(post.published_at.date).local().toDate(),
            is_redeemable: post.is_redeemable,
            logo: post.logo ? post.logo : '',
          };
        }
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
          return this.reload(partner).then(function() {
            return $q(doFind);
          });
        } else {
          return $q(doFind);
        }
      },

      reload: function(partner) {
        if (this.hasMore && !this.isLoading) {
          this.isLoading = true;
          this.empty = false;
          var page = this.page;

          return api.request('/v2/business/posts?profile=' + partner + '&page=' + page).then(function(response) {
            if (!response.data.meta.pagination.links.next) {
              if (response.data.data.length === 0 && this.page === 1) { this.empty = true; }
              this.hasMore = false;
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

      loadMore: function(partner) {
        if (repository.hasMore && !repository.isLoading) {
          this.page += 1;
          this.reload(partner);
        }
      },

      all: function(partner) {
        this._cache = [];
        this.page = 1;
        this.hasMore = true;
        return this.reload(partner);
      },

      allCached: function() {
        return this._cache;
      }
    };

    return repository;

  }]);

})(angular, moment);
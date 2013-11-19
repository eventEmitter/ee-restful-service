(function(){


	var   Class 		= require('ee-class')
		, EventEmitter 	= require('ee-event-emitter')
		, LRUCache		= require('ee-lru-cache')
		, type 			= require('ee-types')
		, log 			= require('ee-log');



	module.exports = new Class( {
		inherits: Events


		// valid request methods
		, _validMethods: {POST: true, GET: true, HEAD: true, PUT: true, DELETE:true, PATCH:true, OPTIONS:true}

		// url hashes. hashes supoport URLs by the follwoing pattern
		// /collection/:id/collection/:id, an URL /User/4/Comment/5
		// will be hashed as /user/-/comment/-
		, _hashes: {}


		/**
		 * RESTService constructor function
		 *
		 * @param <Object> options
		 */
		, init: function(options){

			// cache for url hashes, ther is no need to recalculate them every time
			this._hashCache = new LRUCache({
				  limit: 	10000
				, ttl: 		3600000
			});
		}


		/**
		 * the addCollection() method adds a collection handler instance
		 * to the service. it returns itself.
		 *
		 * @param <String> the url pattern where this controller can be reached
		 * @param <Object> controller instance which handles the requests
		 */
		, addCollection: function(url, controller){
			var hash = this._createHash(url);
			this._hashes[hash] = controller;
		}


		/**
		 * the addResource() method adds a resource handler instance
		 * to the service. it returns itself.
		 *
		 * @param <String> the url pattern where this controller can be reached
		 * @param <Object> controller instance which handles the requests
		 */
		, addResource: function(url, controller){
			var hash = this._createHash(url);
			this._hashes[hash] = controller;
		}



		/**
		 * the request() method handles incoming requests
		 *
		 * @param <Object> request object
		 * @param <Object> response object
		 * @param <Function> next callback
		 */
		, request: function(request, response, next){
			var hash;

			if (this._hashCache.has(request.pathname)){
				// the url is cached
				hash = this._hashCache.get(request.pathname);
			}
			else {
				// calculate hash for url
				hash = this._createHash(request.pathname);
			}

			// add to cache
			this._hashCache.set(request.pathname, hash);


			// check for controller
			if (this._hashes[hash]){
				// there is a controlelr registered for this hash
				if (type.boolean(this._validMethods[request.method])){
					// the method is valid
					if(type.function( this._hashes[hash][request.method])){
						// themethod is supported by the controller
						this._hashes[hash][request.method](request, response, next);
					}
					else {
						// method not supported
						response.send(405);
					}
				}
				else {
					// invalid request method
					response.send(405);
				}
			}
			else {
				// we could  not find anything, next
				next();
			}
		}



		/**
		 * the _createHash() method handles calculates the hash of any
		 * url supported by the restful services by the ee framework
		 * this is /collection/:id/subollection/:id/subsubcollection/:id
		 *
		 * @param <String> URL to create the hash from
		 */
		, _createHash: function(url) {
			return url.replace(/\/([^\/]+)\/[^\/]+/gi, '/$1/-').toLowerCase();
		}
	} );
})();
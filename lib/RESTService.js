(function(){


	var   Class 			= require('ee-class')
		, EventEmitter 		= require('ee-event-emitter')
		, LRUCache			= require('ee-lru-cache')
		, type 				= require('ee-types')
		, log 				= require('ee-log');


	var   JSONRenderer 		= require('./renderer/Json')
		, HTMLRenderer 		= require('./renderer/Html')
		, ResponseHandler	= require('./ResponseHandler')
		, RendererManager 	= require('./RendererManager');



	module.exports = new Class( {
		inherits: EventEmitter


		// valid request methods
		, _validMethods: {post: true, get: true, head: true, put: true, delete:true, patch:true, options:true}

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


			// render manager for contenttype negotiation
			this._renderers = new RendererManager();

			// default renderes
			this.addRenderer('application/json', new JSONRenderer());
			this.addRenderer('text/html', new HTMLRenderer());
		}


		/**
		 * the use() method adds a controller instance
		 * to the service.
		 *
		 * @param <String> the url pattern where this controller can be reached
		 * @param <Object> controller instance which handles the requests
		 */
		, use: function(url, controller){
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
			var   method = request.method.toLowerCase()
				, path = request.pathname.toLowerCase()
				, hash = this._hashCache.get(path) || this._createHash(path)
				, controller;


			// add to lru cache
			this._hashCache.set(path, hash);

			// get controller reference
			controller = this._hashes[hash];
			
			// valid controller?
			if (controller){

				// valid supported method?
				if (this._validMethods[method] && type.function(controller[method])){

					// set mapping property on the request
					this._buildMappingTree(path, controller, request);

					// response handler -> content type negotiation etc..
					new ResponseHandler({
						  request: 		request
						, response: 	response
						, renderers: 	this._renderers
					});

					// execute method handler
					controller[method](request, response, next);
				}
				else response.send(405);
			}
			else next();
		}



		/**
		 * the addRenderer() adds a renderer for a specfific content type
		 *
		 * @param <String> contentType
		 * @param <Object> renderer
		 */
		, addRenderer: function(contentType, renderer) {
			this._renderers.add(contentType, renderer);
		}



		/**
		 * the _buildMappingTree() method extracts the mapping info from 
		 * the pathname
		 *
		 * @param <String> pathname
		 * @param <Object> controller
		 * @param <Object> request
		 */
		, _buildMappingTree: function(path, controller, request){
			var   reg = /\/([^\/]+)\/([^\/]+)|\/([^\/]+)$/gi
				, list = []
				, tree = {}
				, ref = tree
				, item
				, result;

			// extract request resource data
			while(result = reg.exec(path)){
				list.push({
					  collection: (result[3] || result[1]).toLowerCase()
					, resource: result[2] ? this._parseId(result[2]) : undefined
				});
			}

			// remove last item ( current controller ), reverse
			item = list.reverse().shift();

			// build tree
			list.forEach(function(item){
				ref.mapping = item;
				ref = ref.mapping;
			}.bind(this));

			if (list.length > 0) request.mapping = tree;
			if (item.resource) request.resource = item.resource;
		}

			/**
		 * the _parseId() method converts strings to numbers or booleans
		 *
		 * @param <String> id
		 */
		, _parseId: function(id){
			if (!/[^0-9]/.test(id.trim())) return parseInt(id, 10);
			else if (!/[^0-9\.]/.test(id.trim())) return parseFloat(id);
			else if (/^(?:true|false)$/i.test(id.trim())) return id.trim().toLowerCase() === "true" ? true : false;
			else return id;
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
# em-rest-service

RESTful Service Middleware for ee-webservice


## installation

	npm install em-rest-service


## build status

[![Build Status](https://travis-ci.org/eventEmitter/em-restful-service.png?branch=master)](https://travis-ci.org/eventEmitter/em-restful-service)

## usage

You need to create controllers for each collection and each resource you plan to make available via the service.
a collection is a collection of resources ( «/user» ), a resource is a single resource of a collection ( «/user/3» ).

URLs must be formatted as «collection/id» pairs so that they can parsed by the service

**bad**
- user/comment
- user
- user/4/comment/images

 **good**
- /user/4/comment
- /user
- /user/4/comment/6/image

 See the [joinbox RESTFul Style Guide](https://github.com/joinbox/guidelines/blob/master/styleguide/RESTful.md) for more information.



### controller
	
	var   Class 		= require('ee-class');

	module.exports = new Class({

		// handles the get request on the collection
		get: function(request, response, next) {
			log( request.resource ) // the id of the resource
			log( request.mapping ) // a tree of colelctions which
								   // describe the mapping this resource resides on

			if (request.mapping){
				// the url called was /user/:id/comment/:id 
				// this could be another mapping if there are multiple mappings
				// for the comments collection / resource
				response.render( 200, [] );
			}
			else {
				// the resource was called on the root /comment/:id
				response.render( 200, [] );
			}

			// if this were a resource controller there would be a «resource»
			// property on the request. it would conatin the id / unique key
			// of the requested resource. log(request.resource) // 32432
		}
	});


### service


	var   RESTService 		= require('em-rest-service')
		, Class 			= require('ee-class')
		, CommentCollection = require('CollectionController');


	module.exports = new Class({
		inherits: RESTService


		, init: function init() {
			init.parent();

			var commentsCollectionController = new CommentCollection();

			this.use('/user/:id/comment', commentsCollectionController);
			this.use('/comment', commentsCollectionController);
		}
	});

	

### test.js / application

	var   MyService		= require('MyService')
		, WebService 	= require('ee-webservice');

	// start the webservice
	var service = new WebService({
		port: 80
	});

	// create an instance of my service implementation
	var myService = new MyService();

	// add myservice middleware to the webservice
	service.use(myService);

	service.listen();



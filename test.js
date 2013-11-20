


	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, assert 		= require( "assert" );


	var expected = '[{"url":"/user"},{"url":"/user/78954","id":78954},{"url":"/user/michael@joinbox.com","id":"michael@joinbox.com"},{"url":"/user/78954/comment","mapping":{"mapping":{"collection":"user","resource":78954}}},{"url":"/user/78954/comment/324","mapping":{"mapping":{"collection":"user","resource":78954}},"id":324}]'
		, actual = [];


	var RESTService		= require( "./" );

	var Controller = new Class({
		get: function(request, response, next){
			//log('call on «'+request.pathname+'»');
			//log(request.mapping);
			actual.push( {url:request.pathname, mapping: request.mapping, id: request.resource});
		}
	});


	var Service = new Class({
		inherits: RESTService

		, init: function init(options) {
			init.parent(options);

			this.use('/user', new Controller());
			this.use('/user/:id', new Controller(true));
			this.use('/user/:id/comment', new Controller());
			this.use('/user/:id/comment/:id', new Controller(true));
		}
	});


	var service = new Service();

	service.request({pathname:'/user', method: 'GET'}, {send:function(){ log(arguments); }}, function(){ log('next'); });
	service.request({pathname:'/user/78954', method: 'GET'}, {send:function(){ log(arguments); }}, function(){ log('next'); });
	service.request({pathname:'/user/michael@joinbox.com', method: 'GET'}, {send:function(){ log(arguments); }}, function(){ log('next'); });
	service.request({pathname:'/user/78954/comment', method: 'GET'}, {send:function(){ log(arguments); }}, function(){ log('next'); });
	service.request({pathname:'/user/78954/comment/324', method: 'GET'}, {send:function(){ log(arguments); }}, function(){ log('next'); });

	assert.deepEqual(expected, JSON.stringify(actual), 'expected & actual values differ!');
	//log(JSON.stringify(actual));
	process.exit();
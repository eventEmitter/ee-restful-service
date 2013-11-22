


	var   Class 		= require( "ee-class" )
		, log 			= require( "ee-log" )
		, crypto 		= require( "crypto" )
		, assert 		= require( "assert" );


	var expected = '["7d8bbc3f606c593a05d8855cadbb40d452881d71","9e9635694dc8e11e39ae417040bd2223bf88add6","78e43b4dac1defddca8ef196e096fc3a2f6aca6f","0687c487b569ec62dd897f87b846575243db8789","522ffc25086961ec5d4da16ad06f3b27e2600d05"]'
		, actual = [];


	var RESTService		= require( "./" );

	var Controller = new Class({
		get: function(request, response, next){
			response.render({url:request.pathname, mapping: request.mapping, id: request.resource}, 200, {'API-Version': '0.1.0'} );
		}
	});


	var Request = new Class({
		init: function(options){
			this.pathname = options.pathname;
			this.method = options.method;
			this.accept = options.accept;
		}

		, getHeader: function(){
			return this.accept;
		}
	});


	var Response =  new Class({
		setHeader: function(){
		}

		, send: function(){
			actual.push(crypto.createHash('sha1').update(JSON.stringify(Array.prototype.slice.call(arguments))).digest('HEX'));
		}
	});


	var Service = new Class({
		inherits: RESTService

		, init: function init(options) {
			init.parent(options);

			this.use('/user', new Controller());
			this.use('/user/:id', new Controller());
			this.use('/user/:id/comment', new Controller());
			this.use('/user/:id/comment/:id', new Controller());
		}
	});


	var service = new Service();

	service.request(new Request({pathname:'/user', method: 'GET', accept: 'Application/JSON'}), new Response(), function(){ log('next'); });
	service.request(new Request({pathname:'/user/78954', method: 'GET', accept: 'Application/JSON'}), new Response(), function(){ log('next'); });
	service.request(new Request({pathname:'/user/michael@joinbox.com', method: 'GET', accept: 'Application/JSON'}), new Response(), function(){ log('next'); });
	service.request(new Request({pathname:'/user/78954/comment', method: 'GET', accept: 'Application/JSON'}), new Response(), function(){ log('next'); });
	service.request(new Request({pathname:'/user/78954/comment/324', method: 'GET', accept: 'Application/JSON'}), new Response(), function(){ log('next'); });


	assert.deepEqual(expected, JSON.stringify(actual), 'expected & actual values differ!');
	//log(JSON.stringify(actual));
	process.exit();
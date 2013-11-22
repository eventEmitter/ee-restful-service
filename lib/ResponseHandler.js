(function(){


	var   Class 		= require('ee-class')
		, log 			= require('ee-log')
		, arg 			= require('ee-arguments');



	module.exports = new Class({


		init: function(options){
			this._request 		= options.request;
			this._response 		= options.response;
			this._renderers 	= options.renderers;

			// map the render method to the response object
			this._response.render = this.render.bind(this);
		}




		, render: function(){
			var renderer 	= this._renderers.get(this._request)
				, status 	= arg(arguments, 'number' )
				, data 		= arg(arguments, 'array', arg(arguments, 'object'))
				, headers 	= arg(arguments, 'object', arg(arguments, 'object'), 1);

			// the header object must be the second object of the call
			if(headers===data) headers = null;

			if (renderer) {
				// render contents
				renderer.render(data, this._request, this._response, function(err, content){
					if(err) this._response.send(500);
					else this._response.send(status, content, headers);
				}.bind(this));				
			}
			else this._response.send(406);
		}
	});

})();
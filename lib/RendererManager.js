(function(){


	var   Class 		= require('ee-class')
		, log 			= require('ee-log');



	module.exports = new Class({

		// collection of renderers
		  _renderers: {}


		// regexp used for negotiation
		, _negotiationRegExp: null


		/**
		 * the addRenderer() adds a renderer for a specfific content type
		 *
		 * @param <String> contentType
		 * @param <Object> renderer
		 */
		, add: function(contentType, renderer){
			var cType = contentType.toLowerCase().trim();

			// warn about renderes that get replaced
			if (this._renderers[cType]) log.warn('Em-rest-service: overwriting the existing «'+cType+'» renderer!');

			// store renderer
			this._renderers[cType] = renderer;

			// matchi regexp
			this._negotiationRegExp = new RegExp('('+Object.keys(this._renderers).join('|')+')', 'gi');
		}


		/**
		 * the get() method returns a renderer or null if the not acceptable 
		 *
		 * @param <Object> request
		 */
		, get: function(request){
			var cType;

			// reset regexp
			this._negotiationRegExp.lastIndex = 0;

			// extract ctype
			cType = (this._negotiationRegExp.exec(request.getHeader('accept') || '') || ['',''] )[1].toLowerCase();

			// return ctype rendere iv available
			return cType && this._renderers[cType] ? this._renderers[cType] : null;
		}


	});
})();
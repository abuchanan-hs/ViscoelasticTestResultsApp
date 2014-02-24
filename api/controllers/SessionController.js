/**
 * SessionController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

function session_redirect_error(req, res, error) {
	req.session.flash = { err: error };
	res.redirect('/session/new');
};

var bcrypt = require('bcrypt');

module.exports = {
    
	'new' : function(req, res) {
		res.view('session/new');
	},
	
	'create' : function(req, res, next) {
		// Check for email and password in params sent via the form, if none
		//	redirect the browser back to the sign-in form.
		if( !req.param('email') || !req.param('password') ) {
			var usernamePasswordRequiredError = [{name: 'usernamePasswordRequired', message: 'You must enter both a username and password.'}];
			
			// Remember that err is the object being passed down (a.k.a. flash.err), whose value is another object
			//	with the key of usernamePasswordRequiredError
			session_redirect_error(req, res, usernamePasswordRequiredError);
			return;
		}
		
		// Try to find the user by their email address
		User.findOneByEmail(req.param('email')).done(function(err, user) {
			if (err) return next(err);
			
			// If no user is found...
			if (!user) {
				var noAccountError = [{name: 'noAccount', message: 'The email address "' + req.param('email') +'" was not found.'}];
				session_redirect_error(req, res, noAccountError);
				return;
			}
			
			// Compare password from the form params to the encrypted password of the user found.
			bcrypt.compare(req.param('password'), user.encryptedPassword, function(err, valid) {
				if (err) return next(err);
				
				// If the password from the form doesn't match the password from the database...
				if (!valid) {
					var usernamePasswordMismatchError = [{name: 'usernamePasswordMismatch', message: 'Invalid username and password combination.'}];
					session_redirect_error(req, res, usernamePasswordMismatchError);
					return;
				}
				
				// Log user in
				req.session.authenticated = true;
				req.session.User = user;
				
				// Redirect to their profile page (.e.g /views/user/show.ejs)
				res.redirect('/user/show/' + user.id);
			});
		});
	},
	
	'destroy' : function(req, res, next) {
		// wipe out the session (log out)
		req.session.destroy();
		// redirect the browser to the sign-in screen
		res.redirect('/session/new');
	},


  /**
   * Overrides for the settings in `config/controllers.js`
   * (specific to SessionController)
   */
  _config: {}

  
};

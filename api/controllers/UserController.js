/**
 * UserController
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


module.exports = {

	'new': function(req, res) {
		res.view();
	},

	create: function(req, res, next) {
		// marshall the form data to prevent html injection
		var userObj = {
			name: req.param('name'),
			email: req.param('email'),
			password: req.param('password'),
			confirmation: req.param('confirmation')
		};
		
		// Create a User with the params sent from the sign-up form --> new.ejs
		User.create(userObj, function userCreated(err, user) {

			// If there's an error
			if (err) {
				console.log(require('util').inspect(err, true, 10));
				//console.log(err);
				req.session.flash = {
					err: err
				};
				
				// redirect back to sign-up page
				return res.redirect('/user/new');
				//return next(err);
			}

			// After successfully creating the new user 
			// Log the user in
			req.session.authenticated = true;
			req.session.User = user;

			// redirect to the show action
			res.redirect('/user/show/'+user.id);
		});
	},
	
	// render the profile view (e.g. /views/show.ejs)
	show: function(req, res, next) {
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next();
			res.view({ user: user });
		});
	},

	index: function(req, res, next) {
		// Get an array of all users in the User collection
		User.find(function foundUsers(err, users) {
			if (err) return next(err);
			// pass the array down to the /views/index.ejs page
			res.view({users: users});
		});
	},

	// render the edit view (e.g. /views/edit.ejs)
	edit: function(req, res, next) {
		// Find the user from the id passed in via params
		User.findOne(req.param('id'), function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next('User doesn\'t exist.');
			res.view( { user: user } );
		});
	},
	
	// process the info from the edit view
	update: function(req, res, next) {
		// marshall the data coming from req.params.all or else	its possible for html
		// injection in the browser to change	user proprites even if they aren't admin.
		var userObj = {
			name: req.param('name'),
			email: req.param('email'),
			admin: false
		};
		// admin can only be changed by admin users
		if(req.session.User.admin) {
			userObj.admin = req.param('admin');
		}
		var uid = req.param('id');
		User.update(uid, userObj, function userUpdate(err) {
			if (err) {
				return res.redirect('/user/edit/' + uid);
			}
			res.redirect('/user/show/' + uid);
		});
	},

	destroy: function(req, res, next) {
		// Find the user from the id passed in via params
		var uid = req.param('id');
		User.findOne(uid, function foundUser(err, user) {
			if (err) return next(err);
			if (!user) return next('User doesn\'t exist.');

			User.destroy(uid, function userDestroy(err) {
				if (err) return next(err);
			});
			
			res.redirect('/user');
		});
	},
	
	/**
	 * Overrides for the settings in `config/controllers.js`
	 * (specific to UserController)
	 */
	_config: {}


};

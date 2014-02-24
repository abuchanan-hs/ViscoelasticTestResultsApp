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
		// Create a User with the params sent from the sign-up form --> new.ejs
		User.create(req.params.all(), function userCreated(err, user) {

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

			// After successfully creating the new user redirect to the show action
			//res.json(user);
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
		var uid = req.param('id');
		User.update(uid, req.params.all(), function userUpdate(err) {
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

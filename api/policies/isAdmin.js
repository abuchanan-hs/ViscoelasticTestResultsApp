/**
 * isAdmin
 * @module      :: Policy
 * @description :: Simple policy to allow an admin user (who must also be authenticated)
 * @docs        :: http://sailsjs.org/#!documentation/policies
 */
module.exports = function(req, res, next) {

  // User is allowed, proceed to the next policy, 
  // or if this is the last policy, the controller
  if (req.session.User && req.session.User.admin) {
    return next();
  }

  // User is not allowed
	var requireAdminError = [{name: 'requireAdminError', message: 'You must be an administrator.'}];
	req.session.flash = { err: requireAdminError };
	res.redirect('/session/new');
};

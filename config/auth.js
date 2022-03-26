module.exports = {
    ensureAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      req.flash('error_msg', 'Login required');
      res.redirect('/signin');
    },
    ensureAdmin: function(req, res, next) {
      if (req.user.isAdmin) {
        return next();
      }
      res.redirect('/');
    },
    forwardAuthenticated: function(req, res, next) {
      if (req.isAuthenticated()) {
        return next();
      }
      res.redirect('/');      
    }
  };
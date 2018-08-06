const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models").User;
const UserSession = require('../models').UserSession;
const Sequelize = require('../models').Sequelize;
const Op = Sequelize.Op;

module.exports = function(passport) {
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = CONFIG.jwt_encryption;
  opts.passReqToCallback = true;

  passport.use(
    new JwtStrategy(opts, async function(req, jwt_payload, done) {
      let err, user, session, userWithSession;
      let user_id = jwt_payload.user_id;
      const token = req.headers["authorization"];
      //only valid user payload if the user has a non-expired session
      //for this specific token
      [err, userWithSession] = await to(
        Promise.all([
          User.findById(user_id),
          UserSession.findOne({
            where: {
              user_id: user_id,
              token: token,
              expiry_timestamp: {
                [Op.gt]: new Date()
              }
            }
          })
        ])
      );
      if (err) return done(err, false);
      [user, session] = userWithSession;

      if (user && session) {
        //session still valid, increase duration
        session.touch();
        //return user after refreshed session
        user.session = session.toJSON();
        return done(null, user);
      } else {
        return done(null, false);
      }
    })
  );
};

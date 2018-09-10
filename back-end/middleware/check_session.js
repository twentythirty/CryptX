const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../models").User;
const UserSession = require('../models').UserSession;
const Sequelize = require('../models').Sequelize;
const Op = Sequelize.Op;
const logger = require('../utils/ActionLogUtil');

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
        await session.touch();
        //return user after refreshed session
        user.session = session.toJSON();
        return done(null, user);
      } else {
        const message = `No valid user or session for token ${token} and user id ${user_id} accessing path ${req.path}`;
        //this is an async promise, let is save in the background
        //no relations to add since user or session might not have been found
        logger.log(message, {
          log_level: ACTIONLOG_LEVELS.Warning
        })
        return done(null, false, { message });
      }
    })
  );
};

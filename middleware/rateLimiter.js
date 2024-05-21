const rateLimit = require("express-rate-limit");

const rateLimiter = rateLimit({
	windowMs: 24 * 60 * 60 * 100,
	max: 100,
	message: "Over 100 calls in 24 hours. Please try again later.",
	standardHeaders: true,
	legacyHeaders: false

})

module.exports = {
	rateLimiter
};

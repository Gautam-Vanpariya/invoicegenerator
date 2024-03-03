const router = require('express').Router();

const db = require("../../models/index");
const path = require("path");
const fs = require('fs');

const DISCOUNTMODEL = db.mailDiscount;

class CustomError extends Error {
	constructor(statusCode, message) {
		super();
		this.statusCode = statusCode;
		this.message = message;
	}
}

// ========================================== [SINGLE PAGE REQUEST] ================================= //
router.get('/header_logo', async (req, res, next) => {

	if (req.query.mid) {
		let updateData = {
			"history.$.is_opened": true,
			"history.$.first_open_date": new Date()
		};

		let updateData1 = {
			"history.$.last_open_date": new Date()
		};
		let updateResponse = await DISCOUNTMODEL.updateMany({ history: { $elemMatch: { "unique_id": req.query.mid, "is_opened": false } } }, { "$set": updateData }).lean();
		console.log(updateResponse);
		updateResponse = await DISCOUNTMODEL.updateMany({ "history.unique_id": req.query.mid }, { "$set": updateData1, $inc: { "history.$.view_count": 1 } }).lean();
		console.log(updateResponse);
	}
	const whiteLogoPath = path.join(__dirname, `../../public/image/footer/footer_logo.png`);

	if (!fs.existsSync(whiteLogoPath)) {
		const notFoundError = new CustomError(404, 'Not found');
		return next(notFoundError);
	}

	res.download(whiteLogoPath, `OnlineBill.png`, (err) => {
		if (err) {
			const downloadError = new CustomError(500, 'Unable to serve logo');
			return next(downloadError);
		}
	});
});


module.exports = router;
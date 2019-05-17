const router = require('express').Router();

const publicHandler = require('../handlers/public-handler');

//cap key khi co token xac thuc bang isdn
router.get('/your-device', publicHandler.getYourDevice, publicHandler.returnDevice);

module.exports = router;
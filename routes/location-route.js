const router = require('express').Router();

const locationHandler = require('../handlers/location-handler');

//cap key khi co token xac thuc bang isdn
router.get('/json-point', locationHandler.getPoint);
router.get('/json-route', locationHandler.getRoute);
                       

module.exports = router;
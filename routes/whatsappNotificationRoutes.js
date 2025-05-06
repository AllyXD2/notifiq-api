const express = require('express')
const router = express.Router()

const whatsappNotificationsController = require('../controllers/whatsappNotificationsController')
const authMiddleware = require('../middlewares/authMiddleware')


router.post('/', authMiddleware, whatsappNotificationsController.createWhatsappNotification)
router.patch('/', authMiddleware, whatsappNotificationsController.updateWhatsappNotification)
router.get('/:id', authMiddleware, whatsappNotificationsController.getWhatsappNotification)


module.exports = router
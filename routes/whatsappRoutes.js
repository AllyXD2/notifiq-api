const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware')

const WhatsappCode = require('../models/WhatsappCode')
const User = require('../models/User')

const { customAlphabet } = require('nanoid');

const generateCodigo = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

function getWhatsappRouter(client){
    const router = express.Router();

    router.post("/send-code", authMiddleware, async (req, res)=>{
        const userId = req.user.id

        const user = await User.findById(userId)
        if(user.whatsappVerificado) return res.status(400).json({ message: 'Usuário já verificou whatsapp.' })

        let whatsappCode = await WhatsappCode.findOne({user: userId})
        if(!whatsappCode) {
            whatsappCode = await WhatsappCode.create({ user: userId, codigo: generateCodigo() })
            
            const whatsapp = user.whatsapp.replaceAll(' ', '').replaceAll('+', '')
            console.log("Enviou mensagem para : " + whatsapp)
            client.sendText(whatsapp + '@c.us', `Olá ${user.nome}! Aqui está seu código de verificação : ${whatsappCode.codigo}. \n\n Se você não fez uma conta, por favor, ignore esta mensagem.`)

            return res.status(200).json({ message: 'Codigo enviado.' })
        }

        const createdAt = new Date(whatsappCode.createdAt).getTime()
        const now = new Date(Date.now()).getTime()

        const minutes = ( now - createdAt ) / 1000 / 60

        if(minutes <= 5) return res.status(400).json({ message: 'Aguarde alguns minutos para enviar novamente' })
        
        await WhatsappCode.deleteOne({_id: whatsappCode._id })
        whatsappCode = whatsappCode = await WhatsappCode.create({ user: userId, codigo: generateCodigo() })

        const whatsapp = user.whatsapp.replaceAll(' ', '').replaceAll('+', '')

        console.log("Enviou mensagem para : " + whatsapp)
        client.sendText(whatsapp + '@c.us', `Olá ${user.nome}! Aqui está seu código de verificação : ${whatsappCode.codigo}. \n\n Se você não fez uma conta, por favor, ignore esta mensagem.`)

        return res.status(200).json({ message: 'Codigo enviado.' })
    })

    router.post("/verify-code", authMiddleware, async (req, res)=>{
        try{
            const userId = req.user.id
            const {codigo} = req.body

            if(!codigo) return res.status(400).json({ message: 'Codigo não pode estar vazio.' })

            const user = await User.findById(userId)

            const whatsappCode = await WhatsappCode.findOne({user: user._id})
            
            if(!whatsappCode) return res.status(400).json({ message: 'Codigo ainda não foi enviado.' })
            if(whatsappCode.codigo != codigo) return res.status(400).json({ message: 'Codigo não coincide.' })

            await WhatsappCode.deleteOne({_id: whatsappCode._id})
            user.whatsappVerificado = true
            await user.save()

            client.sendText(user.whatsapp + '@c.us', `* Seu whatsapp foi verificado com sucesso! * Agora você poderá receber notificações de atividades próximas.`)

            return res.status(200).json({message: 'Whatsapp verificado.'})
        } catch(error) {
            return res.status(400).json({ message: 'Erro ao verificar whatsapp. ' + error.message })
        }
    })

    return router
}

module.exports = getWhatsappRouter
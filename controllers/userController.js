const User = require("../models/User")

exports.getUser = async (req, res) =>{
    try{
        const userId = req.params.userId

        const user = await User.findById(userId).select('-senhaHash');

        if(!user) return res.status(404).json({message: "Usuário não encontrado"})

        return res.status(200).json({user: user})
    } catch (error){
        return res.status(400).json({message: "Erro ao pegar usuário : " + error.message })
    }
}

exports.setPerm = async (req, res) =>{
    try{
        const { userId, permission } = req.body

        if(!userId) return res.status(404).json({message: "Id do usuário não pode estar vazio"})
        if(!permission) return res.status(404).json({message: "A permissão não pode ser vazia"})

        const user = await User.findById(userId).select('-senhaHash');

        if(!user) return res.status(404).json({message: "Usuário não encontrado"})
        if(user.permissions.includes(permission)) return res.status(404).json({message: "Usuário já tem essa permissão"})

        user.permissions.push(permission)
        await user.save()

        return res.status(200).json({user: user})
    } catch(error){
        return res.status(400).json({message: "Erro ao dar permissão para usuário : " + error.message })
    }
}
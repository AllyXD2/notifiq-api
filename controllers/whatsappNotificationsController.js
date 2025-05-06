const Atividade = require('../models/Atividade')
const User = require('../models/User')
const WhatsappNotification = require('../models/WhatsappNotification')
const axios = require('axios')


function converterParaHorario24h(hora12) {
    const match = hora12.match(/^(\d{1,2})(am|pm)$/i);
    if (!match) return null;

    let hora = parseInt(match[1]);
    const periodo = match[2].toLowerCase();

    if (periodo === "pm" && hora !== 12) hora += 12;
    if (periodo === "am" && hora === 12) hora = 0;

    return hora.toString().padStart(2, "0") + ":00";
}


exports.createWhatsappNotification = async (req, res) => {
    try {
        const userId = req.user.id;
        const { atividadeId, dataHorario } = req.body;

        if (!atividadeId || !dataHorario) {
            return res.status(400).json({ message: "Especifique qual atividade e data" });
        }

        const atividade = await Atividade.findById(atividadeId);
        if (!atividade) {
            return res.status(400).json({ message: "Atividade não encontrada" });
        }

        const [dataStr, horaStr] = dataHorario.split(" "); // ex: "03/05/2025 2pm"
        const [dia, mes, ano] = dataStr.split("/");
        const horaConvertida = converterParaHorario24h(horaStr);

        if (!horaConvertida) {
            return res.status(400).json({ message: "Formato de hora inválido" });
        }

        const dataIso = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${horaConvertida}:00`;
        const dataFinal = new Date(dataIso);

        if (isNaN(dataFinal.getTime())) {
            return res.status(400).json({ message: "Data inválida" });
        }

        const agora = new Date();
        if (dataFinal < agora) {
            return res.status(400).json({ message: "Não é possível criar notificações para o passado" });
        }

        const notificacoesExistentes = await WhatsappNotification.find({
            user: userId,
            atividade: atividadeId
        });

        const jaExiste = notificacoesExistentes.some(notif => {
            return new Date(notif.dataHorario).getTime() === dataFinal.getTime();
        });

        if (jaExiste) {
            return res.status(400).json({ message: "Já existe uma notificação idêntica para essa data e hora" });
        }

        const notificacao = await WhatsappNotification.create({
            atividade: atividadeId,
            user: userId,
            dataHorario: dataFinal
        });

        return res.status(200).json({ notificacao });

    } catch (error) {
        return res.status(400).json({ message: "Erro ao criar notificação: " + error.message });
    }
};


exports.deleteWhatsappNotification = async(req, res)=>{
    
}

exports.updateWhatsappNotification = async(req, res)=>{
    try{
        const {whatsNotId, dataHorario} = req.body

        if(!whatsNotId) return res.status(400).json({message: "Id não fornecido"})

        const notificacao = await WhatsappNotification.findOne({_id: whatsNotId}).populate("user", "nome whatsapp atividadesEntregues").populate("atividade", "titulo descricao dataEntrega")

        if(!notificacao) return res.status(400).json({message: "Notificação não encontrada"})

        const [dataStr, horaStr] = dataHorario.split(" "); // ex: "03/05/2025 2pm"
        const [dia, mes, ano] = dataStr.split("/");
        const horaConvertida = converterParaHorario24h(horaStr);

        if (!horaConvertida) {
            return res.status(400).json({ message: "Formato de hora inválido" });
        }

        const dataIso = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}T${horaConvertida}:00`;
        const dataFinal = new Date(dataIso);

        if (isNaN(dataFinal.getTime())) {
            return res.status(400).json({ message: "Data inválida" });
        }

        const agora = new Date();
        if (dataFinal < agora) {
            return res.status(400).json({ message: "Não é possível criar notificações para o passado" });
        }

        const notificacoesExistentes = await WhatsappNotification.find({
            user: notificacao.user._id,
            atividade: notificacao.atividade._id
        });

        const jaExiste = notificacoesExistentes.some(notif => {
            return new Date(notif.dataHorario).getTime() === dataFinal.getTime();
        });

        if (jaExiste) {
            return res.status(400).json({ message: "Já existe uma notificação idêntica para essa data e hora" });
        }

        notificacao.dataHorario = dataFinal
        await notificacao.save()

        return res.status(200).json({notificacao})
    } catch (error) {
        return res.status(400).json({message: "Erro ao atualizar notificação : " + error.message})
    }
}

exports.getWhatsappNotification = async(req, res)=>{
    try{
        const id = req.params.id

        if(!id) return res.status(400).json({message: "Id não fornecido"})

        const notificacao = await WhatsappNotification.findOne({_id: id}).populate("user", "nome whatsapp atividadesEntregues").populate("atividade", "titulo descricao dataEntrega")

        if(!notificacao) return res.status(400).json({message: "Notificação não encontrada"})

        return res.status(200).json({notificacao})
    } catch (error) {
        return res.status(400).json({message: "Erro ao criar notificação : " + error.message})
    }
}

exports.sendAllPendingWhatsappNotifications = async () => {
    try {
        const agora = new Date();

        // Arredonda para o início da hora atual
        const inicioHora = new Date(agora);
        inicioHora.setMinutes(0, 0, 0);

        // Fim da hora atual (não inclusivo)
        const fimHora = new Date(inicioHora);
        fimHora.setHours(inicioHora.getHours() + 1);

        // Busca todas as notificações com dataHorario dentro da hora atual
        const notificacoes = await WhatsappNotification.find({
            dataHorario: { $gte: inicioHora, $lt: fimHora }
        });

        for (const not of notificacoes) {
            const user = await User.findById(not.user);
            const atividade = await Atividade.findById(not.atividade);

            if (!user || !atividade) continue;

            const whatsapp = user.whatsapp.replace(/\D/g, '');
            console.log(user.atividadesEntregues)
            console.log(whatsapp)
            if(!user.whatsappVerificado) return

            // 🔔 Coloque aqui a lógica real para envio do WhatsApp
            console.log(`📤 Enviando WhatsApp para ${user.nome} sobre a atividade: ${atividade.titulo}`);

            if(user.atividadesEntregues.includes(atividade.id)){
                await WhatsappNotification.findByIdAndDelete(not._id);
                const mensagem = `🌟 **Parabéns, ${user.nome}!** 🌟\nVocê já entregou a atividade **${atividade.titulo}** antes do prazo! 🎉\nAqui estão os detalhes da sua entrega:\n**Título:** ${atividade.titulo}\n**Descrição:** ${atividade.descricao}\n**Data de Entrega Programada:** ${new Date(atividade.dataEntrega).toLocaleDateString()}\n**Data de Entrega Real:** ${new Date().toLocaleDateString()}\nExcelente trabalho! 🙌\nContinue assim, sempre antecipando suas metas e aproveitando cada momento para aprender e crescer. Estamos muito felizes com seu progresso!\nAtenciosamente,\n**Notifiq** 💙`;

                await axios.post(process.env.VENOM_API_URL+"/send-message", {
                    number: whatsapp + '@c.us',
                    message: mensagem}, {
                    headers: {
                        Authorization: "Bearer " + process.env.VENOM_API_SECRET
                    }
                })
                return
            }

            // 🔔 Coloque aqui a lógica real para envio do WhatsApp
            console.log(`📤 Enviando WhatsApp para ${user.nome} sobre a atividade: ${atividade.titulo}`);
            await axios.post(process.env.VENOM_API_URL+"/send-message", {
                number: whatsapp + '@c.us',
                message: `Oi, ${user.nome}! 😊\nVocê programou essa notificação : \n\n *${atividade.titulo}*\n${atividade.descricao}\nPara ${new Date(atividade.dataEntrega).toLocaleDateString()}\n\nQue tal dar uma olhada e ver se ainda consegue finalizar a tarefa? Estamos aqui torcendo para você alcançar seus objetivos! 💪 \n\n Atenciosamente, Notifiq`}, {
                headers: {
                    Authorization: "Bearer " + process.env.VENOM_API_SECRET
                }
            })
            // Apaga notificação após envio
            await WhatsappNotification.findByIdAndDelete(not._id);
        }

        console.log(`[✔] Notificações entre ${inicioHora.toISOString()} e ${fimHora.toISOString()} processadas.`);

    } catch (error) {
        console.error("❌ Erro ao enviar notificações:", error.message);
    }
};
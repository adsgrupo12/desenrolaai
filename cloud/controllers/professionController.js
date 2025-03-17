const UserProfession = require("../models/UserProfession");

Parse.Cloud.define("add-profession", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.profession) {
        throw new Error("A profissão é obrigatória.");
    }

    // Verifica se a profissão já está cadastrada para o usuário logado
    const query = new Parse.Query(UserProfession);
    query.equalTo("idUser", req.user);
    query.equalTo("profession", req.params.profession);

    const existingProfession = await query.first({ useMasterKey: true });

    if (existingProfession) {
        throw new Error("Essa profissão já está cadastrada para o usuário.");
    }

    // Criando um novo registro de profissão associado ao usuário autenticado
    const userProfession = new UserProfession();
    userProfession.set("idUser", req.user);
    userProfession.set("profession", req.params.profession);

    const savedProfession = await userProfession.save(null, { useMasterKey: true });

    return {
        objectId: savedProfession.id,
        userId: req.user.id,
        profession: req.params.profession,
        message: "Profissão cadastrada com sucesso."
    };
}, { requireUser: true });  // Exige que o usuário esteja logado



Parse.Cloud.define("get-professions", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Consulta todas as profissões do usuário autenticado
    const query = new Parse.Query(UserProfession);
    query.equalTo("idUser", req.user); // Filtra as profissões do usuário
    query.ascending("createdAt"); // Ordena do mais antigo para o mais recente

    const professions = await query.find({ useMasterKey: true });

    if (professions.length === 0) {
        return { message: "Nenhuma profissão encontrada." };
    }

    // Mapeia as profissões para um formato mais organizado
    const formattedProfessions = professions.map(profession => ({
        objectId: profession.id,
        profession: profession.get("profession")
    }));

    return { professions: formattedProfessions };
}, { requireUser: true });


Parse.Cloud.define("delete-profession", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.professionId) {
        throw new Error("O ID da profissão é obrigatório.");
    }

    // Busca a profissão no banco de dados
    const query = new Parse.Query(UserProfession);
    query.equalTo("objectId", req.params.professionId);
    query.equalTo("idUser", req.user); // Garante que o usuário só pode deletar suas próprias profissões

    const profession = await query.first({ useMasterKey: true });

    if (!profession) {
        throw new Error("Profissão não encontrada ou não pertence ao usuário.");
    }

    // Deleta a profissão do banco
    await profession.destroy({ useMasterKey: true });

    return {
        message: "Profissão excluída com sucesso."
    };
}, { requireUser: true });

const Comment = require("../models/Comment");
const ServiceListing = require("../models/ServiceListing");

Parse.Cloud.define("create-comment", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.serviceListingId || !req.params.message) {
        throw new Error("O ID do anúncio e a mensagem são obrigatórios.");
    }

    if (req.params.rating !== undefined) {
        if (typeof req.params.rating !== "number" || req.params.rating < 0 || req.params.rating > 5) {
            throw new Error("A avaliação (rating) deve estar entre 0 e 5.");
        }
    }

    // Buscar o anúncio pelo ID
    const query = new Parse.Query(ServiceListing);
    query.equalTo("objectId", req.params.serviceListingId);
    const serviceListing = await query.first({ useMasterKey: true });

    if (!serviceListing) {
        throw new Error("Anúncio não encontrado.");
    }

    // Criando um novo comentário associado ao usuário autenticado e ao anúncio
    const comment = new Comment();
    comment.set("idUser", req.user);
    comment.set("idServiceListing", serviceListing);
    comment.set("message", req.params.message);
    comment.set("rating", req.params.rating !== undefined ? req.params.rating : null);

    const savedComment = await comment.save(null, { useMasterKey: true });

    return {
        objectId: savedComment.id,
        message: "Comentário adicionado com sucesso!",
        data: {
            comment: savedComment.get("message"),
            rating: savedComment.get("rating"),
            user: req.user.id,
            serviceListing: serviceListing.id
        }
    };
}, { requireUser: true });


Parse.Cloud.define("get-comments", async (req) => {
    if (!req.params.serviceListingId) {
        throw new Error("O ID do anúncio é obrigatório.");
    }

    // Buscar o anúncio pelo ID para verificar se existe
    const listingQuery = new Parse.Query(ServiceListing);
    listingQuery.equalTo("objectId", req.params.serviceListingId);
    const serviceListing = await listingQuery.first({ useMasterKey: true });

    if (!serviceListing) {
        throw new Error("Anúncio não encontrado.");
    }

    // Buscar os comentários do anúncio
    const query = new Parse.Query(Comment);
    query.equalTo("idServiceListing", serviceListing);
    query.include("idUser"); // Inclui os dados do usuário que comentou
    query.descending("createdAt"); // Ordena do mais recente para o mais antigo

    const comments = await query.find({ useMasterKey: true });

    if (comments.length === 0) {
        return { message: "Nenhum comentário encontrado para este anúncio." };
    }

    const formattedComments = comments.map(comment => {
        const user = comment.get("idUser");

        return {
            objectId: comment.id,
            message: comment.get("message"),
            rating: comment.get("rating") !== undefined ? comment.get("rating") : "Sem avaliação",
            createdAt: comment.createdAt,
            user: user ? {
                objectId: user.id,
                fullName: user.get("fullName") || "Usuário desconhecido"
            } : null
        };
    });

    return { comments: formattedComments };
});

Parse.Cloud.define("delete-comment", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.commentId) {
        throw new Error("O ID do comentário é obrigatório.");
    }

    // Buscar o comentário pelo ID
    const query = new Parse.Query(Comment);
    query.include("idUser"); // Inclui os dados do usuário para verificar a permissão

    const comment = await query.get(req.params.commentId, { useMasterKey: true });

    if (!comment) {
        throw new Error("Comentário não encontrado.");
    }

    // Verificar se o usuário autenticado é o dono do comentário
    if (comment.get("idUser").id !== req.user.id) {
        throw new Error("Permissão negada. Você não pode excluir este comentário.");
    }

    // Deletar o comentário
    await comment.destroy({ useMasterKey: true });

    return {
        message: "Comentário excluído com sucesso!"
    };
}, { requireUser: true });


Parse.Cloud.define("update-comment", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.commentId) {
        throw new Error("O ID do comentário é obrigatório.");
    }

    // Buscar o comentário pelo ID
    const query = new Parse.Query(Comment);
    query.include("idUser"); // Inclui os dados do usuário para verificar a permissão

    const comment = await query.get(req.params.commentId, { useMasterKey: true });

    if (!comment) {
        throw new Error("Comentário não encontrado.");
    }

    // Verificar se o usuário autenticado é o dono do comentário
    if (comment.get("idUser").id !== req.user.id) {
        throw new Error("Permissão negada. Você não pode editar este comentário.");
    }

    // Atualizar a mensagem, se fornecida
    if (req.params.message) {
        comment.set("message", req.params.message);
    }

    // Atualizar a avaliação, se fornecida e válida
    if (req.params.rating !== undefined) {
        if (typeof req.params.rating !== "number" || req.params.rating < 0 || req.params.rating > 5) {
            throw new Error("A avaliação (rating) deve estar entre 0 e 5.");
        }
        comment.set("rating", req.params.rating);
    }

    // Salvar as alterações
    const updatedComment = await comment.save(null, { useMasterKey: true });

    return {
        objectId: updatedComment.id,
        message: "Comentário atualizado com sucesso!",
        updatedFields: {
            message: updatedComment.get("message"),
            rating: updatedComment.get("rating")
        }
    };
}, { requireUser: true });

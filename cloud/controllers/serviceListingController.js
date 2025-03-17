const ServiceListing = require("../models/ServiceListing");
const Category = require("../models/Category");
const User = require("../models/User");

Parse.Cloud.define("create-service-listing", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.description || !req.params.idCategory) {
        throw new Error("Descrição e ID da categoria são obrigatórios.");
    }

    // Verificar se a categoria existe
    const categoryQuery = new Parse.Query(Category);
    categoryQuery.equalTo("objectId", req.params.idCategory);
    const category = await categoryQuery.first({ useMasterKey: true });

    if (!category) {
        throw new Error("Categoria não encontrada.");
    }

    // Criando um novo anúncio associado ao usuário autenticado e à categoria
    const serviceListing = new ServiceListing();
    serviceListing.set("idUser", req.user);
    serviceListing.set("description", req.params.description);
    serviceListing.set("idCategory", category);
    serviceListing.set("price", req.params.price || null);
    
    const savedListing = await serviceListing.save(null, { useMasterKey: true });

    return {
        objectId: savedListing.id,
        message: "Anúncio criado com sucesso!",
        category: {
            objectId: category.id,
            name: category.get("name")
        }
    };
}, { requireUser: true });



Parse.Cloud.define("get-service-listings", async (req) => {
    const query = new Parse.Query(ServiceListing);
    query.descending("createdAt"); // Ordena do mais recente para o mais antigo
    query.include("idUser"); // Inclui os dados do usuário criador
    query.include("idCategory"); // Inclui a categoria associada

    try {
        const listings = await query.find({ useMasterKey: true });

        if (listings.length === 0) {
            return { message: "Nenhum anúncio encontrado." };
        }

        const formattedListings = listings.map(listing => {
            const user = listing.get("idUser");
            const category = listing.get("idCategory");

            return {
                objectId: listing.id,
                description: listing.get("description"),
                price: listing.get("price") || "Preço não informado",
                createdAt: listing.createdAt,
                user: user ? {
                    objectId: user.id,
                    fullName: user.get("fullName") || "Usuário desconhecido"
                } : null,
                category: category ? {
                    objectId: category.id,
                    name: category.get("name") || "Categoria desconhecida"
                } : null
            };
        });

        return { listings: formattedListings };

    } catch (error) {
        throw new Error("Erro ao buscar anúncios: " + error.message);
    }
});

Parse.Cloud.define("update-service-listing", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.serviceListingId) {
        throw new Error("O ID do anúncio é obrigatório.");
    }

    // Buscar o anúncio pelo ID
    const query = new Parse.Query(ServiceListing);
    query.include("idUser"); // Inclui os dados do usuário para verificar a permissão

    const serviceListing = await query.get(req.params.serviceListingId, { useMasterKey: true });

    if (!serviceListing) {
        throw new Error("Anúncio não encontrado.");
    }

    // Verificar se o usuário autenticado é o dono do anúncio
    if (serviceListing.get("idUser").id !== req.user.id) {
        throw new Error("Permissão negada. Você não pode editar este anúncio.");
    }

    // Atualizar a descrição, se fornecida
    if (req.params.description) {
        serviceListing.set("description", req.params.description);
    }

    // Atualizar o preço, se fornecido
    if (req.params.price !== undefined) {
        serviceListing.set("price", req.params.price);
    }

    // Atualizar a categoria, se fornecida
    if (req.params.idCategory) {
        const categoryQuery = new Parse.Query(Category);
        categoryQuery.equalTo("objectId", req.params.idCategory);
        const category = await categoryQuery.first({ useMasterKey: true });

        if (!category) {
            throw new Error("Categoria não encontrada.");
        }

        serviceListing.set("idCategory", category);
    }

    // Salvar as alterações
    const updatedListing = await serviceListing.save(null, { useMasterKey: true });

    return {
        objectId: updatedListing.id,
        message: "Anúncio atualizado com sucesso!",
        updatedFields: {
            description: updatedListing.get("description"),
            price: updatedListing.get("price"),
            category: updatedListing.get("idCategory") ? updatedListing.get("idCategory").get("name") : null
        }
    };
}, { requireUser: true });


Parse.Cloud.define("delete-service-listing", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.serviceListingId) {
        throw new Error("O ID do anúncio é obrigatório.");
    }

    // Buscar o anúncio pelo ID
    const query = new Parse.Query(ServiceListing);
    query.include("idUser"); // Inclui os dados do usuário para verificar a permissão

    const serviceListing = await query.get(req.params.serviceListingId, { useMasterKey: true });

    if (!serviceListing) {
        throw new Error("Anúncio não encontrado.");
    }

    // Verificar se o usuário autenticado é o dono do anúncio
    if (serviceListing.get("idUser").id !== req.user.id) {
        throw new Error("Permissão negada. Você não pode excluir este anúncio.");
    }

    // Deletar o anúncio
    await serviceListing.destroy({ useMasterKey: true });

    return {
        message: "Anúncio excluído com sucesso!"
    };
}, { requireUser: true });

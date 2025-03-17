const UserAddress = require("../models/UserAddress");
const { isValidAddress } = require("../helpers/validation");

Parse.Cloud.define("create-address", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Validação dos campos obrigatórios
    const validationError = isValidAddress(req.params);
    if (validationError) {
        throw new Error(validationError);
    }

    // Criando um novo endereço associado ao usuário autenticado
    const userAddress = new UserAddress();
    userAddress.set("idUser", req.user);
    userAddress.set("street", req.params.street);
    userAddress.set("number", req.params.number || "");
    userAddress.set("complement", req.params.complement || "");
    userAddress.set("district", req.params.district || "");
    userAddress.set("city", req.params.city);
    userAddress.set("state", req.params.state);
    userAddress.set("postalCode", req.params.postalCode || "");
    userAddress.set("country", req.params.country);

    const savedAddress = await userAddress.save(null, { useMasterKey: true });

    return {
        objectId: savedAddress.id,
        message: "Endereço cadastrado com sucesso."
    };
}, { requireUser: true });

Parse.Cloud.define("update-address", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.addressId) {
        throw new Error("ID do endereço é obrigatório.");
    }

    // Consulta o endereço no banco de dados
    const query = new Parse.Query(UserAddress);
    query.equalTo("objectId", req.params.addressId);
    query.equalTo("idUser", req.user); // Garante que o usuário só pode alterar o próprio endereço

    const address = await query.first({ useMasterKey: true });

    if (!address) {
        throw new Error("Endereço não encontrado ou não pertence ao usuário.");
    }

    // Lista de campos que podem ser alterados
    const updatableFields = [
        "street", "number", "complement", "district", 
        "city", "state", "postalCode", "country"
    ];

    // Atualiza apenas os campos enviados na requisição
    updatableFields.forEach((field) => {
        if (req.params[field] !== undefined) {
            address.set(field, req.params[field]);
        }
    });

    // Salva as alterações no banco
    const updatedAddress = await address.save(null, { useMasterKey: true });

    return {
        objectId: updatedAddress.id,
        message: "Endereço atualizado com sucesso.",
        updatedFields: updatableFields.filter(field => req.params[field] !== undefined) // Retorna os campos alterados
    };
}, { requireUser: true });


Parse.Cloud.define("get-addresses", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Consulta todos os endereços do usuário autenticado
    const query = new Parse.Query(UserAddress);
    query.equalTo("idUser", req.user); // Filtra pelos endereços do usuário
    query.ascending("createdAt"); // Ordena pelo mais antigo primeiro

    const addresses = await query.find({ useMasterKey: true });

    if (addresses.length === 0) {
        return { message: "Nenhum endereço encontrado." };
    }

    // Mapeia os endereços encontrados para um formato mais organizado
    const formattedAddresses = addresses.map(address => ({
        objectId: address.id,
        street: address.get("street"),
        number: address.get("number"),
        complement: address.get("complement"),
        district: address.get("district"),
        city: address.get("city"),
        state: address.get("state"),
        postalCode: address.get("postalCode"),
        country: address.get("country")
    }));

    return { addresses: formattedAddresses };
}, { requireUser: true });



Parse.Cloud.define("delete-address", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.addressId) {
        throw new Error("ID do endereço é obrigatório.");
    }

    // Busca o endereço no banco de dados
    const query = new Parse.Query(UserAddress);
    query.equalTo("objectId", req.params.addressId);
    query.equalTo("idUser", req.user); // Garante que o usuário só pode deletar seu próprio endereço

    const address = await query.first({ useMasterKey: true });

    if (!address) {
        throw new Error("Endereço não encontrado ou não pertence ao usuário.");
    }

    // Deleta o endereço do banco
    await address.destroy({ useMasterKey: true });

    return {
        message: "Endereço excluído com sucesso."
    };
}, { requireUser: true });


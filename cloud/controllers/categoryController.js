const Category = require("../models/Category");

Parse.Cloud.define("create-category", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.name || !req.params.description) {
        throw new Error("Nome e descrição são obrigatórios.");
    }

    // Criando uma nova categoria
    const category = new Category();
    category.set("name", req.params.name);
    category.set("description", req.params.description);
    category.set("subcategories", req.params.subcategories || []);

    const savedCategory = await category.save(null, { useMasterKey: true });

    return {
        objectId: savedCategory.id,
        message: "Categoria criada com sucesso!"
    };
}, { requireUser: true }); // Exige autenticação

Parse.Cloud.define("update-category", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.categoryId) {
        throw new Error("O ID da categoria é obrigatório.");
    }

    // Buscar a categoria no banco de dados
    const query = new Parse.Query(Category);
    query.equalTo("objectId", req.params.categoryId);

    const category = await query.first({ useMasterKey: true });

    if (!category) {
        throw new Error("Categoria não encontrada.");
    }

    // Atualizar os campos, se eles forem fornecidos na requisição
    if (req.params.name) {
        category.set("name", req.params.name);
    }

    if (req.params.description) {
        category.set("description", req.params.description);
    }

    if (req.params.subcategories) {
        if (!Array.isArray(req.params.subcategories)) {
            throw new Error("O campo subcategories deve ser um array.");
        }
        category.set("subcategories", req.params.subcategories);
    }

    const updatedCategory = await category.save(null, { useMasterKey: true });

    return {
        objectId: updatedCategory.id,
        message: "Categoria atualizada com sucesso!"
    };
}, { requireUser: true });

Parse.Cloud.define("get-categories", async (req) => {
    // Criar a consulta para buscar todas as categorias
    const query = new Parse.Query(Category);
    query.ascending("name"); // Ordena pelo nome da categoria

    const categories = await query.find({ useMasterKey: true });

    if (categories.length === 0) {
        return { message: "Nenhuma categoria encontrada." };
    }

    // Formata os dados para um retorno mais limpo
    const formattedCategories = categories.map(category => ({
        objectId: category.id,
        name: category.get("name"),
        description: category.get("description"),
        subcategories: category.get("subcategories") || []
    }));

    return { categories: formattedCategories };
});

Parse.Cloud.define("delete-category", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.categoryId) {
        throw new Error("O ID da categoria é obrigatório.");
    }

    // Buscar a categoria no banco de dados
    const query = new Parse.Query(Category);
    query.equalTo("objectId", req.params.categoryId);

    const category = await query.first({ useMasterKey: true });

    if (!category) {
        throw new Error("Categoria não encontrada.");
    }

    // Deletar a categoria
    await category.destroy({ useMasterKey: true });

    return {
        message: "Categoria excluída com sucesso!"
    };
}, { requireUser: true }); // Exige autenticação

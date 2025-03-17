const User = require("../models/User");

Parse.Cloud.define("sign-up", async (req) => {
    if (!req.params.fullName || !req.params.email || !req.params.password) {
        throw new Error("Dados inválidos. Preencha nome, e-mail e senha.");
    }

    const user = new Parse.User();
    user.set("username", req.params.email);
    user.set("fullName", req.params.fullName);
    user.set("email", req.params.email);
    user.set("password", req.params.password);

    try {
        const savedUser = await user.signUp(null, { useMasterKey: true });
        return {
            objectId: savedUser.id,
            fullName: savedUser.get("fullName"),
            email: savedUser.get("email"),
        };
    } catch (error) {
        throw new Error("Erro ao cadastrar usuário: " + error.message);
    }
});

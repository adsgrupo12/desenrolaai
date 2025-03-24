Parse.Cloud.define("login", async (req) => {
    if (!req.params.username || !req.params.password) {
        throw new Error("Usuário e senha são obrigatórios.");
    }

    try {
        const user = await Parse.User.logIn(req.params.username, req.params.password);
        return {
            objectId: user.id,
            fullName: user.get("fullName"),
            sessionToken: user.getSessionToken()
        };
    } catch (error) {
        throw new Error("Erro ao fazer login: " + error.message);
    }
});

Parse.Cloud.define("secure-sign-up", async (req) => {
    if (!req.params.fullName || !req.params.email || !req.params.password) {
        throw new Error("Dados inválidos. Preencha nome, e-mail e senha.");
    }

    const user = new Parse.User();
    user.set("username", req.params.email);
    user.set("fullName", req.params.fullName);
    user.set("email", req.params.email);
    user.set("password", req.params.password);

    try {
        const savedUser = await user.signUp();
        return {
            objectId: savedUser.id,
            fullName: savedUser.get("fullName"),
            email: savedUser.get("email"),
        };
    } catch (error) {
        throw new Error("Erro ao cadastrar usuário: " + error.message);
    }
}, { requireUser: false }); 

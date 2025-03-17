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

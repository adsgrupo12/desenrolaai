Parse.Cloud.define("logout", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    try {
        const query = new Parse.Query("_Session");
        query.equalTo("sessionToken", req.user.getSessionToken());
        const session = await query.first({ useMasterKey: true });

        if (session) {
            await session.destroy({ useMasterKey: true });
        }

        return { message: "Logout realizado com sucesso." };
    } catch (error) {
        throw new Error("Erro ao fazer logout: " + error.message);
    }
}, { requireUser: true });

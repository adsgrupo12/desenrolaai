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

Parse.Cloud.define("get-logged-user", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Busca o usuário autenticado
    const query = new Parse.Query(User);
    query.equalTo("objectId", req.user.id);

    const user = await query.first({ useMasterKey: true });

    if (!user) {
        throw new Error("Usuário não encontrado.");
    }

    return {
        objectId: user.id,
        username: user.get("username"),
        fullName: user.get("fullName"),
        email: user.get("email"),
        isActive: user.get("isActive"),
        createdAt: user.get("createdAt"),
        updatedAt: user.get("updatedAt")
    };
}, { requireUser: true });

Parse.Cloud.define("delete-user", async (req) => {
    const { userId } = req.params;
    const sessionToken = req.headers["x-parse-session-token"];
  
    if (!userId || !sessionToken) {
      throw new Error("userId e sessionToken são obrigatórios.");
    }
  
    try {
      const userQuery = new Parse.Query(Parse.User);
      const user = await userQuery.get(userId, { sessionToken });
  
      await user.destroy({ sessionToken });
  
      return {
        status: "success",
        message: "Usuário excluído com sucesso.",
        userId: userId,
      };
    } catch (error) {
      throw new Error(`Erro ao excluir usuário: ${error.message}`);
    }
  });
  
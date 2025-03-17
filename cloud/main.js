const UserPhoneNumber = Parse.Object.extend("UserPhoneNumber");

Parse.Cloud.define("hello", (request) => {
  const name = request.params.name;
  return "Hello world from " + name + " from Cloud Code";
});

//Função utilizada para criar um novo contato telefônico para um determinado usuário
Parse.Cloud.define("create-contact", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Verifica se os parâmetros necessários foram enviados
    if (!req.params.phoneNumber) {
        throw new Error("Número de telefone é obrigatório.");
    }

    // Criando um novo contato vinculado ao usuário autenticado
    const UserPhoneNumber = Parse.Object.extend("UserPhoneNumber");
    const contact = new UserPhoneNumber();

    contact.set("idUser", req.user); // Apenas o próprio usuário pode criar o contato
    contact.set("phoneNumber", req.params.phoneNumber);

    // Salvando o contato
    const savedContact = await contact.save(null, { useMasterKey: true });

    return {
        objectId: savedContact.id,
        userId: req.user.id,
        phoneNumber: savedContact.get("phoneNumber")
    };
}, { requireUser: true });

  

// Função utilizada para alterar um telefone de contato
Parse.Cloud.define("change-phone", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Verifica se os parâmetros necessários foram enviados
    if (!req.params.idPhoneNumber || !req.params.phoneNumber) {
        throw new Error("ID do contato e novo número de telefone são obrigatórios.");
    }

    // Criando a query para buscar o contato
    const query = new Parse.Query("UserPhoneNumber");

    try {
        const contact = await query.get(req.params.idPhoneNumber, { useMasterKey: true });

        //Verifica se o contato pertence ao usuário autenticado
        if (contact.get("idUser").id !== req.user.id) {
            throw new Error("Você não tem permissão para modificar este contato.");
        }

        // Atualiza o telefone
        contact.set("phoneNumber", req.params.phoneNumber);
        const savedContact = await contact.save(null, { useMasterKey: true });

        return {
            objectId: savedContact.id,
            phoneNumber: savedContact.get("phoneNumber")
        };
    } catch (error) {
        throw new Error("Contato não encontrado ou erro ao atualizar.");
    }
}, { requireUser: true });



  //Função utilizada para deletar um contato telefônico
  Parse.Cloud.define("delete-phone", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    // Verifica se o ID do telefone foi enviado
    if (!req.params.idPhoneNumber) {
        throw new Error("ID do contato é obrigatório.");
    }

    // Criando a query para buscar o contato
    const query = new Parse.Query("UserPhoneNumber");

    try {
        const contact = await query.get(req.params.idPhoneNumber, { useMasterKey: true });

        // 🔒 Verifica se o contato pertence ao usuário autenticado
        if (contact.get("idUser").id !== req.user.id) {
            throw new Error("Você não tem permissão para excluir este contato.");
        }

        // Exclui o contato
        await contact.destroy({ useMasterKey: true });

        return { message: "Contato excluído com sucesso." };
    } catch (error) {
        throw new Error("Contato não encontrado ou erro ao excluir.");
    }
}, { requireUser: true });



//Função para recuperar os números de telefone de um usuário
Parse.Cloud.define("get-phones", async (req) => {
    if (!req.params.userId) {
        throw new Error("Usuário inválido");
    }

    // Criando um ponteiro para o usuário na classe _User
    const User = Parse.Object.extend("_User");
    const userPointer = User.createWithoutData(req.params.userId);

    // Criando a query para buscar os contatos desse usuário
    const query = new Parse.Query("UserPhoneNumber");
    query.equalTo("idUser", userPointer); // Filtra contatos pelo idUser (Ponteiro para _User)

    // Busca apenas os números de telefone
    query.select("phoneNumber"); // Retorna apenas o campo phoneNumber

    const contacts = await query.find({ useMasterKey: true });

    // Retorna apenas uma lista de números de telefone
    return contacts.map(contact => contact.get("phoneNumber"));
});

//Função para recuperar os números de telefone de um usuário com seu nome
Parse.Cloud.define("get-phonesByUser", async (req) => {
    if (!req.params.userId) {
        throw new Error("Usuário inválido");
    }

    // Criando um ponteiro para o usuário na classe _User
    const User = Parse.Object.extend("_User");
    const userPointer = User.createWithoutData(req.params.userId);

    // Buscar os dados do usuário (fullName)
    const userQuery = new Parse.Query(User);
    userQuery.equalTo("objectId", req.params.userId);
    userQuery.select("fullName"); // Pegamos apenas o nome do usuário
    const user = await userQuery.first({ useMasterKey: true });

    if (!user) {
        throw new Error("Usuário não encontrado.");
    }

    // Criando a query para buscar os contatos desse usuário
    const query = new Parse.Query("UserPhoneNumber");
    query.equalTo("idUser", userPointer); // Filtra contatos pelo idUser (Ponteiro para _User)

    // Busca apenas os números de telefone
    query.select("phoneNumber"); // Retorna apenas o campo phoneNumber
    const contacts = await query.find({ useMasterKey: true });

    // Monta o retorno com nome do usuário e os números de telefone
    return {
        fullName: user.get("fullName"),
        phones: contacts.map(contact => contact.get("phoneNumber"))
    };
});

//Função utilizada para criar um novo usuário (Sign-Up)

Parse.Cloud.define("sign-up", async (req) => {
    // Verifica se os parâmetros obrigatórios foram enviados
    if (!req.params.fullName || !req.params.email || !req.params.password) {
        throw new Error("Dados inválidos. Preencha nome, e-mail e senha.");
    }

    // Criando novo usuário
    const user = new Parse.User();
    user.set("username", req.params.email); // Username será o e-mail
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

//Função utilizada para fazer login
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

Parse.Cloud.define("logout", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    try {
        // Busca a sessão ativa do usuário na classe _Session
        const query = new Parse.Query("_Session");
        query.equalTo("sessionToken", req.user.getSessionToken());
        const session = await query.first({ useMasterKey: true });

        if (session) {
            await session.destroy({ useMasterKey: true });
        }

        return { message: "Logout realizado com sucesso. Sessão encerrada." };
    } catch (error) {
        throw new Error("Erro ao fazer logout: " + error.message);
    }
}, { requireUser: true });

//Função utilizada para criar uma profissão para o usuário
Parse.Cloud.define("add-profession", async (req) => {
    if (!req.user) {
        throw new Error("Ação não autorizada. Faça login para continuar.");
    }

    if (!req.params.userId || !req.params.profession) {
        throw new Error("Usuário e profissão são obrigatórios.");
    }

    // Criando um ponteiro para o usuário
    const User = Parse.Object.extend("_User");
    const userPointer = User.createWithoutData(req.params.userId);

    // Criando um novo registro de profissão
    const UserProfession = Parse.Object.extend("UserProfession");
    const userProfession = new UserProfession();

    userProfession.set("idUser", userPointer);
    userProfession.set("profession", req.params.profession);

    const savedProfession = await userProfession.save(null, { useMasterKey: true });

    return {
        objectId: savedProfession.id,
        userId: req.params.userId,
        profession: req.params.profession
    };
}, { requireUser: true });  // Garante que apenas usuários autenticados podem acessar

Parse.Cloud.define("force-logout-all", async (req) => {
    if (!req.user) {
        throw new Error("Ação não autorizada.");
    }

    // Somente um admin deveria poder chamar essa função
    if (!req.user.get("isAdmin")) {
        throw new Error("Apenas administradores podem forçar logout de todos os usuários.");
    }

    try {
        const query = new Parse.Query("_Session");
        const sessions = await query.find({ useMasterKey: true });

        await Parse.Object.destroyAll(sessions, { useMasterKey: true });

        return { message: "Todas as sessões foram encerradas. Todos os usuários precisam fazer login novamente." };
    } catch (error) {
        throw new Error("Erro ao tentar excluir sessões: " + error.message);
    }
}, { requireUser: true });

 //Essa função será utilizada na sua função create-contact para verificar 
 // se o número de telefone é válido antes de salvá-lo no banco de dados.
 function isValidPhoneNumber(phoneNumber) {
	// Remove caracteres não numéricos
	const cleaned = phoneNumber.replace(/\D/g, '');
	// Verifica se o número tem 10 ou 11 dígitos (com ou sem DDD)
	const isValid = /^(\d{10}|\d{11})$/.test(cleaned);
	return isValid;
  }
  
const UserPhoneNumber = require("../models/UserPhoneNumber");
const { isValidPhoneNumber } = require("../helpers/validation");

Parse.Cloud.define("create-contact", async (req) => {
    if (!req.user) {
        throw new Error("Usuário não autenticado.");
    }

    if (!req.params.phoneNumber || !isValidPhoneNumber(req.params.phoneNumber)) {
        throw new Error("Número de telefone inválido.");
    }

    const contact = new UserPhoneNumber();
    contact.set("idUser", req.user);
    contact.set("phoneNumber", req.params.phoneNumber);

    const savedContact = await contact.save(null, { useMasterKey: true });

    return {
        objectId: savedContact.id,
        userId: req.user.id,
        phoneNumber: savedContact.get("phoneNumber")
    };
}, { requireUser: true });

// auth.js

// Salva os dados do usuário no localStorage
function salvarSessao(dadosUsuario) {
    localStorage.setItem("sessionToken", dadosUsuario.sessionToken);
    localStorage.setItem("userId", dadosUsuario.objectId);
    localStorage.setItem("fullName", dadosUsuario.fullName);
}

// Redireciona para página principal após login
function redirecionarParaHome() {
    window.location.href = "home.html";
}

// Faz login usando endpoint do Back4App
async function realizarLogin(email, password) {
    const alertMessage = document.getElementById("alertMessage");

    try {
        const response = await fetch('https://parseapi.back4app.com/functions/login', {
            method: 'POST',
            headers: {
                'X-Parse-Application-Id': 'SUA_APP_ID',
                'X-Parse-REST-API-Key': 'SUA_API_KEY',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (response.ok && result.result?.sessionToken) {
            salvarSessao(result.result);

            alertMessage.className = "alert alert-success";
            alertMessage.innerText = "Login realizado com sucesso!";
            alertMessage.classList.remove("d-none");

            setTimeout(() => {
                redirecionarParaHome();
            }, 2000);
        } else {
            throw new Error(result.error || "Erro ao fazer login. Verifique suas credenciais.");
        }
    } catch (error) {
        alertMessage.className = "alert alert-danger";
        alertMessage.innerText = error.message;
        alertMessage.classList.remove("d-none");
    }
}

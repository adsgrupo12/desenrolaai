document.addEventListener("DOMContentLoaded", function () {
    const deleteAccountButton = document.getElementById("delete-account");
  
    if (deleteAccountButton) {
      deleteAccountButton.addEventListener("click", function (event) {
        event.preventDefault();
  
        Swal.fire({
          title: "Tem certeza?",
          text: "Esta ação é irreversível! Sua conta será excluída permanentemente.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Sim, excluir!",
          cancelButtonText: "Cancelar"
        }).then(async (result) => {
          if (result.isConfirmed) {
            const sessionToken = localStorage.getItem("sessionToken");
  
            if (!sessionToken) {
              Swal.fire("Erro", "Usuário não está autenticado.", "error");
              return;
            }
  
            try {
              // Primeiro, pega os dados do usuário logado
              const userResponse = await fetch("https://parseapi.back4app.com/parse/users/me", {
                method: "GET",
                headers: {
                  "X-Parse-Application-Id": "N1NHQ0pZoF6c9SW1rsb7R5fhhPv5lHYFV3PsuWUe",
                  "X-Parse-REST-API-Key": "AP4V9MLECbJZJcrBTPT9DXZ7be6OESA630S1f2Qr",
                  "X-Parse-Session-Token": sessionToken,
                },
              });
  
              const userData = await userResponse.json();
  
              if (!userData.objectId) throw new Error("Usuário não encontrado.");
  
              // Agora envia para a função delete-user
              const deleteResponse = await fetch("https://parseapi.back4app.com/parse/functions/delete-user", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "X-Parse-Application-Id": "N1NHQ0pZoF6c9SW1rsb7R5fhhPv5lHYFV3PsuWUe",
                  "X-Parse-REST-API-Key": "AP4V9MLECbJZJcrBTPT9DXZ7be6OESA630S1f2Qr",
                  "X-Parse-Session-Token": sessionToken
                },
                body: JSON.stringify({ userId: userData.objectId })
              });
  
              const result = await deleteResponse.json();
  
              if (!deleteResponse.ok) {
                throw new Error(result.error || "Erro ao excluir a conta.");
              }
  
              Swal.fire("Conta excluída!", "Sua conta foi removida com sucesso.", "success").then(() => {
                localStorage.clear();
                window.location.href = "login.html";
              });
  
            } catch (error) {
              console.error("Erro:", error);
              Swal.fire("Erro!", error.message, "error");
            }
          }
        });
      });
    }
  });
  
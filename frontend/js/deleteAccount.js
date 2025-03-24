document.addEventListener("DOMContentLoaded", function() {
    const deleteAccountButton = document.getElementById("delete-account");

    if (deleteAccountButton) {
        deleteAccountButton.addEventListener("click", function(event) {
            event.preventDefault(); // Evita navegação acidental

            // Exibe um alerta personalizado com SweetAlert2
            Swal.fire({
                title: "Tem certeza?",
                text: "Esta ação é irreversível! Sua conta será excluída permanentemente.",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33", // Vermelho para o botão de confirmação
                cancelButtonColor: "#6c757d", // Cinza para o botão de cancelar
                confirmButtonText: "Sim, excluir!",
                cancelButtonText: "Cancelar"
            }).then((result) => {
                if (result.isConfirmed) {
                    // Simulação da requisição para o backend
                    fetch("https://seuservidor.com/api/delete-account", {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer SEU_TOKEN_AQUI"
                        }
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error("Erro ao excluir a conta.");
                        }
                        return response.json();
                    })
                    .then(data => {
                        Swal.fire({
                            title: "Conta excluída!",
                            text: "Sua conta foi excluída com sucesso.",
                            icon: "success",
                            confirmButtonColor: "#198754", // Verde para sucesso
                            confirmButtonText: "OK"
                        }).then(() => {
                            window.location.href = "/"; // Redireciona para a página inicial
                        });
                    })
                    .catch(error => {
                        Swal.fire({
                            title: "Erro!",
                            text: "Não foi possível excluir a conta. Tente novamente.",
                            icon: "error",
                            confirmButtonColor: "#d33",
                            confirmButtonText: "OK"
                        });
                        console.error("Erro:", error);
                    });
                }
            });
        });
    }
});

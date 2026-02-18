const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("mainNav");

menuToggle?.addEventListener("click", () => {
  nav.classList.toggle("open");
});

document.querySelectorAll("#mainNav a").forEach((link) => {
  link.addEventListener("click", () => nav.classList.remove("open"));
});

const orderForm = document.getElementById("orderForm");
const statusEl = document.getElementById("formStatus");

orderForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "ඇණවුම යවමින් පවතී...";
  statusEl.className = "form-status";

  const formData = new FormData(orderForm);

  try {
    const response = await fetch("/api/submit-order", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "ඇණවුම යැවීමේදී දෝෂයක් ඇතිවිය.");
    }

    const whatsappText = encodeURIComponent(result.whatsappMessage);
    window.open(`https://wa.me/94741671668?text=${whatsappText}`, "_blank");

    statusEl.textContent = "✅ ඔබගේ ඇණවුම සාර්ථකව යොමු කරන ලදී. WhatsApp පණිවිඩයද විවෘත කරන ලදී.";
    statusEl.className = "form-status success";
    orderForm.reset();
  } catch (error) {
    statusEl.textContent = `❌ ${error.message}`;
    statusEl.className = "form-status error";
  }
});

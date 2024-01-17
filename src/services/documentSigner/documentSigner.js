const btnFirmar = document.getElementById("btn-signer");

btnFirmar.addEventListener("click", () => {
  window.electron.ipcRenderer.send(
    "documentSigner",
    "algún argumento opcional"
  );
});

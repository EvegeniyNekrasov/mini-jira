(function () {
    const token = document.querySelector('meta[name="csrf-token"]').content;
    document.body.addEventListener("htmx:configRequest", (evt) => {
        evt.detail.headers["CSRF-Token"] = token;
    });
})();

window.Alpine?.store("ui", { modalOpen: false });

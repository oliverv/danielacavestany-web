/* Daniela Cavestany — gallery: group filter, scroll reveal, lightbox viewer.
   Progressive enhancement: no-JS still shows the full series. */
(function () {
  "use strict";

  /* ---------- group filter ---------- */
  var bar = document.getElementById("filterbar");
  var groups = ["g-retratos", "g-rito", "g-tierra"];
  if (bar) {
    var btns = Array.prototype.slice.call(bar.querySelectorAll("button[data-filter]"));
    // live counts
    btns.forEach(function (b) {
      var f = b.getAttribute("data-filter");
      var n = f === "all"
        ? document.querySelectorAll("main .plate").length
        : document.querySelectorAll("#" + f + " .plate").length;
      if (!b.querySelector(".count")) {
        var s = document.createElement("span");
        s.className = "count";
        s.textContent = " (" + n + ")";
        b.appendChild(s);
      }
    });
    btns.forEach(function (b) {
      b.addEventListener("click", function () {
        btns.forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        var f = b.getAttribute("data-filter");
        groups.forEach(function (g) {
          var sec = document.getElementById(g);
          if (!sec) return;
          var show = f === "all" || f === g;
          sec.classList.toggle("dim", !show);
          Array.prototype.forEach.call(sec.querySelectorAll(".plate"), function (p) {
            p.classList.toggle("hide", !show);
          });
        });
      });
    });
  }

  /* ---------- scroll reveal ---------- */
  var plates = Array.prototype.slice.call(document.querySelectorAll("main .plate"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px" });
    plates.forEach(function (p) { p.classList.add("reveal"); io.observe(p); });
  }

  /* ---------- lightbox ---------- */
  var lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "Visor de obra");
  lb.innerHTML =
    '<div class="lb-top"><span class="meta" id="lb-count"></span>' +
    '<button class="lb-close" id="lb-close">Cerrar ✕</button></div>' +
    '<div class="lb-stage"><button class="lb-nav" id="lb-prev" aria-label="Anterior">‹</button>' +
    '<img id="lb-img" alt=""><button class="lb-nav" id="lb-next" aria-label="Siguiente">›</button></div>' +
    '<div class="lb-cap"><span class="title" id="lb-title"></span><span class="meta" id="lb-meta"></span></div>';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector("#lb-img");
  var lbTitle = lb.querySelector("#lb-title");
  var lbMeta = lb.querySelector("#lb-meta");
  var lbCount = lb.querySelector("#lb-count");
  var current = [];
  var idx = 0;

  function visiblePlates() {
    return plates.filter(function (p) { return !p.classList.contains("hide"); });
  }
  function openAt(list, i) {
    current = list; idx = (i + list.length) % list.length;
    var fig = current[idx];
    var img = fig.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt || "";
    var t = fig.querySelector(".title");
    var m = fig.querySelectorAll(".meta");
    lbTitle.textContent = t ? t.textContent : "";
    lbMeta.textContent = m.length ? m[m.length - 1].textContent : "";
    lbCount.textContent = (idx + 1) + " / " + current.length;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() { lb.classList.remove("open"); document.body.style.overflow = ""; }
  function step(d) { openAt(current, idx + d); }

  document.querySelectorAll("main .plate").forEach(function (fig) {
    fig.addEventListener("click", function () {
      var list = visiblePlates();
      openAt(list, list.indexOf(fig));
    });
  });
  lb.querySelector("#lb-close").addEventListener("click", close);
  lb.querySelector("#lb-prev").addEventListener("click", function (e) { e.stopPropagation(); step(-1); });
  lb.querySelector("#lb-next").addEventListener("click", function (e) { e.stopPropagation(); step(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") step(-1);
    if (e.key === "ArrowRight") step(1);
  });
})();

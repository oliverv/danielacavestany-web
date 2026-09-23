/* Daniela Cavestany — gallery: group filter, scroll reveal, lightbox viewer.
   Progressive enhancement: no-JS still shows the full series. */
(function () {
  "use strict";

  var IS_EN = document.documentElement.lang === "en";

  /* ---------- group filter (portfolio page) ---------- */
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
  /*
    .plate elements (photographs) use the slower .reveal-img class.
    .reveal elements (text, labels, captions) use the standard .reveal.
    Both add class "in" when entering viewport — same JS trigger,
    different CSS transition durations.
  */
  var plates = Array.prototype.slice.call(document.querySelectorAll("main .plate"));
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("main .reveal, main .reveal-img"));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    /* Plates get the slower image reveal class */
    plates.forEach(function (p) { p.classList.add("reveal-img"); });
    var seen = [];
    plates.concat(revealEls).forEach(function (p) {
      if (seen.indexOf(p) === -1) { seen.push(p); io.observe(p); }
    });
  }

  /* ---------- lightbox ---------- */
  var lb = document.createElement("div");
  lb.id = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-modal", "true");
  lb.setAttribute("aria-label", IS_EN ? "Artwork viewer" : "Visor de obra");
  lb.innerHTML =
    '<div class="lb-top"><span class="meta" id="lb-count"></span>' +
    '<button class="lb-close" id="lb-close">' + (IS_EN ? "Close ✕" : "Cerrar ✕") + '</button></div>' +
    '<div class="lb-stage"><button class="lb-nav" id="lb-prev" aria-label="' + (IS_EN ? "Previous" : "Anterior") + '">‹</button>' +
    '<img id="lb-img" alt=""><button class="lb-nav" id="lb-next" aria-label="' + (IS_EN ? "Next" : "Siguiente") + '">›</button></div>' +
    '<div class="lb-cap"><span class="title" id="lb-title"></span><span class="meta" id="lb-meta"></span></div>' +
    '<div class="lb-meta-row"><span class="meta" id="lb-cat"></span><a class="lb-consult" id="lb-consult" href="#">' +
    (IS_EN ? "Enquire about this work →" : "Consultar sobre esta obra →") + '</a></div>';
  document.body.appendChild(lb);

  var lbImg     = lb.querySelector("#lb-img");
  var lbTitle   = lb.querySelector("#lb-title");
  var lbMeta    = lb.querySelector("#lb-meta");
  var lbCat     = lb.querySelector("#lb-cat");
  var lbConsult = lb.querySelector("#lb-consult");
  var lbCount   = lb.querySelector("#lb-count");
  var current   = [];
  var idx       = 0;
  var opener    = null;

  function visiblePlates() {
    return plates.filter(function (p) { return !p.classList.contains("hide"); });
  }

  function catOf(fig) {
    // Check within fig first, then in parent article (homepage obra layout)
    var container = fig.closest("article") || fig;
    var m = container.querySelectorAll(".meta, .obra-meta");
    var txt = "";
    m.forEach(function(el) { txt = el.textContent; }); // last match
    var found = txt.match(/BALI[-—]\d{2}/i);
    return found ? found[0].replace("—", "-").toUpperCase() : "";
  }

  function titleOf(fig) {
    var container = fig.closest("article") || fig;
    var t = container.querySelector(".title, .obra-title");
    return t ? t.textContent : "";
  }

  function metaOf(fig) {
    var container = fig.closest("article") || fig;
    var m = container.querySelectorAll(".meta, .obra-meta");
    var txt = "";
    m.forEach(function(el) { txt = el.textContent; });
    return txt;
  }

  function imgOf(fig) {
    return fig.querySelector("img");
  }

  function openAt(list, i) {
    current = list;
    idx = (i + list.length) % list.length;
    var fig = current[idx];
    var img = imgOf(fig);
    lbImg.src = img ? (img.currentSrc || img.src) : "";
    lbImg.alt = img ? (img.alt || "") : "";
    lbTitle.textContent = titleOf(fig);
    lbMeta.textContent = metaOf(fig);
    var cat = catOf(fig);
    var sec = fig.closest("section[id]");
    var group = "";
    if (sec) {
      var h = sec.querySelector("h2.display, .group-title");
      group = h ? h.textContent.trim().replace(/\s+/g, " ") : "";
    }
    lbCat.textContent = group;
    if (cat) {
      lbConsult.style.display = "";
      lbConsult.href = (IS_EN ? "contacto-en.html" : "contacto.html") + "?obra=" + cat;
    } else {
      lbConsult.style.display = "none";
    }
    lbCount.textContent = (idx + 1) + " / " + current.length;
    if (!lb.classList.contains("open")) opener = document.activeElement;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    lb.querySelector("#lb-close").focus();
  }

  function close() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
    if (opener && opener.focus) opener.focus();
  }

  function step(d) { openAt(current, idx + d); }

  // Attach click to all .plate elements
  document.querySelectorAll("main .plate").forEach(function (fig) {
    fig.addEventListener("click", function () {
      var list = visiblePlates();
      openAt(list, list.indexOf(fig));
    });
    // Keyboard activation for role=button elements (obra-img-wrap)
    if (fig.getAttribute("role") === "button") {
      fig.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          fig.click();
        }
      });
    }
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

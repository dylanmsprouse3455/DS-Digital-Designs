const navPages = [
  ["index.html", "Home"],
  ["services.html", "Services"],
  ["portfolio.html", "Portfolio"],
  ["blog.html", "Blog"],
  ["quote.html", "Get a Quote"],
  ["contact.html", "Contact"],
  ["about.html", "About"]
];

function currentPage() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  return path === "" ? "index.html" : path;
}

function renderChrome() {
  const page = currentPage();
  document.querySelectorAll("[data-nav]").forEach((target) => {
    target.innerHTML = `
      <div class="nav">
        <a class="brand" href="index.html">DS Digital Designs</a>
        <nav class="nav-links" aria-label="Primary navigation">
          ${navPages
            .map(([href, label]) => `<a href="${href}" ${href === page ? 'aria-current="page"' : ""}>${label}</a>`)
            .join("")}
        </nav>
      </div>
    `;
  });

  document.querySelectorAll("[data-footer]").forEach((target) => {
    target.innerHTML = `
      <div class="wrap">
        <span>&copy; ${new Date().getFullYear()} DS Digital Designs. All rights reserved.</span>
        <span>Custom websites, quote tools, and business systems.</span>
      </div>
    `;
  });
}

function initPortfolioFilters() {
  const filters = document.querySelectorAll("[data-filter]");
  const projects = document.querySelectorAll("[data-project]");
  if (!filters.length || !projects.length) return;

  filters.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filters.forEach((item) => item.classList.toggle("active", item === button));
      projects.forEach((project) => {
        const show = filter === "all" || project.dataset.project === filter;
        project.hidden = !show;
      });
    });
  });
}

const quoteState = {
  type: "one-page",
  features: [],
  timeline: "month",
  care: "none"
};

const quotePricing = {
  type: {
    "one-page": [300, 600],
    "multi-page": [700, 1300],
    redesign: [450, 1050],
    unsure: [500, 1200]
  },
  feature: {
    form: [75, 150],
    gallery: [75, 175],
    booking: [175, 350],
    blog: [150, 300],
    seo: [125, 250],
    copy: [150, 400]
  },
  timeline: {
    asap: [150, 300],
    month: [0, 0],
    flexible: [-50, -100]
  },
  care: {
    none: [0, 0],
    edits: [50, 150],
    ongoing: [150, 350]
  }
};

function money(value) {
  return `$${Math.max(250, Math.round(value / 25) * 25).toLocaleString()}`;
}

function calculateQuote() {
  let [low, high] = quotePricing.type[quoteState.type] || quotePricing.type.unsure;
  quoteState.features.forEach((feature) => {
    const add = quotePricing.feature[feature] || [0, 0];
    low += add[0];
    high += add[1];
  });
  const timeline = quotePricing.timeline[quoteState.timeline] || [0, 0];
  const care = quotePricing.care[quoteState.care] || [0, 0];
  low += timeline[0] + care[0];
  high += timeline[1] + care[1];
  if (high < low + 200) high = low + 200;
  return [low, high];
}

function updateQuote() {
  document.querySelectorAll("[data-estimate]").forEach((node) => {
    const [low, high] = calculateQuote();
    node.textContent = `${money(low)} - ${money(high)}`;
  });

  const contactLink = document.querySelector("[data-contact-quote]");
  if (contactLink) {
    const [low, high] = calculateQuote();
    const params = new URLSearchParams({
      estimate: `${money(low)} - ${money(high)}`,
      type: quoteState.type,
      features: quoteState.features.join(", "),
      timeline: quoteState.timeline,
      care: quoteState.care
    });
    contactLink.href = `contact.html?${params.toString()}`;
  }
}

function showQuoteStep(index) {
  const steps = [...document.querySelectorAll("[data-step]")];
  steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === index));
  const progress = document.querySelector("[data-progress]");
  if (progress) progress.style.width = `${((index + 1) / steps.length) * 100}%`;
}

function initQuoteEngine() {
  const form = document.querySelector("[data-quote-form]");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const requestedType = params.get("type");
  if (requestedType && form.elements.type) {
    [...form.querySelectorAll('input[name="type"]')].forEach((input) => {
      input.checked = input.value === requestedType;
    });
  }

  quoteState.type = form.elements.type?.value || quoteState.type;

  form.addEventListener("change", () => {
    quoteState.type = form.elements.type?.value || quoteState.type;
    quoteState.timeline = form.elements.timeline?.value || quoteState.timeline;
    quoteState.care = form.elements.care?.value || quoteState.care;
    quoteState.features = [...form.querySelectorAll('input[name="features"]:checked')].map((input) => input.value);
    updateQuote();
  });

  document.querySelectorAll("[data-next-step]").forEach((button) => {
    button.addEventListener("click", () => showQuoteStep(Number(button.dataset.nextStep)));
  });
  document.querySelectorAll("[data-prev-step]").forEach((button) => {
    button.addEventListener("click", () => showQuoteStep(Number(button.dataset.prevStep)));
  });

  showQuoteStep(0);
  updateQuote();
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const estimate = params.get("estimate");
  const details = [];
  ["type", "features", "timeline", "care"].forEach((key) => {
    if (params.get(key)) details.push(`${key}: ${params.get(key)}`);
  });

  if (estimate) {
    const estimateField = document.querySelector("[data-estimate-field]");
    const message = form.querySelector("#message");
    if (estimateField) estimateField.textContent = estimate;
    if (message && !message.value) {
      message.value = `Estimated range: ${estimate}\n${details.join("\n")}\n\nProject notes: `;
    }
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const subject = encodeURIComponent("New website project inquiry");
    const body = encodeURIComponent(
      `Name: ${data.get("name") || ""}\nEmail: ${data.get("email") || ""}\nPhone: ${data.get("phone") || ""}\nPreferred contact: ${data.get("contact-method") || ""}\n\n${data.get("message") || ""}`
    );
    const mailto = `mailto:dsdigitaldesigns3455@gmail.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    document.querySelector("[data-form-success]")?.classList.add("visible");
  });
}

renderChrome();
initPortfolioFilters();
initQuoteEngine();
initContactForm();

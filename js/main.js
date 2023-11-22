// MASK TEL
document
  .querySelector("input[type='tel']")
  .addEventListener("input", (event) => {
    const maskPhone = event.target.value
      .replace(/\D/g, "")
      .match(/(\d{0,2})(\d{0,2})(\d{0,7})/);
    event.target.value = !maskPhone[2]
      ? maskPhone[1]
      : "(" + maskPhone[1] + ")" + " " + maskPhone[2] + maskPhone[3];
  });

// COOKIES MODAL
const containerCookies = document.querySelector(".cookies");
const btnCookies = containerCookies.querySelector("button");

btnCookies.addEventListener("click", () => {
  containerCookies.classList.remove("open");
  localStorage.setItem("lgpd", true);
});

window.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("lgpd")) containerCookies.classList.add("open");
});

// FORM
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(";");
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getUrlParameter(name) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(location.search);
  return results === null
    ? ""
    : decodeURIComponent(results[1].replace(/\+/g, " "));
}

const form = document.querySelector("form");
const formButton = form.querySelector("button[type='submit']");
const feedBackmessage = form.querySelector("h6");
const inputMethod = form.querySelector("#canal");
const buttonsContact = document.querySelectorAll("[data-method]");

buttonsContact.forEach((button) => {
  button.addEventListener("click", (e) => {
    const tgt = e.currentTarget;
    inputMethod.value = tgt.dataset.method;
  });
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  formButton.disabled = true;
  formButton.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';

  let phone = form.elements["telefone"].value.replace(/\D/g, "");
  let ddd = phone.substring(0, 2);

  let lead = {};
  lead.nome = form.elements["nome"].value;
  lead.ddd = ddd;
  lead.email = form.elements["email"].value;
  lead.telefone = phone.substring(2);
  lead.origem = "LP Elements" + inputMethod.value;
  lead.empreendimento = "31";
  enviaLeadRootbase(lead);

  formButton.style.cssText = "display: none";
  feedBackmessage.style.cssText = "display: block; color: #51a676";
  feedBackmessage.innerHTML =
    "Obrigado por enviar seu interesse. <br/> Entraremos em contato em breve!";

  // Redirect based on method
  if (inputMethod.value === "whatsapp") {
    window.open("https://api.whatsapp.com/send?phone=5513988217750", "_blank");
  } else if (inputMethod.value === "email") {
    window.open("mailto:marcosdias09@gmail.com", "_blank");
  } else if (inputMethod.value === "telefone") {
    window.open("tel:+5513988217750", "_blank");
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: "lead_enviado" });
});

// CAROUSELS
const types = [
  "Perspectivas",
  "Decorado 1 Dorm",
  "Decorado 2 Dorms",
  "Plantas",
];
const carousels = document.querySelectorAll("[data-carousel]");
const navCarousels = document.querySelector("[data-nav] div");

carousels.forEach((carousel, index) => {
  carousel.dataset.content = types[index];

  const wrapper = carousel.querySelector(".swiper-wrapper");
  const controls = carousel.querySelectorAll("button");

  controls[0].dataset.prev = types[index];
  controls[1].dataset.next = types[index];

  fetch("../imagens.json")
    .then((res) => res.json())
    .then((data) => {
      data[index].forEach((image) => {
        wrapper.innerHTML += `
          <a class="swiper-slide" data-fslightbox="${types[index]}" href="${image.url}">
            <img src="${image.url}" alt="${image.legenda}">
            <p>${image.legenda}</p>
          </a>
        `;
      });
    });

  if (index === 0) {
    carousel.classList.add("active");

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/fslightbox@3.3.1/index.min.js";
    document.body.appendChild(script);
  }
});

types.forEach((type, index) => {
  const button = document.createElement("button");

  button.classList = `button ${index !== 0 ? "button--outline" : ""}`;
  button.textContent = type;
  button.dataset.content = "";
  button.type = "button";

  navCarousels.append(button);

  new Swiper(`[data-content="${type}"] .swiper`, {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 24,
    rewind: true,
    breakpoints: {
      300: {
        slidesPerView: 1,
        spaceBetween: 16,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 24,
      },
      1180: {
        slidesPerView: 3,
        spaceBetween: 24,
      },
    },
    navigation: {
      prevEl: `[data-content="${type}"] [data-prev="${type}"]`,
      nextEl: `[data-content="${type}"] [data-next="${type}"]`,
    },
  });
});

// TABS
const buttons = document.querySelectorAll("button[data-content]");
const contents = document.querySelectorAll("section[data-content]");

buttons.forEach((el) => el.addEventListener("click", openTabs));

function openTabs(el) {
  const btnTarget = el.currentTarget;
  const text = btnTarget.textContent;
  const content = document.querySelector(`section[data-content="${text}"]`);

  buttons.forEach((el) => el.classList.add("button--outline"));
  contents.forEach((el) => el.classList.remove("active"));

  content.classList.add("active");
  btnTarget.classList.remove("button--outline");
}

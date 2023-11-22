console.log("Rootbase ativado");

// Checar apenas na landing page
let hotsite = null;
let urlhotsite = window.location.href;

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

if (getUrlParameter("utm_campaign").length > 0)
  setCookie("rb_utm_campaign", getUrlParameter("utm_campaign"), 30);
if (getUrlParameter("utm_source").length > 0)
  setCookie("rb_utm_source", getUrlParameter("utm_source"), 30);
if (getUrlParameter("utm_medium").length > 0)
  setCookie("rb_utm_medium", getUrlParameter("utm_medium"), 30);
if (getUrlParameter("utm_content").length > 0)
  setCookie("rb_utm_content", getUrlParameter("utm_content"), 30);

function decodeEmp(empreendimento) {
  console.log("Empreendimento", empreendimento);

  const emps = [
    { nome: "Elements", suahouse: "40505", cv: "31" },
    { nome: "Go Bosque Maia", suahouse: "39382", cv: "30" },
    { nome: "Go Barra Funda", suahouse: "39330", cv: "29" },
    { nome: "Snap Bela Vista", suahouse: "39297", cv: "21" },
    { nome: "Belint Bela Cintra", suahouse: "11111", cv: "32" },
    { nome: "Beside Santa Cecilia", suahouse: "40236", cv: "24" },
    { nome: "Go Liberdade", suahouse: "17791", cv: "22" },
    { nome: "Agia Faria Lima", suahouse: "22222", cv: "25" },
    { nome: "Office Design Santana", suahouse: "1938", cv: "26" },
    { nome: "Citzy Paulista", suahouse: "35", cv: "35" },
    { nome: "Athmos Klabin", suahouse: "37", cv: "37" },
    { nome: "Institucional", suahouse: "36", cv: "36" },
  ];

  if (empreendimento == "36") {
    return 36;
  }

  const foundBySuahouse = emps.find((emp) => emp.suahouse === empreendimento);
  if (foundBySuahouse) {
    return foundBySuahouse.cv;
  }

  const foundByCV = emps.find((emp) => emp.cv === empreendimento);
  if (foundByCV) {
    return foundByCV.cv;
  }

  return "36";
}

function enviaLeadRootbase(lead) {
  let prepareLead = {
    empresa_identificador: "AQP",
    localizacao: lead.ddd,
    nome: lead.nome,
    email: lead.email,
    telefone: lead.ddd + lead.telefone,
    canal: lead.origem,
    campaign: getCookie("rb_utm_campaign") ? getCookie("rb_utm_campaign") : "",
    source: getCookie("rb_utm_source") ? getCookie("rb_utm_source") : "",
    medium: getCookie("rb_utm_medium") ? getCookie("rb_utm_medium") : "",
    content: getCookie("rb_utm_content") ? getCookie("rb_utm_content") : "",
    extra_fields: {
      key: "empreendimento",
      value: decodeEmp(lead.empreendimento),
    },
  };

  console.log("Enviando lead para rootbase");

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "colocar-api-aqui", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send(JSON.stringify(prepareLead));
}

(function (pWindow) {
  versao = 0.84,
  pWindow.contako = {
    urlBaseWidget: 'https://widget.contako.com.br/',
    urlBaseArquivoS3: 'https://contako.s3-sa-east-1.amazonaws.com/CadastroConfiguracao/',
    urlBaseArquivoHandler: 'https://app.contako.com.br/',
    urlImagemContakoPadrao: 'assets/img/contako-72x72-verde.png',
    instalacoes: { 'integrada': 1, 'aba': 2, 'popup': 3 },
    telaMobile: false,
    telaDesktop: false,
    widgetAberto: false,
    mediaRecorder: null,
    tituloSiteCliente: '',
    widgetSessao: "",
    widgetTimeoutSessao: null,
    widgetContakoSessao: 'widgetContakoSessao',
    atendimentoFluxoSessaoToken: 'sessaoFluxoToken',
    atendimentoAberto: 'widgetContakoAtendimentoAberto',
    atendimentoEstaAberto: false,
    widgetBotConfiguraco: false,
    widgetAbrirAutomaticamente: false,
    widgetClienteInteragiuComAPagina: false,
    widgetPermissaoNotificacoesNavegador: false,
    widgetAtendimentoMensagensNaoLidas: 0,
    inicia: function (pIdCadastro, pParametros) {
      if (widgetVerificarCookies()) {
        contako.tituloSiteCliente = window.document.title;
        contako.atendimentoEstaAberto = verificarAtendimentoAberto();
        carregarArquivoConfiguracao(pIdCadastro, (configuracao) => widgetInicializar(configuracao, contako.urlBaseWidget, pIdCadastro, pParametros, contako.atendimentoEstaAberto));
      } else {
        carregarArquivoConfiguracao(pIdCadastro, (configuracao) => widgetInicializar(configuracao, contako.urlBaseWidget, pIdCadastro, pParametros, false, false));
      }
    },
    abre: function (pUrlWidget, pConfiguracao, pIdCadastro) {
      contako.widgetAberto = true;
      widgetFrame(pUrlWidget, pConfiguracao, pIdCadastro);
      analisarDimensoesPagina(pConfiguracao, pIdCadastro);
      if (!contako.atendimentoEstaAberto && contako.widgetBotConfiguraco) contako.atualizar();
    },
    exibeFixo: function (pUrlWidget, pIdCadastro) {
      widgetFixo(pUrlWidget, pIdCadastro);
    },
    exibePopUp: function (pUrlWidget, pIdCadastro) {
      widgetPopUp(pUrlWidget, pIdCadastro);
    },
    fecha: function (pIdCadastro) {
      var widgetJanelaFrame = pWindow.document.getElementById('widgetJanelaContako' + pIdCadastro);
      if (widgetJanelaFrame !== null && widgetJanelaFrame !== undefined) {
        widgetJanelaFrame.style.display = 'none';
        pWindow.document.getElementById('widgetContakoFechar' + pIdCadastro).style.visibility = 'hidden';
        pWindow.document.getElementById('widgetContako' + pIdCadastro).style.display = 'flex';
      }
      contako.widgetAberto = false;
      contako.widgetAtendimentoMensagensNaoLidas = 0;
      adicionarRemoverClassesRootSiteCliente(false);
    },
    encerrar: function (pIdCadastro) {
      if (widgetVerificarCookies()) {
        atendimentoAberto(false);
        atendimentoFluxoFechado();
      }
      contako.fecha(pIdCadastro);
    },
    atualizar: function () {
      const iframe = window.parent.document.getElementById('widgetAtendimentoFrame');
      iframe.src = iframe.src;
    }
  };

  var widgetGerarRecuperarIdSessao = (pIdCadastro) => {
    if (widgetVerificarCookies()) {
      var valor = getLocalStorage({ nome: contako.widgetContakoSessao }, true);
      if (valor !== null && valor !== undefined && valor !== '') {
        var swid = valor.substring(0, 4);
        var cad = pIdCadastro.substring(0, 4);
        if (swid !== cad) valor = null;
      }

      if (valor === null || valor === undefined) widgetGerarSessao(pIdCadastro);
      else contako.widgetSessao = valor;

    }

    return contako.widgetSessao;
  };

  function widgetGerarSessao(pIdCadastro) {
    contako.widgetSessao = pIdCadastro.substring(0, 4) + widgetSessaoId();
    setLocalStorage({ nome: contako.widgetContakoSessao, valor: contako.widgetSessao });
  }

  function widgetVerificarCookies(enviarParaIframe) {
    if (enviarParaIframe) enviarEventosIframe({ tipo: 'cookiesHabilitados', valor: navigator.cookieEnabled });
    return (navigator.cookieEnabled);
  }

  var widgetVerificarSessao = function(pIdCadastro) {
    if (widgetVerificarCookies()) {
      var sessao = getLocalStorage({ nome: contako.widgetContakoSessao }, false);
      if (sessao === null || sessao === undefined || sessao === '') widgetGerarSessao(pIdCadastro);

      const estadoAnterior = contako.atendimentoEstaAberto;
      let estadoAtual = verificarAtendimentoAberto();

      if (estadoAnterior !== estadoAtual) {
        if (!estadoAtual && estadoAnterior){ // fechar
          if (contako.widgetAberto) contako.encerrar(pIdCadastro);
        } else if (estadoAtual && !estadoAnterior) { //abrir ou atualizar
          if (!contako.widgetAberto) {
            contako.widgetAberto = true;
            var btnAbrirWidget = pWindow.document.getElementById('widgetContako' + pIdCadastro);
            if (btnAbrirWidget !== null && btnAbrirWidget !== undefined) {
              btnAbrirWidget.click();
              setTimeout(() => (contako.atualizar(pIdCadastro)), 100);
            }
          } else contako.atualizar(pIdCadastro);
        }
      }
    }
   contako.widgetTimeoutSessao = setTimeout(() => widgetVerificarSessao(pIdCadastro), 500);
  };

  var widgetPararVerificacaoSessao = function() {
    if (contako.widgetTimeoutSessao !== null && contako.widgetTimeoutSessao !== undefined) {
      clearTimeout(contako.widgetTimeoutSessao);
    }
  };

  var widgetSessaoId = function () {
    var quantidade = 4;
    var resultado = '';
    var caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var caracteresTamanho = caracteres.length;
    for (var i = 0; i < quantidade; i++) resultado += caracteres.charAt(Math.floor(Math.random() * caracteresTamanho));

    return resultado;
  };

  var widgetFrame = function (pUrlWidgetCompleta, pConfiguracao, pIdCadastro) {
    var widgetJanelaFrame = pWindow.document.getElementById('widgetBoxIframeContako' + pIdCadastro);
    if (widgetJanelaFrame !== null && widgetJanelaFrame !== undefined) {
      if (widgetJanelaFrame.style !== null && widgetJanelaFrame.style !== undefined) widgetJanelaFrame.style.display = 'block';

      var iframeWidgetAtendimentoFrame = pWindow.document.getElementById('widgetAtendimentoFrame');
      if (iframeWidgetAtendimentoFrame === null || iframeWidgetAtendimentoFrame === undefined) {
        var iframe = pWindow.document.createElement('iframe');
        iframe.setAttribute('loading', 'lazy');
        iframe.setAttribute('src', pUrlWidgetCompleta);
        iframe.setAttribute('id', 'widgetAtendimentoFrame');
        iframe.setAttribute('class', 'resetcontako widgetAtendimentoContakoFrame');
        widgetJanelaFrame.append(iframe);
        exibirOuNaoExibirAtendimentoMensagensNaoLidas(true);
        analisarDimensoesPagina(pConfiguracao, pIdCadastro);
      }
    }
  };

  var widgetFixo = function (pUrlWidget) {
    pWindow.open(pUrlWidget, '_blank');
  };

  var widgetPopUp = function (pUrlWidget) {
    pWindow.open(pUrlWidget, '_blank', 'width=900, height=640', false);
  };

  var carregarArquivoConfiguracao = function (pIdCadastro = 0, callback = null) {
    fetch(contako.urlBaseArquivoS3 + pIdCadastro + '.json?d=' + new Date().getTime()).then((response) => {
      if (response.status === 400 || response.status === 404 || response.status === 403) {
        solicitarCriacaoArquivoConfiguracao(pIdCadastro, callback);
      } else if (response.status === 200) response.json().then((data) => callback(data));
    }).catch(erro => solicitarCriacaoArquivoConfiguracao());
  };

  var solicitarCriacaoArquivoConfiguracao = function (pIdCadastro = 0, callback = null) {
    return fetch(contako.urlBaseArquivoHandler + 'ControladorCadastroConfiguracaoInstalacao.sikoni?cadastro=' + pIdCadastro, { method: "GET" })
      .then((response) => (response.status === 200) ? (response.json().then((data) => callback(data))) : Promise.resolve()).catch((err) => Promise.resolve());
  };

  var verificarAtendimentoAberto = function () {
    var aberto = false;
    if (widgetVerificarCookies()) {
      const abertoValue = getLocalStorage({ nome: contako.atendimentoAberto }, true);
      aberto = (abertoValue !== null && abertoValue !== undefined && abertoValue !== '') ? (abertoValue === 'true') : false;
    }
    contako.atendimentoEstaAberto = aberto;
    return aberto;
  };


  var carregarEstilos = function (pWindow) {
    var linkElementReset = document.createElement('link');
    linkElementReset.setAttribute('rel', 'stylesheet');
    linkElementReset.setAttribute('href', contako.urlBaseWidget + 'assets/css/reset.css');

    var linkElementWidgetContako = document.createElement('link');
    linkElementWidgetContako.setAttribute('rel', 'stylesheet');
    linkElementWidgetContako.setAttribute('href', contako.urlBaseWidget + 'assets/css/widgetContako.css');

    pWindow.document.getElementsByTagName('head')[0].appendChild(linkElementReset);
    pWindow.document.getElementsByTagName('head')[0].appendChild(linkElementWidgetContako);
  };


  var gerarURLWidget = function (pIdCadastro, pUrlWidget, pParametros, pCookiesAtivos) {
    var urlOrigemBase = pWindow.location.href;
    var urlOrigemCors = urlOrigemBase + pWindow.location.pathname;

    var parametros = verificarParametrosPersonalizados(
        pParametros,
        encodeURI(removeParametrosUrlOrigem(urlOrigemBase)),
        encodeURI(removeParametrosUrlOrigem(urlOrigemCors))
      );

    var widgetSessao = ((pCookiesAtivos) ? '/' + widgetGerarRecuperarIdSessao(pIdCadastro) : '');
    pUrlWidget = pUrlWidget + 'atendimento/' + pIdCadastro + widgetSessao + parametros;
    return pUrlWidget;
  };

  function removeParametrosUrlOrigem(pUrl) {
    var arr = pUrl.split('?');
    return (arr.length >= 2) ? arr[0] : pUrl;
  }

  var widgetInicializar = function (pConfiguracao, pUrlWidget, pIdCadastro, pParametros = '', pAtendimentoAberto = false, pCookiesAtivos = true) {
    if (pConfiguracao.widget.status === "A") {
      carregarEstilos(pWindow);
      pUrlWidget = gerarURLWidget(pIdCadastro, pUrlWidget, pParametros, pCookiesAtivos);
      pConfiguracao = verificarParametrosConfiguracaoWidget(pParametros, pConfiguracao, pCookiesAtivos);

      switch (pConfiguracao.tipo) {
        case contako.instalacoes.integrada:
          botaoFecharWidget(pConfiguracao, pIdCadastro);
          botaoAbrirWidget(pConfiguracao, pIdCadastro);
          setTimeout(() => widgetVerificarSessao(pIdCadastro), 100);
          var boxjanelaContako = janelaContako(pConfiguracao, pIdCadastro);
          var btnAbrirWidget = pWindow.document.getElementById('widgetContako' + pIdCadastro);
          btnAbrirWidget.addEventListener('click', function () {
            contako.widgetClienteInteragiuComAPagina = true;
            pWindow.document.getElementById('widgetContako' + pIdCadastro).style.display = 'none';
            pWindow.document.getElementById('widgetContakoFechar' + pIdCadastro).style.visibility = 'inherit';
            exibirJanela(pConfiguracao, pIdCadastro, boxjanelaContako);
            contako.abre(pUrlWidget, pConfiguracao, pIdCadastro);
          });
          pWindow.document.getElementById('widgetContakoFechar' + pIdCadastro).addEventListener('click', function () {
            contako.widgetClienteInteragiuComAPagina = true;
            contako.fecha(pIdCadastro, pConfiguracao);
          });
          pWindow.addEventListener('beforeunload', function(event) {
            widgetPararVerificacaoSessao();
            if (!contako.atendimentoEstaAberto) deleteLocalStorage({ nome: contako.widgetContakoSessao });
          }, { passive: false });
          analisarDimensoesPagina(pConfiguracao, pIdCadastro);
          verificarAjusteLarguraPagina(pConfiguracao, pIdCadastro);
          verificarEventosWidget(pConfiguracao, pIdCadastro, pCookiesAtivos);
          const abrirWidget = (pAtendimentoAberto) ? pAtendimentoAberto : contako.widgetAbrirAutomaticamente;
          if (abrirWidget) { btnAbrirWidget.click(); }
          break;
        case contako.instalacoes.aba:
          botaoAbrirWidget(pConfiguracao, pIdCadastro);
          pWindow.document.getElementById('widgetContako' + pIdCadastro).addEventListener('click', function () {
            widgetPararVerificacaoSessao();
            contako.exibeFixo(pUrlWidget, pIdCadastro);
            contako.widgetClienteInteragiuComAPagina = true;
          });
          verificarEventosWidget(pConfiguracao, pIdCadastro, pCookiesAtivos);
          break;
        case contako.instalacoes.popup:
          botaoAbrirWidget(pConfiguracao, pIdCadastro);
          pWindow.document.getElementById('widgetContako' + pIdCadastro).addEventListener('click', function () {
            widgetPararVerificacaoSessao();
            contako.exibePopUp(pUrlWidget, pIdCadastro);
            contako.widgetClienteInteragiuComAPagina = true;
          });
          verificarEventosWidget(pConfiguracao, pIdCadastro, pCookiesAtivos);
          break;
      }
    }
  };

  var verificarEventosWidget = function (pConfiguracao, pIdCadastro, pCookiesAtivos = true) {
    if (window.location.protocol !== 'file://') {
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = (eventMethod === "attachEvent") ? "onmessage" : "message";

      eventer(messageEvent, function (e) {
        if (contako.urlBaseWidget === e.origin + '/') {
          let eventObjeto = null;
          const eventPostMessage = (e.data !== null && e.data !== undefined && e.data !== '') ? e.data : e.message;
          const eventPostMessageValido = (eventPostMessage !== null && eventPostMessage !== undefined && eventPostMessage !== '' && eventPostMessage !== '!_{"h":""}');
          try {
            const eventTipoValido = (eventPostMessage.type !== "webpackOk" && eventPostMessage.type !== "webpackInvalid" && eventPostMessage.type !== "webpackStillOk");
            eventObjeto = (eventPostMessageValido && eventTipoValido) ? ((typeof eventPostMessage === 'string') ? JSON.parse(eventPostMessage) : eventPostMessage): null;

            const eventObjetoValido = (eventObjeto !== null && eventObjeto !== undefined);
            const event = (eventObjetoValido) ? eventObjeto.nome : '';
            const parametroValor = (eventObjetoValido) ? eventObjeto.dados : '';

            switch (event) {
              case 'widgetIniciado':
                contako.telaMobile = false;
                contako.telaDesktop = false;
                analisarDimensoesPagina(pConfiguracao, pIdCadastro);
                break;
              case 'widgetContakoReiniciar':
                contako.atualizar();
                break;
              case 'widgetContakoReabrir':
                contako.abre();
                break;
              case 'widgetContakoMinimizar':
                contako.fecha(pIdCadastro);
                break;
              case 'widgetContakoMinimizarEncerrarAtendimento':
                contako.encerrar(pIdCadastro);
                contako.widgetAtendimentoMensagensNaoLidas = 0;
                break;
              case 'widgetContakoAtendimentoAberto':
                contako.atendimentoEstaAberto = true;
                if (pCookiesAtivos) atendimentoAberto(true);
                break;
              case 'widgetContakoAtendimentoFechado':
                contako.atendimentoEstaAberto = false;
                contako.widgetAtendimentoMensagensNaoLidas = 0;
                contako.encerrar(pIdCadastro);
                break;
              case 'widgetContakoAtendimentoCapturarAudio':
                requerirCapturarAudio();
                break;
              case 'widgetContakoAtendimentoPararCapturarAudio':
                pararCapturaAudio();
                break;
              case 'widgetContakoNovaMensagem':
                notificacaoSonoraNovaMensagemRecebida();
                notificacaoPushNovaMensagem(pConfiguracao, parametroValor);
                contako.widgetAtendimentoMensagensNaoLidas++;
                break;
              case 'widgetSolicitarPermissaoNotificacoesNavegador':
                verificarPermissaoNotificacoesNavegador();
                break;
              case 'widgetSolicitarPermissaoGeolocalizacao':
                verificarSolicitarPermissaoGeolocalizacao();
                break;
              case 'widgetContakoLimparNotificacaoNovaMensagem':
                contako.widgetAtendimentoMensagensNaoLidas = 0;
                contako.widgetClienteInteragiuComAPagina = true;
                break;
              case 'widgetContakoConversaInputConversa':
                contako.widgetAtendimentoMensagensNaoLidas = 0;
                contako.widgetClienteInteragiuComAPagina = true;
                break;
              case 'widgetContakoIntegracoesSolicitouAtendimento':
                if (pConfiguracao.tipo === contako.instalacoes.integrada) verificarIntegracoes(pConfiguracao, parametroValor);
                break;
              case 'widgetContakoSetLocalStorage':
                setLocalStorage(parametroValor);
                break;
              case 'widgetContakoGetLocalStorage':
                getLocalStorage(parametroValor, true);
                break;
              case 'widgetContakoDeleteLocalStorage':
                deleteLocalStorage(parametroValor);
                break;
              case 'widgetContakoLimpaTodosLocalStorage':
                limparLocalStorage();
                break;
              case 'widgetContakoSolicitarVerificacaoCookiesHabilitados':
                widgetVerificarCookies(true);
                break;
              case 'widgetContakoAbrirPaginaContatoCliente':
                contako.encerrar(pIdCadastro);
                contako.widgetAtendimentoMensagensNaoLidas = 0;
                contako.widgetClienteInteragiuComAPagina = true;
                var win = window.open(parametroValor, '_self');
                win.focus();
                break;
            }
          } catch (error) {
            logErro(error, 'verificarEventosWidget', eventPostMessage);
            const removeEvent = (eventMethod === "addEventListener") ? "removeEventListener" : "detachEvent";
            window[removeEvent](messageEvent);
            return;
          }
        } else{
          const removeEvent = (eventMethod === "addEventListener") ? "removeEventListener" : "detachEvent";
          window[removeEvent](messageEvent);
          return;
        }
      });
    } else return;
  };

  var setLocalStorage = function(pParametroValor) {
    if (pParametroValor !== null && pParametroValor !== undefined) localStorage.setItem(pParametroValor.nome, pParametroValor.valor);
  };

  var deleteLocalStorage = function(pParametroValor) {
    if (pParametroValor !== null && pParametroValor !== undefined) localStorage.removeItem(pParametroValor.nome);
  };

  var limparLocalStorage = function() {
    localStorage.clear();
  };

  // pParametroValor = { nome: string }
  var getLocalStorage = function(pParametroValor, enviarParaIframe = false) {
    if (pParametroValor !== null && pParametroValor !== undefined) {
      const valor = localStorage.getItem(pParametroValor.nome);
      if(enviarParaIframe) enviarEventosIframe({ tipo: 'getLocalStorage', valor: JSON.stringify({ nome: pParametroValor.nome , valor: valor}) });
      return valor;
    }
  };

  var verificarIntegracoes =  function (pConfiguracao, pParametroValor) {
    var nomeEvento = "Solicitou Atendimento Contako";
    if(pConfiguracao.integracoes !== null && pConfiguracao.integracoes !== undefined) {
      if (pConfiguracao.integracoes.rdStation.ativa) capturaLeadRDStation(pConfiguracao.integracoes.rdStation, nomeEvento, pParametroValor);
      if (pConfiguracao.integracoes.facebookAds.ativa) capturaLeadFacebookAds(pConfiguracao.integracoes.facebookAds, nomeEvento);
      if (pConfiguracao.integracoes.analytics.ativa) capturaLeadAnalytics(pConfiguracao.integracoes.analytics, nomeEvento);
    }
  };

  var capturaLeadRDStation = function(pIntegracaoRDStation, pNomeEvento, pParametroValor) {
    var parametros = (pParametroValor !== null && pParametroValor !== undefined) ? pParametroValor.split(',') : '';
    if (parametros !== '') {
      if (window.RdIntegration != undefined) {
        var data_array = [
            { name: "email", value: parametros[0] },
            { name: "identificador", value: pNomeEvento },
            { name: "nome", value: parametros[1] },
            { name: "token_rdstation", value: pIntegracaoRDStation.token }
        ];

        if (parametros[2] !== null && parametros[2] !== undefined && parametros[2] !== '') {
          var camposPersonalidos = parametros[2].replace('[', '').replace(']', '');
          var listaCamposPersonalidos = (camposPersonalidos !== null && camposPersonalidos !== undefined) ? camposPersonalidos.split(';') : '';
            for (i = 0; i < listaCamposPersonalidos.length; i++) {
                var campo = listaCamposPersonalidos[i].split('-');
                data_array.push({
                  name: campo[0],
                  value: campo[1]
                });
            }
        }

        try {
          RdIntegration.post(data_array);
        } catch (ex) {
          console.warn("[CONTAKO] Erro ao tentar enviar o lead para o RDStation: " + ex.message);
        }

      } else console.warn("[CONTAKO] O script do RDStation (RdIntegration) não foi encontrado em seu site.");
    }
  };

  var capturaLeadFacebookAds = function(pIntegracaoFacebookAds, pNomeEvento) {
    if (window.fbq != undefined) {
      try {
        fbq("trackCustom", pNomeEvento);
      } catch (ex) {
        console.warn("[CONTAKO] Erro ao tentar enviar o evento [" + pNomeEvento + "] para o Facebook Ads: " + ex.message);
      }
    }
    else console.warn("[CONTAKO] O pixel do Facebook Ads não foi encontrado em seu site.");
  };

  var capturaLeadAnalytics = function(pIntegracaoAnalytics, pNomeEvento) {
    if (window.ga != undefined) {
        try {
          ga("send", {
              hitType: "event",
              eventCategory: pIntegracaoAnalytics.categoriaEvento,
              eventAction: pIntegracaoAnalytics.nomeEvento,
              eventLabel: pIntegracaoAnalytics.labelEvento
          });
        } catch (ex) {
          console.warn("[CONTAKO] Erro ao tentar enviar o evento para o Analytics: " + ex.message);
        }
    }
    else console.warn("[CONTAKO] O script do Google Analytics não foi encontrado em seu site.");
  };


  var notificacaoSonoraNovaMensagemRecebida = function() {
    if (contako.widgetClienteInteragiuComAPagina) {
      let audio = new Audio('assets/audio/mensagem.mp3').play();
      audio = null;
    }
  };

  var exibirOuNaoExibirAtendimentoMensagensNaoLidas = function(exibir) {
    let tempoTrocaNotificacao = 1000;
    let textoNovaMensagem = 'Nova Mensagem (';
    if (window.document.title.indexOf(textoNovaMensagem) > -1) window.document.title = '';

    if (contako.widgetAtendimentoMensagensNaoLidas > 0 && exibir) {
      window.document.title = textoNovaMensagem + contako.tituloSiteCliente + ')';
      setTimeout(() => exibirOuNaoExibirAtendimentoMensagensNaoLidas(false), tempoTrocaNotificacao);
    } else if (contako.widgetAtendimentoMensagensNaoLidas > 0 && !exibir) {
      window.document.title = contako.tituloSiteCliente;
      setTimeout(() => exibirOuNaoExibirAtendimentoMensagensNaoLidas(true), tempoTrocaNotificacao);
    } else {
      window.document.title = contako.tituloSiteCliente;
      setTimeout(() => exibirOuNaoExibirAtendimentoMensagensNaoLidas(false), tempoTrocaNotificacao);
    }
  };

  var verificarPermissaoNotificacoesNavegador = function () {
    contako.permisssaoParaExibirNotificacoesNoNavegador = false;
    if (!('Notification' in window)) return;
    else if (Notification.permission === 'granted') {
      contako.permisssaoParaExibirNotificacoesNoNavegador = true;
      return
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        if (permission === 'granted') contako.permisssaoParaExibirNotificacoesNoNavegador = true;
        else contako.permisssaoParaExibirNotificacoesNoNavegador = false;
        return;
      });
    }
  };

  var notificacaoPushNovaMensagem = function(pConfiguracao, parametroValor) {
    if (contako.widgetContakoSessao !== null && contako.widgetContakoSessao !== undefined) {
      var sessao = getLocalStorage({ nome: contako.widgetContakoSessao }, false);
      var widgetSessaoValido = (contako.widgetSessao !== null && contako.widgetSessao !== undefined);
      var widgetPertencenteAoToken = (sessao !== null && sessao !== undefined && widgetSessaoValido) ? (sessao === contako.widgetSessao) : true;
      if (contako.permisssaoParaExibirNotificacoesNoNavegador && widgetPertencenteAoToken && contako.widgetClienteInteragiuComAPagina) {
        const iconURL = (pConfiguracao !== null && pConfiguracao !== undefined) ? pConfiguracao.urlLogoTipo : null;
        const notificacao = criarNotificacaoNavegador({
          opt: {
            body: 'Você recebeu uma nova mensagem em ' + contako.tituloSiteCliente,
            icon: ((iconURL !== null && iconURL !== undefined && iconURL !== '') ? iconURL : contako.urlImagemContakoPadrao)
          },
          title: (parametroValor !== null && parametroValor !== undefined && parametroValor !== '') ? 'Nova mensagem de ' + parametroValor : 'Nova mensagem',
        }, pWindow.url, true);
      }
    }
  };

  var criarNotificacaoNavegador = function (opcoes, linkAbrir, fechamentoAutomatico) {
    const notificacao = new Notification(opcoes.title, opcoes.opt);
    notificacao.onclick = () => (window.focus(), notificacao.close());

    if (fechamentoAutomatico) setTimeout(notificacao.close.bind(notificacao), 2000);
    return notificacao;
  };

  /*var getCurrentPosition_success = function(position) {
    var localizacao = {};
    if (position !== null && position !== undefined) {
      localizacao.ClienteLatitude = position.coords.latitude;
      localizacao.ClienteLongitude = position.coords.longitude;
      enviarEventosIframe({ tipo: 'localizacaoCliente', localizacao: JSON.stringify(localizacao) });
    }
  };*/

  var verificarSolicitarPermissaoGeolocalizacao = function () {
    /*if (navigator.geolocation !== null && navigator.geolocation !== undefined) {
      navigator.geolocation.getCurrentPosition(position => (getCurrentPosition_success(position)), error => {},{ enableHighAccuracy: true });
    }*/
  };

  var enviarEventosIframe = function (mensagem) {
    const iframe = document.getElementById('widgetAtendimentoFrame');
    if (iframe !== null && iframe !== undefined && window.location.protocol !== 'file:') iframe.contentWindow.postMessage(mensagem, '*');
  };

  var atendimentoAberto = function (pAberto) {
    setLocalStorage({ nome: contako.atendimentoAberto, valor: pAberto });
  };

  var atendimentoFluxoFechado = function() {
    if (widgetVerificarCookies()) localStorage.removeItem(contako.atendimentoFluxoSessaoToken);
  };

  var verificarAjusteLarguraPagina = function (pConfiguracao, pIdCadastro) {
    window.parent.onresize = () => analisarDimensoesPagina(pConfiguracao, pIdCadastro);
  };

  var requerirCapturarAudio = function () {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const audioTrilhas = [];
      contako.mediaRecorder = new MediaRecorder(stream);
      contako.mediaRecorder.ondataavailable = data => audioTrilhas.push(data.data);
      contako.mediaRecorder.onstop = () => {
        const blob = new Blob(audioTrilhas, { type: 'audio/ogg; code=opus' });
        const reader = new window.FileReader();

        reader.readAsDataURL(blob);
        reader.onloadend = () => (enviarEventosIframe({ tipo: 'audio', audio: blob, tamanho: blob.size }));
      };
      contako.mediaRecorder.start();
    }, (err) => enviarEventosIframe({ tipo: 'audio-erro', erro: err })).catch((erro) => enviarEventosIframe({ tipo: 'audio-erro', erro: erro }));
  };

  var pararCapturaAudio = function () {
    contako.mediaRecorder.stop();
  };

  var analisarDimensoesPagina = function (pConfiguracao, pIdCadastro) {
    const larguraPagina = window.parent.window.innerWidth;
    const alturaPagina = window.parent.window.innerHeight;

    if (larguraPagina <= 800 ) {
      contako.telaMobile = true;
      contako.telaDesktop = false;
      enviarEventosIframe({ tipo: 'resize', desktop: contako.telaDesktop });
      ajustarWidgetConformeLarguraEAlturaPagina(pConfiguracao, pIdCadastro, larguraPagina, alturaPagina);
    } else if (larguraPagina > 800) {
      contako.telaDesktop = true;
      contako.telaMobile = false;
      enviarEventosIframe({ tipo: 'resize', desktop: contako.telaDesktop });
      ajustarWidgetConformeLarguraEAlturaPagina(pConfiguracao, pIdCadastro, larguraPagina, alturaPagina);
    }
  };

  var ajustarWidgetConformeLarguraEAlturaPagina = function (pConfiguracao, pIdCadastro, pLarguraPagina, pAlturaPagina) {
    const iframe = document.getElementById(`widgetJanelaContako${pIdCadastro}`);
    if (contako.telaMobile) {
      adicionarRemoverClassesRootSiteCliente(contako.widgetAberto);
      if (iframe !== null && iframe !== undefined && contako.widgetAberto) {
        iframe.style += ajustarTamanhoJanela(pIdCadastro,pLarguraPagina, pAlturaPagina, true);
        iframe.style += ajustarPosicaoJanelaConformeMedidasConfiguracao(pConfiguracao, pIdCadastro,true);
      }
    } else if (contako.telaDesktop) {
      adicionarRemoverClassesRootSiteCliente(false);
      if (iframe !== null && iframe !== undefined && contako.widgetAberto) {
        iframe.style += ajustarTamanhoJanela(pIdCadastro,pLarguraPagina, pAlturaPagina);
        iframe.style += ajustarPosicaoJanelaConformeMedidasConfiguracao(pConfiguracao, pIdCadastro);
      }
    }
  };

  var adicionarRemoverClassesRootSiteCliente = function(adicionar = true) {
    if (adicionar) {
      pWindow.document.getElementsByTagName('html')[0].classList.add('configuracaoContakoWidgetMobile');
      pWindow.document.getElementsByTagName('body')[0].classList.add('configuracaoContakoWidgetMobile');
    } else {
      pWindow.document.getElementsByTagName('html')[0].classList.remove('configuracaoContakoWidgetMobile');
      pWindow.document.getElementsByTagName('body')[0].classList.remove('configuracaoContakoWidgetMobile');
    }
  };

  var ajustarTamanhoJanela = function(pIdCadastro, pLarguraPagina, pAlturaPagina, resetMobile = false) {
    var element = document.getElementById('widgetJanelaContako' + pIdCadastro);
    if (!resetMobile) {
      var r = `max-height: 100%;max-width:100%;`;
      return (element !== null && element !== undefined) ? element.style = r : r;
    } else if (resetMobile){
      var r1 = `max-height: ${pAlturaPagina} !important;max-width:${pLarguraPagina} !important`;
      return (element !== null && element !== undefined) ? element.style = r1 : r1;
    }
  };

  var verificarParametrosPersonalizados = function (pParametros, pUrlOrigem, pUrlOrigemCors, pDominioOrigem) {
    var queryParametros = '';
    pParametros = (pParametros !== null && pParametros !== undefined) ? pParametros : {};

    queryParametros = '?';
    queryParametros += `cors=${pUrlOrigemCors}`;
    queryParametros += `&urlOrigem=${pUrlOrigem}${(pParametros !== null && pParametros !== undefined && pParametros !== '') ? '&' : ''}`;

    var index = 0;
    var parametros = Object.entries(pParametros);
    for (const [key, value] of parametros) {
      index++;
      var parametroValue = '';
      var parametroString = '';
      if (key !== 'camposPersonalizados') {
        parametroValue = value.toString().replace(/[*+#?^${}()|[\]\\]/g, '');
        parametroString = ((index > 1) ? "&" : '') + key + "=" + parametroValue;
        queryParametros += parametroString;
      } else {
        let camposPersonalizados = value;
        for (const [key, value] of Object.entries(camposPersonalizados)) {
          parametroValue = value.toString().replace(/[*+#?^${}()|[\]\\]/g, '');
          parametroString = ((index > 1) ? "&" : '') + key + "=" + parametroValue;
          queryParametros += parametroString;
        }
      }
    }
    return queryParametros;
  };

  var verificarParametrosConfiguracaoWidget = function (pParametros, pConfiguracoes, pCookiesAtivos) {
    const corTextoPadrao = '#FFFF';
    const corFundoPadrao = '#3A3B3D';
    if (pParametros !== null && pParametros !== undefined) {
      contako.widgetBotConfiguraco = (pParametros.idFluxo > 0 );

      pConfiguracoes.tipo = (pParametros.tipo) ? pParametros.tipo : pConfiguracoes.tipo;
      pConfiguracoes.widget.urlLogoTipo = (pParametros.urlLogoTipo) ? pParametros.urlLogoTipo : pConfiguracoes.widget.urlLogoTipo;
      pConfiguracoes.widget.corTexto = (pParametros.corTexto) ? pParametros.corTexto : pConfiguracoes.widget.corTexto;
      pConfiguracoes.widget.corFundo = (pParametros.corFundo) ? pParametros.corFundo : pConfiguracoes.widget.corFundo;

      if (pParametros.janela) {
        pConfiguracoes.janela.right = (pParametros.janela.right) ? pParametros.janela.right : pConfiguracoes.janela.right;
        pConfiguracoes.janela.bottom = (pParametros.janela.bottom) ? pParametros.janela.bottom : pConfiguracoes.janela.right;
        pConfiguracoes.janela.left = (pParametros.janela.left) ? pParametros.janela.left : pConfiguracoes.janela.right;
        pConfiguracoes.janela.top = (pParametros.janela.top) ? pParametros.janela.top : pConfiguracoes.janela.right;
      }

      const paramAbrirAutoValido = (pParametros.abrirAutomaticamente !== null && pParametros.abrirAutomaticamente !== undefined && pParametros.abrirAutomaticamente !== '');
      pConfiguracoes.widget.abrirAutomaticamente = (paramAbrirAutoValido) ? pParametros.abrirAutomaticamente : pConfiguracoes.widget.abrirAutomaticamente;
    }
    pConfiguracoes.widget.corTexto = (pConfiguracoes.widget.corTexto !== '') ? pConfiguracoes.widget.corTexto : corTextoPadrao;
    pConfiguracoes.widget.corFundo = (pConfiguracoes.widget.corFundo !== '') ? pConfiguracoes.widget.corFundo : corFundoPadrao;

    pConfiguracoes.widget.corTexto = (pCookiesAtivos) ? pConfiguracoes.widget.corTexto : corTextoPadrao;
    pConfiguracoes.widget.corFundo = (pCookiesAtivos) ? pConfiguracoes.widget.corFundo : corFundoPadrao;

    contako.widgetAbrirAutomaticamente = pConfiguracoes.widget.abrirAutomaticamente;

    return pConfiguracoes;
  };


  var botaoAbrirWidget = function (pConfiguracao, pIdCadastro) {
    var b = pWindow.document.createElement('div');
    b.className = 'resetcontako widgetBotaoFlutuante widgetBotaoFlutuanteCarregado';
    b.id = 'widgetContako' + pIdCadastro;
    b.style =
      'color:' + pConfiguracao.widget.corTexto + ';background-color:' + pConfiguracao.widget.corFundo + ';border: 4px solid' + pConfiguracao.widget.corFundo + ';' +
      'right:' + verificarMedidasConfiguracao(pConfiguracao.janela.right) + ';left:' + verificarMedidasConfiguracao(pConfiguracao.janela.left) + ';' +
      'bottom:' + verificarMedidasConfiguracao(pConfiguracao.janela.bottom) + ';top:' + verificarMedidasConfiguracao(pConfiguracao.janela.top) + ';visibility: hidden;';
    var imOn = contako.urlBaseWidget + 'assets/img/contako-128x128-branco.png';
    var urlLogoValida = (pConfiguracao.widget.urlLogoTipo !== null && pConfiguracao.widget.urlLogoTipo !== undefined && pConfiguracao.widget.urlLogoTipo !== '');
    imOn = (urlLogoValida) ? pConfiguracao.widget.urlLogoTipo : imOn;
    b.innerHTML = "<img src='" + imOn + "' alt='Abrir chat' class='widgetContakoAbrirIcone'>";
    pWindow.document.body.append(b);
  };

  var botaoFecharWidget = function (pConfiguracao, pIdCadastro) {
    var b = pWindow.document.createElement('div');
    var inverterIcon = (pConfiguracao.janela.top !== 'auto');
    b.id = 'widgetContakoFechar' + pIdCadastro;
    b.className = 'resetcontako widgetBotaoFlutuante widgetContakoFechar';
    b.style =
      'color:' + pConfiguracao.widget.corTexto + ';background-color:' + pConfiguracao.widget.corFundo + ';border: 4px solid' + pConfiguracao.widget.corFundo + ';' +
      'right:' + verificarMedidasConfiguracao(pConfiguracao.janela.right) + ';left:' + verificarMedidasConfiguracao(pConfiguracao.janela.left) + ';' +
      'bottom:' + verificarMedidasConfiguracao(pConfiguracao.janela.bottom) + ';top:' + verificarMedidasConfiguracao(pConfiguracao.janela.top) + ';visibility: hidden;';
    b.innerHTML = "<span alt='Minimizar chat' title='Minimizar chat' class='widgetContakoFecharIcone'>" + minimizarSVG(pConfiguracao.widget.corTexto, inverterIcon) + "</span>";
    pWindow.document.body.append(b);
  };

  var verificarMedidasConfiguracao = function (medida) {
    return (medida !== 'auto') ? medida + 'em' : medida;
  };

  var ajustarPosicaoJanelaConformeMedidasConfiguracao = function (pConfiguracao, pIdCadastro, resetMobile = false) {
    var estiloPadraoMobile = '';
    var estiloPadrao = 'top: auto;left:auto;bottom:1em;right: 1em;';
    var element = document.getElementById('widgetJanelaContako' + pIdCadastro);
    if (!resetMobile && pConfiguracao !== null && pConfiguracao !== undefined) {
      var top =  pConfiguracao.janela.top;
      var left = pConfiguracao.janela.left;
      var right = pConfiguracao.janela.right;
      var bottom = pConfiguracao.janela.bottom;

      top = (top !== 'auto') ? parseFloat(top) + 3.5 + 'em' : top;
      left = (left !== 'auto') ? parseFloat(left) + 1 + 'em' : left;
      right = (right !== 'auto') ? parseFloat(right) + 1 + 'em' : right;
      bottom = (bottom !== 'auto') ? parseFloat(bottom) + 3.5 + 'em' : bottom;
      var r = 'left:' + left + ';top:' + top + ';right:' + right + ';bottom:' + bottom;
      return (element !== null && element !== undefined) ? element.style = r : r;
    } else if (resetMobile){
      return (element !== null && element !== undefined) ? element.style = estiloPadraoMobile : estiloPadraoMobile;
    } else {
      return (element !== null && element !== undefined) ? element.style = estiloPadrao : estiloPadrao;
    }
  };

  var janelaContako = function (pConfiguracao, pIdCadastro) {
    var j = pWindow.document.createElement('div');
    j.id = 'widgetJanelaContako' + pIdCadastro;
    j.className = 'resetcontako widgetJanelaContako';
    j.style = 'background-color: transparent !important;';
    return j;
  };

  var boxIframe = function (pIdCadastro) {
    var f = pWindow.document.createElement('div');
    f.id = "widgetBoxIframeContako" + pIdCadastro;
    f.className = 'resetcontako widgetBoxIframeContako';
    f.style = 'background-color: transparent !important;';
    return f;
  };

  var exibirJanela = function (pConfiguracao, pIdCadastro, pBoxJanelaContako) {
    var widgetJanelaFrame = pWindow.document.getElementById('widgetJanelaContako' + pIdCadastro);
    if (widgetJanelaFrame !== null && widgetJanelaFrame !== undefined) {
      analisarDimensoesPagina(pConfiguracao, pIdCadastro);
      widgetJanelaFrame.style.display = 'flex';
    } else {
      var janelaWidget = pBoxJanelaContako;
      pBoxJanelaContako.style = ajustarPosicaoJanelaConformeMedidasConfiguracao(pConfiguracao, pIdCadastro, contako.telaMobile);
      var iframe = boxIframe(pIdCadastro);
      janelaWidget.append(iframe);
      pWindow.document.body.append(janelaWidget);
    }
  };

  var verificarAmbiente = () => {
    return contako.urlBaseWidget.includes('localhost:');
  };

  var logErro = (erroMensagem, origem, obj) => {
    if (verificarAmbiente()) console.error(`ERROR- Origem: ${origem} | Mensagem: ${erroMensagem}`, obj);
  }

  var minimizarSVG = function (pCorTexto = null, inverter = false) {
    var style = (inverter) ? 'transform: rotate(180deg);' : '';
    return '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
      '<svg' +
      '   xmlns:dc="http://purl.org/dc/elements/1.1/"' +
      '  xmlns:cc="http://creativecommons.org/ns#"' +
      '  xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"' +
      '  xmlns:svg="http://www.w3.org/2000/svg"' +
      '  xmlns="http://www.w3.org/2000/svg"' +
      '  xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd"' +
      '   xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"' +
      '   sodipodi:docname="seta.svg"' +
      '   inkscape:version="1.0 (4035a4fb49, 2020-05-01)"' +
      '   id="svg86"' +
      '   version="1.1"' +
      '   viewBox="0 0 12.7 12.7"' +
      '   style="margin-top: 24%;' + style + '"' +
      '   height="25"' +
      '   width="28">' +
      '  <defs' +
      '     id="defs80" />' +
      '  <sodipodi:namedview' +
      '     inkscape:window-maximized="0"' +
      '     inkscape:window-y="0"' +
      '     inkscape:window-x="0"' +
      '     inkscape:window-height="728"' +
      '     inkscape:window-width="1366"' +
      '     units="px"' +
      '     showgrid="false"' +
      '     inkscape:document-rotation="0"' +
      '     inkscape:current-layer="layer1"' +
      '     inkscape:document-units="mm"' +
      '     inkscape:cy="24"' +
      '     inkscape:cx="24"' +
      '     inkscape:zoom="11.208333"' +
      '     inkscape:pageshadow="2"' +
      '     inkscape:pageopacity="0.0"' +
      '     borderopacity="1.0"' +
      '     bordercolor="#666666"' +
      '     pagecolor="#ffffff"' +
      '     id="base" />' +
      '  <metadata' +
      '     id="metadata83">' +
      '    <rdf:RDF>' +
      '      <cc:Work' +
      '         rdf:about="">' +
      '       <dc:format>image/svg+xml</dc:format>' +
      '        <dc:type' +
      '           rdf:resource="http://purl.org/dc/dcmitype/StillImage" />' +
      '        <dc:title></dc:title>' +
      '      </cc:Work>' +
      '    </rdf:RDF>' +
      '  </metadata>' +
      '  <g' +
      '     id="layer1"' +
      '     inkscape:groupmode="layer"' +
      '     inkscape:label="Layer 1">' +
      '    <path' +
      '       sodipodi:nodetypes="ccccccccccc"' +
      '       transform="scale(0.26458333)"' +
      '       d="M 0.44726562,15.371094 12.375,27.322266 24.302734,39.273438 35.947266,27.328125 47.589844,15.384766 41.792969,13.382812 35.947266,19.328125 24.302734,31.273438 12.375,19.322266 6.4335938,13.373047 Z"' +
      '       inkscape:transform-center-y="1.0527829"' +
      '       inkscape:transform-center-x="0.024985241"' +
      '       style="fill:' + ((pCorTexto !== null && pCorTexto !== undefined) ? pCorTexto : '#FFF') + ';stroke-width:0.818413"' +
      '       id="path96" />' +
      '  </g>' +
      '</svg>';
  };
})(window);

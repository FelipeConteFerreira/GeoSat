# 🌱 GeoSat — Monitoramento Agrícola via Satélite

Aplicativo mobile (React Native + Expo) desenvolvido para a **Global Solution 2026/1 — Mobile Application Development (FIAP)**.

O GeoSat permite que produtores rurais monitorem suas plantações (talhões): cadastram culturas, registram leituras de temperatura e umidade do solo e recebem análises de risco (seca / frio crítico). Todos os dados são armazenados e manipulados via **API REST em Java**, nunca apenas no dispositivo.

---

## 👥 Integrantes


| Nome | RM | Turma |
|------|----|-------|
| Felipe Conte Ferreira | RM 562248 | 2TDS |
| Altamir Lima | RM 562906 | 2TDS |
| Olavo Porto Neves | RM 563558 | 2TDS |
| Luiz Gustavo | RM 564495 | 2TDS |
| Pedro Henrique Dias França | RM 561940 | 2TDS |

---

## 🎬 Vídeo de demonstração


▶️ **YouTube:** [link do vídeo no Youtube](https://youtube.com/shorts/zOjwqBz2qog)

---

## 📱 Funcionalidades

- **Login** com autenticação JWT (access + refresh token) na API.
- **Início:** resumo das plantações, temperatura média, ações rápidas.
- **Dicas:** 8 dicas ilustradas para uma boa plantação.
- **Minhas Plantações:** lista com pull-to-refresh e exclusão.
- **Monitoramento:** última leitura registrada com análise de temperatura.
- **Detalhes:** dados completos do talhão, editar e apagar.
- **Adicionar / Editar Plantação:** formulários com validação.
- **Perfil:** dados do usuário logado e logout.

### CRUD completo via API (Fetch)

| Operação | Endpoint |
|----------|----------|
| Create | `POST /talhoes`, `POST /sensores`, `POST /leituras` |
| Read | `GET /talhoes/propriedade/{id}`, `GET /leituras/...` |
| Update | `PUT /talhoes/{id}` |
| Delete | `DELETE /talhoes/{id}` |

---

## 🔑 Credenciais de teste

A API exige login. Use a conta de teste abaixo:

<!-- TODO: confirmar/criar a conta de teste na API antes da entrega -->

```
E-mail: felipe@teste.com
Senha:  123456
```

O campo **Nome** da tela de login é usado apenas para montar o perfil local — pode digitar qualquer nome.

---

## ⚠️ Aviso importante — cold start da API (Render)

A API Java está hospedada no plano gratuito do Render:

```
https://geosat-java.onrender.com
```

Após um período sem uso, o servidor "hiberna" e a **primeira requisição pode levar até 1 minuto** para responder. Se o login falhar na primeira tentativa, **aguarde alguns segundos e tente novamente** — não é um bug do aplicativo.

---

## 🚀 Como executar

Pré-requisitos: [Node.js LTS](https://nodejs.org/) e o app **Expo Go** no celular (ou um emulador Android/iOS).

```bash
# 1. Clonar o repositório
git clone https://github.com/FelipeConteFerreira/GeoSat.git
cd GeoSat

# 2. Instalar as dependências
npm install

# 3. Iniciar o projeto
npx expo start
```

Depois, escaneie o QR Code com o Expo Go (Android) ou com a câmera (iOS), ou pressione `a` para abrir no emulador Android.

### Usando uma API local (opcional)

Se preferir rodar a API Java localmente em vez do Render, altere a URL em `config/api.js`:

```js
// config/api.js
export const API_BASE_URL = 'http://SEU_IP_LOCAL:8080';
```

> Use o IP da sua máquina na rede (ex.: `http://192.168.0.10:8080`), não `localhost`, para que o celular consiga acessar.

---

## 🗂️ Arquitetura do projeto

```
GeoSat/
├── App.js                  # Entry point: fontes, providers e navegação
├── assets/dicas/           # Imagens personalizadas das dicas
├── components/             # Componentes reutilizáveis (LoadingScreen)
├── config/                 # api.js (URL/storage keys) e theme.js (fontes/cores)
├── context/                # AuthContext, UsuarioContext, PlantacaoContext
├── data/                   # Dados estáticos (dicas de plantação)
├── navigation/             # StackNavigator + TabNavigator (React Navigation)
├── screens/                # 9 telas do aplicativo
├── services/               # apiClient (fetch + JWT), geosatApi, tokenStore
└── utils/                  # Validadores e avaliação de temperatura
```

- **Navegação:** React Navigation (Native Stack + Bottom Tabs).
- **Estado global:** Context API (`Auth`, `Usuario`, `Plantacao`).
- **API:** Fetch com tratamento de erros (`ApiError`), refresh automático de token em 401 e feedback visual (`Alert`, `ActivityIndicator`, `RefreshControl`).
- **Identidade visual:** verde agrícola (#2E7D32), fonte **Poppins** (Google Fonts) e imagens personalizadas.
- **Qualidade:** ESLint (`eslint-config-expo`) + Prettier — `npm run lint`.

---

## 🛠️ Tecnologias

- [Expo SDK 54](https://expo.dev/) / React Native 0.81
- [React Navigation 7](https://reactnavigation.org/)
- [@expo-google-fonts/poppins](https://github.com/expo/google-fonts)
- AsyncStorage (apenas para sessão: tokens e e-mail)
- API REST Java (Spring Boot) hospedada no Render

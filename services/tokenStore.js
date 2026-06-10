let tokensEmMemoria = null;
let aoAtualizarTokens = null;

export function normalizarTokens(tokens) {
  if (!tokens) return null;
  return {
    accessToken: String(tokens.accessToken ?? '').trim(),
    refreshToken: String(tokens.refreshToken ?? '').trim(),
    expiresIn: tokens.expiresIn,
    role: tokens.role,
  };
}

export function definirTokens(tokens) {
  tokensEmMemoria = normalizarTokens(tokens);
  if (aoAtualizarTokens && tokensEmMemoria) {
    aoAtualizarTokens(tokensEmMemoria);
  }
  return tokensEmMemoria;
}

export function obterTokens() {
  return tokensEmMemoria;
}

export function limparTokensMemoria() {
  tokensEmMemoria = null;
}

export function registrarCallbackTokens(callback) {
  aoAtualizarTokens = callback;
}

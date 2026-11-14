(function(){
  "use strict";
  const link=document.getElementById("contaLink");
  if(!link||!window.CashyAPI)return;
  CashyAPI.auth.me().then((result)=>{
    const authenticated=Boolean(result&&result.authenticated);
    link.href=authenticated?"dashboard.html":"login.html";
    link.textContent=authenticated?"Minha conta":"Entrar";
  }).catch(()=>{
    link.href="login.html";
    link.textContent="Entrar";
  });
})();

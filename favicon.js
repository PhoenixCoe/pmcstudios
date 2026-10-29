/* PMC favicon: the big M, in whatever two colours a page asks for. Usage: pmcFavicon('#1A4934', '#F2E4CE') */
(() => {
    const M = 'M1264.16 741.211L1516.85 3.66211H1741.7V1190.81H1742.03V1281.33H2527.92V1453.42H1569.94V1190.81H1570.31V395.508L1285.4 1192.38L1263.43 1251.96L1241.46 1192.38L958.008 409.424V1192.38H957.979V1453.42H0V1281.33H785.889V3.66211H1012.94L1264.16 741.211Z';
    const make = (bg, fg) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect fill="' + bg + '" width="64" height="64"/><clipPath id="c"><rect x="700" y="0" width="1140" height="1460"/></clipPath><path fill="' + fg + '" clip-path="url(#c)" transform="translate(-11.493 7.000) scale(0.03425)" d="' + M + '"/></svg>';
    window.pmcFavicon = (bg, fg) => {
      let l = document.querySelector('link[rel~="icon"][type="image/svg+xml"]');
      if (!l) { l = document.createElement('link'); l.rel = 'icon'; l.type = 'image/svg+xml'; document.head.appendChild(l); }
      l.href = 'data:image/svg+xml,' + encodeURIComponent(make(bg, fg));
    };
  })();
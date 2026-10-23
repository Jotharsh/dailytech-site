# dailytech.build

**Live: <https://jotharsh.github.io/dailytech-site/>**

The portfolio site for dailytech.build: one small app, built and shipped every day, in public. It shows the four builds so far (LumaBar, SiteSnap, Brink, Joinbar) with their real screenshots, honest test status and links.

Plain HTML and CSS with [GSAP](https://gsap.com) (ScrollTrigger) and [Lenis](https://lenis.darkroom.engineering) for the motion. No framework.

## Run it

```sh
npm install
npm run dev        # develop
npm run build      # makes dist/, ready to host anywhere
npm run preview    # look at the built site
```

## What is where

```
index.html        the page: every section and every word
src/style.css     colours, type sizes and layout (the tokens are at the top)
src/main.js       the motion: the headline, the pinned builds, the reveals
public/media/     screenshots and the Brink clip
public/fonts/     Inter (SIL Open Font Licence)
```

## Add a build

Copy one `<article class="project">` block in `index.html`, change the text and the pictures in `public/media/`, add a row to the `<ol class="index">`, and raise `--n` on the `.work` section (it is the number of builds, and sets how long the pinned part scrolls). Update `main.js` only if the new build has a video.

## Notes

- The page works without JavaScript (the builds simply stack), and with reduced motion on (nothing slides, everything shows).
- The pinned "builds" section is for screens 1000px wide and up; on a phone each build stacks.
- Brand: ground `#0d0d0d`, ink `#f4f1ea`, accent `#ff5a1f`, set in Inter; the orange square is the dot in the name.

MIT licence for the code. The screenshots show the apps in this portfolio.

## Publishing

The built site is served by GitHub Pages from the `gh-pages` branch (the `main` branch holds the source). To update it:

```sh
npm run build
cd dist
git init -q && git checkout -q -b gh-pages && touch .nojekyll
git add -A && git commit -qm "Deploy" && git remote add origin <this repo's address>
git push -f origin gh-pages
```

A custom domain later: add a `CNAME` file containing the domain to `public/`, rebuild and redeploy, then set the domain's DNS records as GitHub's Pages documentation describes.

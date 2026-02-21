import { createRouter, createWebHashHistory } from "vue-router";

import ArctangentPoster from "../components/ArctangentPoster/ArctangentPoster.vue";
import Gallery from "../components/Gallery/Gallery.vue";

const routes = [
  { path: "/", component: ArctangentPoster },
  { path: "/arctangent", name: "ArcTanGent", component: ArctangentPoster },
  { path: "/gallery", name: "Gallery", component: Gallery },
];

const router = createRouter({
  history: createWebHashHistory(), // 🔹 use hash mode
  routes,
});

export default router;

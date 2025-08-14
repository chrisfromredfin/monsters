// icons
const svgModules = import.meta.glob('$lib/assets/*.svg', { eager: true });
export const iconMap: Record<string, string> = {};
for (const p in svgModules) {
  const key = p.split('/').pop()!.replace('.svg', '').toLowerCase();
  // @ts-ignore
  iconMap[key] = svgModules[p].default;
}

// monster images
const imgModules = import.meta.glob('$lib/assets/monsters/*.png', { eager: true });
export const monsterImageMap: Record<string, string> = {};
for (const p in imgModules) {
  const key = p.split('/').pop()!.replace('.png', '');
  // @ts-ignore
  monsterImageMap[key] = imgModules[p].default;
}

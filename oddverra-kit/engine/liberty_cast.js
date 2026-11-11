// [LIB-cast] "The Statue of Liberty was supposed to stand in Egypt": outfit table (merged into ODD by main.js).
// New oddverra_next.js features used here (all marked [LIB-cast] there): frock coat (o.frock), cravat (neck 'cravat'), fez / turban / ladyhat,
// stambouline (high collar, gold braid o.braid, star decoration o.star), monocle, galabiya robe, bustle dress, plaster dust, double-breasted (o.dbl).
const BY = { frock: true, coat: true, shirt: '#2f2b3c', pants: '#6a6270', waistcoat: '#9a7e62', collar: '#f4f1e8', cuff: '#2f2b3c', neck: 'cravat', neckCol: '#2a2232', button: '#2a2232',
  hair: 'side', hairCol: '#2a1c16', moustache: '#2a1c16', beard: 'full', beardShort: true, beardK: 0.42, beardCol: '#2a1c16', brow: '#2a1c16',
  build: 'thin', head: 'egg', skin: '#f0c4a0', nose: 'long', shoes: '#1e1a1e' };
const BO = { ...BY, shirt: '#3a3646', cuff: '#3a3646', pants: '#4a4450', waistcoat: '#6e6670', hairCol: '#6e6660', moustache: '#a8a29a', beardCol: '#b4aea6', brow: '#6e6660', beardK: 0.7, build: 'adult', age: true };
const KH = { stambouline: true, shirt: '#1f2236', pants: '#1f2236', cuff: '#1f2236', braid: '#d8b048', star: true, button: '#d8b048', hat: 'fez', hatCol: '#b4202c',
  hair: 'short', hairCol: '#4a4440', beard: 'full', beardShort: true, beardK: 0.66, beardCol: '#8a8480', moustache: '#7a7470', brow: '#5a5450',
  build: 'stout', head: 'round', skin: '#dba67e', nose: 'round', shoes: '#1a1618', noChain: true };
export const LIB_ODD = {
  BARTHOLDI_YOUNG: BY,
  BARTHOLDI_OLD: BO,
  BARTHOLDI_OLD_HAT: { ...BO, hat: 'top', hatCol: '#26222c' },
  KHEDIVE: KH,
  KHEDIVE_MONO: { ...KH, monocle: true },
  ADVISER: { stambouline: true, shirt: '#3a3a4c', pants: '#3a3a4c', cuff: '#3a3a4c', button: '#b8a070', hat: 'fez', hatCol: '#9a1e28', hair: 'short', hairCol: '#1e1612', moustache: '#1e1612', brow: '#1e1612',
    build: 'thin', head: 'egg', skin: '#c8906a', nose: 'long', shoes: '#2a2224', glasses: 'pincenez', noChain: true },
  WORKER1: { galabiya: '#e6dcc6', shirt: '#e6dcc6', pants: '#c8bca4', cuff: '#e6dcc6', hat: 'turban', hatCol: '#f2ece0', hair: 'short', hairCol: '#1a1210', moustache: '#1a1210', brow: '#1a1210',
    build: 'thin', head: 'egg', skin: '#a8704a', sandals: true, shoes: '#7a5434', noButtons: true },
  WORKER2: { galabiya: '#4e6286', shirt: '#4e6286', pants: '#c8bca4', cuff: '#4e6286', hat: 'turban', hatCol: '#d8c8a4', hair: 'short', hairCol: '#140e0c', beard: 'full', beardShort: true, beardK: 0.55, beardCol: '#1e1612', moustache: '#1e1612', brow: '#1a1210',
    build: 'adult', head: 'round', skin: '#8a5a3e', sandals: true, shoes: '#6a4a2e', noButtons: true },
  PARISIAN: { shirt: '#ece6d6', pants: '#5a5048', vest: '#6a5a4a', rolled: true, apron: '#ebe5d6', plaster: true, hat: 'cap', hatCol: '#5a5048', plainCap: true, hair: 'short', hairCol: '#7a4a2a', moustache: '#7a4a2a',
    build: 'adult', head: 'round', skin: '#f2c8a6', noButtons: true, shoes: '#3a2a20' },
  NY_MAN: { shirt: '#3a3a4a', pants: '#34343f', vest: '#5a4a3a', neck: 'tie', neckCol: '#7a2a2e', tieK: 0.7, collar: '#f4f1e8', hat: 'bowler', hatCol: '#2a2420', hair: 'side', hairCol: '#5a3a24', moustache: '#5a3a24',
    build: 'adult', head: 'wide', skin: '#f2c8a4', shoes: '#1e1a1e' },
  NY_WOMAN: { lashes: true, bustle: true, shirt: '#6a3a5c', pants: '#6a3a5c', collar: '#f2e8e0', cuff: '#f2e8e0', hat: 'ladyhat', hatCol: '#3a2a3a', featherCol: '#e8a040', hair: 'bun', hairCol: '#4a2a1c',
    head: 'egg', skin: '#f2c8a6', shoes: '#2a1e22' },
  NY_KID: { shirt: '#4a5a7a', pants: '#5a4a3a', hat: 'cap', hatCol: '#3a3a44', plainCap: true, neck: 'scarf', neckCol: '#c0453a', hair: 'short', hairCol: '#b07a3a', build: 'kid', head: 'round', skin: '#ffe2c2', shoes: '#3a2a20' },
  KEEPER: { dbl: true, shirt: '#1e2a48', pants: '#1e2a48', cuff: '#1e2a48', button: '#e0b84a', collar: '#f2f0ea', neck: 'tie', neckCol: '#141a2a', tieK: 0.6, hat: 'cap', hatCol: '#18213c', plainCap: true, capBadge: true,
    hair: 'short', hairCol: '#6a4a30', beard: 'full', beardShort: true, beardK: 0.6, beardCol: '#7a5434', moustache: '#7a5434', build: 'stout', head: 'wide', skin: '#ecb890', nose: 'round', shoes: '#141418' },
};
// [LIB-cast] per-actor options main.js passes through to oddverra (c2opts): poses, props, monocle drop, scroll length, lantern light
const LIB_OPS = ['raise', 'palm', 'handsUp', 'clasp', 'slump', 'shake', 'headYaw', 'sketch', 'sketch2', 'scrollLen', 'monoclePop', 'lit', 'look'];
export const libOpts = (op) => { const r = {}; for (const k of LIB_OPS) if (op[k] !== undefined) r[k] = op[k]; return r; };

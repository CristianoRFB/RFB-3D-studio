import { getProduct, type AddonId, type ProductId } from './catalog';
import { COLORS, type StudioConfig } from './studio';

export function Preview2D({ productId, colorId, addonId }: { productId: ProductId; colorId: StudioConfig['colorId']; addonId?: AddonId }) {
  const fill = COLORS.find(c => c.id === colorId)?.hex ?? COLORS[0].hex;
  return <svg className="product-svg" viewBox="0 0 280 330" role="img" aria-label={'Ilustração 2D: ' + getProduct(productId).name}>
    <ellipse cx="140" cy="301" rx="78" ry="11" fill="#080e1d" opacity=".45" />
    {productId === 'aura' && <>
      <path d="M105 55h70v20c0 9 14 15 20 28v164c0 24-22 28-55 28s-55-4-55-28V103c6-13 20-19 20-28Z" fill={fill} stroke="#e8e5ff" strokeOpacity=".5" strokeWidth="2" />
      <rect x="108" y="35" width="64" height="30" rx="7" fill="#c8cfde" />
      <rect x="103" y="32" width="74" height="10" rx="4" fill="#252c3f" />
      <path d="M92 115v143" stroke="#fff" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round" />
    </>}
    {productId === 'orbita' && <>
      <rect x="126" y="171" width="28" height="113" rx="8" fill={fill} />
      <ellipse cx="140" cy="285" rx="65" ry="12" fill="#343e59" />
      <circle cx="140" cy="117" r="82" fill={fill} stroke="#dce2f0" strokeWidth="7" />
      <path d="M99 75Q145 35 186 96" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="12" strokeLinecap="round" />
    </>}
    {productId === 'nexo' && <>
      <path d="M72 81Q84 222 90 282Q140 309 190 282Q196 222 208 81Z" fill={fill} stroke="#e9e5ff" strokeOpacity=".65" strokeWidth="3" />
      <ellipse cx="140" cy="81" rx="68" ry="17" fill="#2e3650" stroke={fill} strokeWidth="10" />
      <path d="M89 124L102 267" stroke="#fff" strokeOpacity=".22" strokeWidth="10" strokeLinecap="round" />
    </>}
    {addonId === 'alca' && productId === 'aura' && <ellipse cx="194" cy="112" rx="34" ry="47" fill="none" stroke="#cbd7e7" strokeWidth="13"/>}
    {addonId === 'base' && productId === 'orbita' && <ellipse cx="140" cy="290" rx="82" ry="20" fill="none" stroke="#aa9fc6" strokeWidth="10"/>}
    {addonId === 'suporte' && productId === 'nexo' && <rect x="65" y="280" width="150" height="18" rx="8" fill="#afb8d1"/>}
    {addonId === 'gravacao' && <rect x="107" y="194" width="66" height="16" rx="4" fill="#fff4dc"/>}
  </svg>;
}

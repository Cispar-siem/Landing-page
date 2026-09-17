import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n/I18nContext';

export function ProductOverview(): React.ReactElement {
  const { t } = useI18n();
  const points = [['product.oneTitle','product.oneBody'],['product.twoTitle','product.twoBody'],['product.threeTitle','product.threeBody']] as const;
  return <>
    <section id="product" className="product-section"><div className="section-container">
      <div className="section-intro"><p className="eyebrow">{t('product.eyebrow')}</p><h2>{t('product.title')}</h2><p>{t('product.body')}</p></div>
      <div className="point-grid">{points.map(([title, body], index) => <article key={title} className="point-card"><span>0{index + 1}</span><h3>{t(title)}</h3><p>{t(body)}</p></article>)}</div>
    </div></section>
    <section className="install-band"><div className="section-container install-layout">
      <div><p className="eyebrow">{t('product.installEyebrow')}</p><h2>{t('product.installTitle')}</h2></div>
      <Link className="btn-primary" to="/contact">{t('product.install')}</Link>
    </div></section>
  </>;
}

import { useI18n } from '../../i18n/I18nContext';
import './risk-evidence.css';

const SOURCE = 'https://www.verizon.com/business/resources/reports/dbir/';

export function WhyCispar(): React.ReactElement {
  const { locale } = useI18n();
  const es = locale === 'es';
  return <section className="risk-evidence section" aria-labelledby="risk-evidence-title">
    <div className="section-container">
      <div className="risk-evidence-intro" data-reveal>
        <h2 id="risk-evidence-title" className="section-title">{es ? 'El riesgo es real.' : 'The risk is real.'}</h2>
        <p>{es ? 'Un ataque puede dejarte sin acceso al correo, a los archivos o a los sistemas con los que trabajas. Revisar la exposición es un primer paso para decidir qué proteger.' : 'An attack can cut off access to the email, files or systems you work with. Reviewing exposure is a first step toward deciding what to protect.'}</p>
      </div>
      <dl className="risk-evidence-figures" data-reveal>
        <div><dt>48%</dt><dd>{es ? 'de las brechas analizadas involucró ransomware.' : 'of analyzed breaches involved ransomware.'}<p>{es ? 'Este tipo de ataque puede bloquear el acceso a los sistemas y usarse para extorsionar a la empresa.' : 'These attacks can block access to systems and be used to extort businesses.'}</p></dd></div>
        <div><dt>31%</dt><dd>{es ? 'de las brechas comenzó con vulnerabilidades de software.' : 'of breaches started with software vulnerabilities.'}<p>{es ? 'Una falla explotable puede abrir una puerta de entrada. Actualizar y revisar la exposición forma parte de reducir el riesgo.' : 'An exploitable flaw can become an entry point. Updating software and reviewing exposure helps reduce risk.'}</p></dd></div>
      </dl>
      <p className="risk-evidence-source"><a href={SOURCE} target="_blank" rel="noreferrer">{es ? 'Fuente: Verizon · Data Breach Investigations Report 2026' : 'Source: Verizon · Data Breach Investigations Report 2026'}</a><br />{es ? 'Datos del conjunto de brechas del informe; no indican la probabilidad de ataque a tu empresa ni son hallazgos de CISPAR. Periodo de incidentes: noviembre de 2024 a octubre de 2025.' : 'Figures describe the report’s breach dataset; they are not your company’s attack probability or CISPAR findings. Incident period: November 2024 to October 2025.'}</p>
      <button className="btn-primary" type="button" onClick={() => document.getElementById('assessment')?.scrollIntoView({behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'})}>{es ? 'Empezar con mi dominio' : 'Start with my domain'}</button>
    </div>
  </section>;
}

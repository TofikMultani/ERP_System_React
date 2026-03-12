function Card({ title, value, helper }) {
  return (
    <article className="erp-card">
      <div className="erp-card__head">
        <span className="erp-card__title">{title}</span>
        <span className="erp-card__accent" aria-hidden="true" />
      </div>
      <strong className="erp-card__value">{value}</strong>
      <p className="erp-card__helper">{helper}</p>
    </article>
  );
}

export default Card;

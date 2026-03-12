function Card({ title, value, helper }) {
  return (
    <article className="erp-card">
      <span className="erp-card__title">{title}</span>
      <strong className="erp-card__value">{value}</strong>
      <p className="erp-card__helper">{helper}</p>
    </article>
  );
}

export default Card;

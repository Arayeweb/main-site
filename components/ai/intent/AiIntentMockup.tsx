export default function AiIntentMockup({
  caption,
  cards,
}: {
  caption: string;
  cards: { label: string; text: string }[];
}) {
  return (
    <div className="ail-mockup" role="img" aria-label={caption}>
      <p className="ail-mockup-caption">{caption}</p>
      <div className="ail-mockup-grid">
        {cards.map((card) => (
          <div key={card.label} className="ail-mockup-card">
            <b>{card.label}</b>
            <p>{card.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

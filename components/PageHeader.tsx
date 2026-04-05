type PageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="space-y-4">
      <p className="ui-kicker">{eyebrow}</p>
      <div className="space-y-3">
        <h1 className="ui-title max-w-4xl">{title}</h1>
        <p className="ui-description max-w-3xl">{description}</p>
      </div>
    </div>
  );
}

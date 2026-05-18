type PopupStatusSummaryItem = {
  label: string;
  value: number;
};

type PopupStatusSummaryProps = {
  items: PopupStatusSummaryItem[];
};

export function PopupStatusSummary({ items }: PopupStatusSummaryProps) {
  return (
    <section className='grid gap-3 md:grid-cols-4'>
      {items.map((item) => (
        <article
          key={item.label}
          className='flex flex-col gap-2 rounded-md border p-4'
        >
          <span className='text-sm text-gray-500'>{item.label}</span>
          <strong className='text-2xl font-bold'>{item.value}</strong>
        </article>
      ))}
    </section>
  );
}

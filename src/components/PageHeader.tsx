interface PageHeaderProps {
  title: string;
  description?: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className='flex flex-col gap-1'>
      <h1 className='text-2xl font-bold'>{title}</h1>
      {description && <p className='text-sm text-gray-500'>{description}</p>}
    </div>
  );
}

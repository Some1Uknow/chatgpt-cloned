interface WelcomeMessageProps {
  title?: string;
}

export default function WelcomeMessage({ title = "How can I help you today?" }: WelcomeMessageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-normal text-white/90 mb-8">
          {title}
        </h1>
      </div>
    </div>
  );
}

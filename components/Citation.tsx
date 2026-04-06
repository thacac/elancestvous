import Image from "next/image";

interface CitationProps {
  text: string;
  author?: string;
  imageSrc?: string;
  imageAlt?: string;
}

export default function Citation({ text, author, imageSrc = "/coralie.png", imageAlt = "Coach Coralie" }: CitationProps) {
  return (
    <figure className="mt-12 max-w-2xl mx-auto text-muted text-lg italic flex flex-col items-center gap-4">
      <Image
        src={imageSrc}
        alt={imageAlt}
        width={80}
        height={80}
        className="rounded-full object-cover shadow-lg mb-2"
      />
      <blockquote className="text-center">"{text}"</blockquote>
      {author && <figcaption className="text-primary font-serif font-bold mt-2">{author}</figcaption>}
    </figure>
  );
}

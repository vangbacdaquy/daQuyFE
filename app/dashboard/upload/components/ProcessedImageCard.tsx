"use client";
 
import Image from "next/image";
 
interface ProcessedItem {
  imageURL: string;
  gsUri: string;
  imageID: string;
  ai_count: number;
  description: string;
  manual_count?: number;
  notes?: string;
}
 
interface ProcessedImageCardProps {
  item: ProcessedItem;
  index: number;
  onFieldChange: (index: number, field: 'manual_count' | 'notes', value: string | number) => void;
}
 
export function ProcessedImageCard({ item, index, onFieldChange }: ProcessedImageCardProps) {
  return (
    <div className="flex flex-col md:flex-row items-start gap-4 p-4 bg-sea-blue border border-sea-sub-blue rounded-lg">
      <div className="w-full md:w-1/3 flex-shrink-0">
        <div className="aspect-square relative rounded-lg overflow-hidden bg-black">
          <Image
            src={item.imageURL}
            alt={`Processed image ${item.imageID}`}
            fill
            className="object-cover"
          />
        </div>
      </div>
      <div className="w-full md:w-2/3">
        <h3 className="font-semibold text-white">
          Image ID:{" "}
          <span className="font-normal text-sm text-sea-gray break-all">
            {item.imageID}
          </span>
        </h3>
        <p className="font-semibold text-white mt-2">
          AI Count:{" "}
          <span className="font-bold text-sea-gold text-lg">{item.ai_count}</span>
        </p>
        <div className="mt-2">
          <label htmlFor={`manual_count_${index}`} className="font-semibold text-white">
            Manual Count:
          </label>
          <input
            id={`manual_count_${index}`}
            type="number"
            value={item.manual_count ?? ''}
            onChange={(e) => onFieldChange(index, 'manual_count', e.target.value)}
            className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />
        </div>
        <div className="mt-2">
          <label htmlFor={`notes_${index}`} className="font-semibold text-white">
            Notes:
          </label>
          <textarea
            id={`notes_${index}`}
            value={item.notes || ''}
            onChange={(e) => onFieldChange(index, 'notes', e.target.value)}
            rows={3}
            className="mt-1 block w-full p-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50"
          />
        </div>
        <p className="font-semibold text-white mt-2">AI Description:</p>
        <p className="text-sm text-sea-light-gray mt-1">{item.description}</p>
      </div>
    </div>
  );
}
 
 
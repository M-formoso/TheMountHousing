import { AlertCircle } from 'lucide-react'

interface Props {
  message: string
}

export function ErrorMessage({ message }: Props) {
  return (
    <div className="flex items-center gap-2 p-4 bg-red-50 text-red-600 border border-red-200 rounded-lg">
      <AlertCircle size={20} />
      <p className="text-sm">{message}</p>
    </div>
  )
}

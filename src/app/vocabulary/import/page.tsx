import { redirect } from 'next/navigation';

export default function VocabularyImportRedirectPage() {
    redirect('/settings?tab=vocabulary');
}

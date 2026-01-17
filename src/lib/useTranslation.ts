import { useLanguageStore } from './store';
import { translations, Language } from './translations';

export const useTranslation = () => {
    const { language } = useLanguageStore();

    // Helper to access nested keys like 'common.save'
    const t = (key: string) => {
        const keys = key.split('.');
        let value: any = translations[language];

        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                return key; // Fallback to key if not found
            }
        }

        return value;
    };

    return { t, language };
};

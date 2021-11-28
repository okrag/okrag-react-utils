import {
  Language,
  Localization,
  MessagesDictType,
  MessagesNamespaces,
  TranslationsMap,
} from "okrag-utils";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

const LocalizationContext = React.createContext<Localization<any>>(null as any);

LocalizationContext.displayName = "LocalizationContext";

export const useLocalizationClass = <MessagesType extends MessagesDictType = any>() => {
  return useContext(LocalizationContext) as Localization<MessagesType>;
};

export type useLocalizationHook<MessagesType extends MessagesDictType> = <
  MessagesKeys extends MessagesNamespaces<MessagesType>[],
>(
  ...messagesNamespaces: MessagesKeys
) => TranslationsMap<MessagesType, MessagesKeys>;

export const useSetLanguage = () => {
  const localizationClass = useLocalizationClass();

  const setLanguage = useCallback(
    (lang: Language) => {
      localizationClass.language = lang;
    },
    [localizationClass],
  );

  return setLanguage;
};

export const useTranslationTree = <MessagesType extends MessagesDictType>() => {
  const localizationClass = useLocalizationClass<MessagesType>();
  const [tree, setTree] = useState(localizationClass?.translations);

  useEffect(() => {
    if (!localizationClass) return;

    setTree(localizationClass.translations);

    return localizationClass.addEventListener("translationTreeChange", () => {
      setTree(localizationClass.translations);
    });
  }, [localizationClass]);

  return tree;
};

export const useLocalization = <
  MessagesKeys extends MessagesNamespaces<MessagesType>[],
  MessagesType extends MessagesDictType = any,
>(
  ...messagesNamespaces: MessagesKeys
) => {
  const tree = useTranslationTree<MessagesType>();

  const translations = useMemo(() => {
    const translations = {} as TranslationsMap<MessagesType, MessagesKeys>;

    messagesNamespaces.forEach((namespace) => {
      const messages = tree[namespace];

      for (const key in messages) {
        if (Object.prototype.hasOwnProperty.call(messages, key)) {
          const string = messages[key] as string;
          (translations as any)[key + "Message"] = string;
          (translations as any)[key] = (args?: Record<string, string | undefined>) => {
            if (!args) return string;
            let withArgs = string;
            Object.keys(args).forEach((key) => {
              withArgs = withArgs.replaceAll(`{${key}}`, args[key] ?? "");
            });
            return withArgs;
          };
        }
      }
    });

    return translations;
  }, [tree, messagesNamespaces]);

  return translations;
};

type Props = React.PropsWithChildren<{
  messages: MessagesDictType;
  defaultLanguage: Language;
  supportedLanguages: Language[];
  languageStorageKey: string;
}>;

export const LocalizationProvider = ({
  messages,
  defaultLanguage,
  supportedLanguages,
  languageStorageKey,
  children,
}: Props) => {
  const [localizationClass, setLocalizationClass] = useState<Localization<any>>(null as any);

  useEffect(() => {
    const localization = new Localization(
      messages,
      defaultLanguage,
      supportedLanguages,
      languageStorageKey,
    );
    localization.getLanguage();
    localization.createTranslationTree();
    setLocalizationClass(localization);
  }, [messages, defaultLanguage, supportedLanguages, languageStorageKey]);

  return (
    <LocalizationContext.Provider value={localizationClass}>
      {children}
    </LocalizationContext.Provider>
  );
};
